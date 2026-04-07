const express = require('express');
const router = express.Router();
const { 
    registerSendOTP, 
    registerVerifyOTP, 
    loginSendOTP, 
    loginVerifyOTP, 
    resendOTP,
    updateTimeSpent 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register/send-otp', registerSendOTP);
router.post('/register/verify-otp', registerVerifyOTP);
router.post('/login/send-otp', loginSendOTP);
router.post('/login/verify-otp', loginVerifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/time', protect, updateTimeSpent);

module.exports = router;
