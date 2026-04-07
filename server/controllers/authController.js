const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateOTP, sendOTPEmail } = require('../utils/emailService');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const checkRateLimit = async (email, purpose) => {
    const lastOTP = await OTP.findOne({ email, purpose }).sort({ createdAt: -1 });
    if (lastOTP) {
        const timeDiff = (Date.now() - new Date(lastOTP.createdAt).getTime()) / 1000;
        if (timeDiff < 60) {
            throw new Error(`Please wait ${Math.ceil(60 - timeDiff)} seconds before requesting a new OTP`);
        }
    }
};

// 1. Register - Send OTP
const registerSendOTP = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        try {
            await checkRateLimit(email, 'register');
        } catch (error) {
            return res.status(429).json({ message: error.message });
        }

        await OTP.deleteMany({ email, purpose: 'register' });

        const otp = generateOTP();
        await OTP.create({
            email,
            otp,
            purpose: 'register',
            pendingUserData: { name, email, password }
        });

        await sendOTPEmail(email, otp, 'register');

        res.status(200).json({ message: 'OTP sent successfully to email' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Register - Verify OTP
const registerVerifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const otpRecord = await OTP.findOne({ email, otp, purpose: 'register' });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const { name, password } = otpRecord.pendingUserData;

        const user = await User.create({
            name,
            email,
            password,
        });

        await OTP.deleteMany({ email, purpose: 'register' });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Login - Send OTP
const loginSendOTP = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!(user && (await user.comparePassword(password)))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        try {
            await checkRateLimit(email, 'login');
        } catch (error) {
            return res.status(429).json({ message: error.message });
        }

        await OTP.deleteMany({ email, purpose: 'login' });

        const otp = generateOTP();
        await OTP.create({
            email,
            otp,
            purpose: 'login'
        });

        await sendOTPEmail(email, otp, 'login');

        res.status(200).json({ message: 'OTP sent successfully to email' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Login - Verify OTP
const loginVerifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const otpRecord = await OTP.findOne({ email, otp, purpose: 'login' });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = await User.findOne({ email });
        user.lastLogin = Date.now();
        await user.save();

        await OTP.deleteMany({ email, purpose: 'login' });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Resend OTP
const resendOTP = async (req, res) => {
    try {
        const { email, purpose } = req.body;

        try {
            await checkRateLimit(email, purpose);
        } catch (error) {
            return res.status(429).json({ message: error.message });
        }

        let pendingUserData = null;
        if (purpose === 'register') {
            const oldOTP = await OTP.findOne({ email, purpose: 'register' }).sort({ createdAt: -1 });
            if (!oldOTP || !oldOTP.pendingUserData) {
                return res.status(400).json({ message: 'Cannot resend registration OTP. Please start registration again.' });
            }
            pendingUserData = oldOTP.pendingUserData;
        }

        await OTP.deleteMany({ email, purpose });

        const otp = generateOTP();
        await OTP.create({
            email,
            otp,
            purpose,
            pendingUserData
        });

        await sendOTPEmail(email, otp, purpose);

        res.status(200).json({ message: 'OTP resent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Time Spent
const updateTimeSpent = async (req, res) => {
    try {
        const { seconds } = req.body;
        const user = await User.findById(req.user._id);
        
        if (user && seconds) {
            user.totalTimeSpent = (user.totalTimeSpent || 0) + seconds;
            await user.save();
            res.json({ message: 'Time updated', totalTimeSpent: user.totalTimeSpent });
        } else {
            res.status(404).json({ message: 'User not found or invalid time' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerSendOTP,
    registerVerifyOTP,
    loginSendOTP,
    loginVerifyOTP,
    resendOTP,
    updateTimeSpent,
};
