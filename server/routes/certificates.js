const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Certificate = require('../models/Certificate');
const User = require('../models/User');

// @route   POST api/certificates
// @desc    Issue a certificate (Admin only)
router.post('/', auth, authorize(['admin']), async (req, res) => {
  try {
    const { studentId, courseId, grade } = req.body;
    
    // Check if already exists
    let cert = await Certificate.findOne({ student: studentId, course: courseId });
    if (cert) return res.status(400).json({ message: 'Certificate already issued for this course' });

    const certificateId = 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const newCert = new Certificate({
      student: studentId,
      course: courseId,
      certificateId,
      grade
    });

    await newCert.save();
    res.json(newCert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET api/certificates
// @desc    Get certificates for current user (or all if admin)
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query = { student: req.user.id };
    }

    const certificates = await Certificate.find(query)
      .populate('student', 'name')
      .populate('course', 'name')
      .sort({ issueDate: -1 });
    res.json(certificates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
