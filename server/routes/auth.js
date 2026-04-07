const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyOTP, updateTimeSpent } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify', verifyOTP);
router.post('/time', protect, updateTimeSpent);

module.exports = router;
