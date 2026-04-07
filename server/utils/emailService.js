const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (toEmail, otp, purpose) => {
  try {
    const isLogin = purpose === 'login';
    const subject = isLogin ? 'Login Verification Code' : 'Account Registration Verification Code';
    const actionText = isLogin ? 'login to your account' : 'complete your registration';

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: subject,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; background-color: #0d1117; color: #c9d1d9; padding: 40px 20px; text-align: center; border-radius: 8px;">
          <h2 style="color: #58a6ff; margin-bottom: 20px;">Verification Required</h2>
          <p style="font-size: 16px; margin-bottom: 30px;">You have requested to ${actionText}. Please use the following One-Time Password (OTP) to proceed.</p>
          <div style="background-color: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 8px; display: inline-block; margin-bottom: 30px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #fff;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #8b949e;">This code will expire in 5 minutes.</p>
          <p style="font-size: 12px; color: #8b949e; margin-top: 40px; border-top: 1px solid #30363d; padding-top: 20px;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send verification email');
  }
};

module.exports = { generateOTP, sendOTPEmail };
