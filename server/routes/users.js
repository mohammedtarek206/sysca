const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const { auth, authorize } = require('../middleware/auth');

// Get all users with optional role filtering (Admin only)
router.get('/', auth, authorize(['admin']), async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create user (Admin only - for adding students/teachers)
router.post('/', auth, authorize(['admin']), async (req, res) => {
  try {
    const { name, email, phone, password, role, salary, commissionRate, assignedCourses } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ name, email, phone, password, role, salary, commissionRate, assignedCourses });
    await user.save();

    // Mirroring: Update courses to include this new teacher
    if (assignedCourses && assignedCourses.length > 0) {
      await Course.updateMany(
        { _id: { $in: assignedCourses } },
        { $addToSet: { instructors: user._id } }
      );
    }

    res.status(201).json({ message: 'User created successfully', user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update user (Admin or self)
router.put('/:id', auth, async (req, res) => {
  try {
    const oldUser = await User.findById(req.params.id);
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    
    // Mirroring: Sync with Course model if assignedCourses changed
    if (req.body.assignedCourses && updatedUser.role === 'instructor') {
      // 1. Remove teacher from all courses first (to handle deletions)
      await Course.updateMany(
        { instructors: updatedUser._id },
        { $pull: { instructors: updatedUser._id } }
      );
      // 2. Add teacher to the currently assigned courses
      await Course.updateMany(
        { _id: { $in: req.body.assignedCourses } },
        { $addToSet: { instructors: updatedUser._id } }
      );
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete user (Admin only)
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
