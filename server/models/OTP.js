const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['register', 'login'],
    required: true
  },
  pendingUserData: {
    type: Object, // Store name, email, password, etc. temporarily
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // Document automatically deleted after 5 minutes (300 seconds)
  }
});

module.exports = mongoose.model('OTP', otpSchema);
