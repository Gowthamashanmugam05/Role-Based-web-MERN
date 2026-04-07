const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register a new user
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let user = await User.findOne({ email });

        if (user && user.isVerified) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const otp = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        if (user) {
            // Unverified user requesting again
            user.name = name;
            user.password = password; // this triggers the pre-save hook for hashing, wait is that true? Yes, if modified
            user.otp = otp;
            user.otpExpires = otpExpires;
            await user.save();
        } else {
            user = await User.create({
                name,
                email,
                password,
                otp,
                otpExpires,
                isVerified: false
            });
        }

        await sendEmail({
            to: email,
            subject: 'Verify your Role-Based Job Matcher account',
            html: `<h1>Welcome to our platform!</h1><p>Your OTP for registration is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`
        });

        res.status(200).json({ message: 'OTP sent to email. Please verify.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login a user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            const otp = generateOTP();
            user.otp = otp;
            user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
            await user.save();

            await sendEmail({
                to: email,
                subject: 'Your Login OTP',
                html: `<p>Your OTP for login is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`
            });

            res.status(200).json({ message: 'OTP sent to email. Please verify.', requireOTP: true });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Verify OTP
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        user.lastLogin = Date.now();
        await user.save();

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
    registerUser,
    loginUser,
    verifyOTP,
    updateTimeSpent,
};
