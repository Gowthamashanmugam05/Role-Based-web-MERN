const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// Register a new user
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let user = await User.findOne({ email });

        if (user && user.isVerified) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000;

        if (!user) {
            user = await User.create({
                name,
                email,
                password,
                otp,
                otpExpires,
            });
        } else {
            user.name = name;
            user.password = password;
            user.otp = otp;
            user.otpExpires = otpExpires;
            await user.save();
        }

        try {
            await sendEmail({
                email: user.email,
                subject: 'Job Matcher - Verification OTP',
                message: `Your OTP is ${otp}. It expires in 10 minutes.`,
                html: `<h1>Job Matcher OTP</h1><p>Your verification OTP is <strong>${otp}</strong>.</p><p>It will expire in 10 minutes.</p>`
            });

            res.status(200).json({
                message: 'OTP sent to your email. Please verify to complete your request.',
                email: user.email
            });
        } catch (error) {
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return res.status(500).json({ message: 'Error sending email' });
        }
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
            if (!user.isVerified) {
                return res.status(401).json({ message: 'Please verify your email first' });
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = Date.now() + 10 * 60 * 1000;
            
            user.otp = otp;
            user.otpExpires = otpExpires;
            await user.save();

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Job Matcher - Login OTP',
                    message: `Your login OTP is ${otp}. It expires in 10 minutes.`,
                    html: `<h1>Job Matcher Login OTP</h1><p>Your OTP for login is <strong>${otp}</strong>.</p><p>It will expire in 10 minutes.</p>`
                });

                res.json({
                    message: 'OTP sent to your email. Please verify to complete login.',
                    email: user.email
                });
            } catch (error) {
                user.otp = undefined;
                user.otpExpires = undefined;
                await user.save();
                return res.status(500).json({ message: 'Error sending email' });
            }
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
            message: 'Verification successful'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
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
