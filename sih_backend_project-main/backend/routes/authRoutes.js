const express = require('express');
const jwtLib = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/user');

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. REGISTER & GENERATE OTP
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });

    // Allow re-registering or re-sending OTP if user exists but is NOT verified
    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ message: "User already registered and verified." });
      }
      
      // Update existing unverified user with new hashed password and new OTP
      const otp = generateOTP();
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.otp = otp;
      user.expires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your OTP',
        text: `Your OTP is ${otp}. OTP expires in 10 minutes.`,
      });

      return res.status(200).json({ message: "New OTP sent to your email." });
    }

    // New User Registration
    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    user = new User({ email, password: hashedPassword, otp, expires });
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your OTP',
      text: `Your OTP is ${otp}. OTP expires in 10 minutes.`,
    });

    res.status(201).json({ message: "User registered. OTP sent to email." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. VERIFY OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.expires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.expires = undefined;
    await user.save();

    // Generate token upon successful OTP verification for auto-login
    const token = jwtLib.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ message: "Email verified successfully.", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(400).json({ message: "Invalid credentials or unverified user" });
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwtLib.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, message: "Logged in successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. LOGOUT
router.post('/logout', (req, res) => {
  res.json({ message: "Logged out successfully." });
});

module.exports = router;