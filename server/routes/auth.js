const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ name, email, phone, password, role });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  console.log('Login request received for:', req.body.email);
  try {
    const { email, password } = req.body;
    if (!email || !password) {
       console.log('Login error: Missing email or password');
       return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log('Searching for user...');
    const user = await User.findOne({ email });
    if (!user) {
       console.log('Login error: User not found');
       return res.status(400).json({ message: 'Invalid credentials (U)' });
    }

    console.log('User found, comparing password...');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
       console.log('Login error: Password mismatch');
       return res.status(400).json({ message: 'Invalid credentials (P)' });
    }

    console.log('Password match, generating token...');
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '1d' }
    );
    
    console.log('Login successful!');
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    console.error('CRITICAL LOGIN ERROR:', err);
    res.status(500).json({ 
      message: 'Login Crash: ' + err.message, 
      stack: process.env.NODE_ENV === 'production' ? null : err.stack 
    });
  }
});

module.exports = router;
