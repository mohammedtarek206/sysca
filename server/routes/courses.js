const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// Get all courses (All roles can view, optional instructor filtering)
router.get('/', auth, async (req, res) => {
  try {
    const { instructor } = req.query;
    const filter = instructor ? { instructors: instructor } : {}; // Search within instructors array
    const courses = await Course.find(filter)
      .populate('instructors', 'name email phone')
      .populate('hall', 'name capacity');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single course
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructors', 'name')
      .populate('hall', 'name');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create course (Admin only)
router.post('/', auth, authorize(['admin']), async (req, res) => {
  const { name, price, duration, instructors, hall, schedule } = req.body;
  const course = new Course({ name, price, duration, instructors, hall, schedule });
  try {
    const newCourse = await course.save();

    // Mirroring: Update instructors profiles to include this course
    if (instructors && instructors.length > 0) {
      await User.updateMany(
        { _id: { $in: instructors } },
        { $addToSet: { assignedCourses: newCourse._id } }
      );
    }

    res.status(201).json(newCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update course (Admin only)
router.put('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Mirroring: Sync with User model if instructors changed
    if (req.body.instructors) {
      // 1. Remove course from all instructors first
      await User.updateMany(
        { assignedCourses: req.params.id },
        { $pull: { assignedCourses: req.params.id } }
      );
      // 2. Add course to currently assigned instructors
      await User.updateMany(
        { _id: { $in: req.body.instructors } },
        { $addToSet: { assignedCourses: updatedCourse._id } }
      );
    }

    res.json(updatedCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete course (Admin only)
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
