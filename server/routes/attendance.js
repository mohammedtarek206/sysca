const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { auth, authorize } = require('../middleware/auth');

// Get attendance records with filtering by course/student
router.get('/', auth, async (req, res) => {
  try {
    let filter = {};
    const { course, student, date } = req.query;
    if (course) filter.course = course;
    if (student) filter.student = student;
    if (date) {
        const start = new Date(date);
        start.setHours(0,0,0,0);
        const end = new Date(date);
        end.setHours(23,59,59,999);
        filter.date = { $gte: start, $lte: end };
    }
    
    if (req.user.role === 'student') {
      filter.student = req.user.id;
    }
    
    const records = await Attendance.find(filter)
      .populate('student', 'name email phone')
      .populate('course', 'name')
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Record attendance (Admin and Instructor only)
router.post('/', auth, authorize(['admin', 'instructor']), async (req, res) => {
  try {
    const { student, course, date, status } = req.body;
    // Check if record exists for same day
    const start = new Date(date || Date.now());
    start.setHours(0,0,0,0);
    const end = new Date(date || Date.now());
    end.setHours(23,59,59,999);

    let attendance = await Attendance.findOne({ student, course, date: { $gte: start, $lte: end } });
    if (attendance) {
        attendance.status = status;
        await attendance.save();
    } else {
        attendance = new Attendance({ student, course, date, status });
        await attendance.save();
    }
    
    res.json(attendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
