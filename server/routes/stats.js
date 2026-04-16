const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const { auth, authorize } = require('../middleware/auth');

// Get overview stats (Admin only)
router.get('/', auth, authorize(['admin']), async (req, res) => {
  try {
    const studentCount = await User.countDocuments({ role: 'student' });
    const teacherCount = await User.countDocuments({ role: 'instructor' });
    const courseCount = await Course.countDocuments();
    
    const payments = await Payment.find();
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    res.json({
      students: studentCount,
      teachers: teacherCount,
      courses: courseCount,
      revenue: totalRevenue
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
