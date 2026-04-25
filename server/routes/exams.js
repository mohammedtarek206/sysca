const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Exam = require('../models/Exam');
const Result = require('../models/Result');

// @route   POST api/exams
// @desc    Create an exam (Admin/Instructor)
router.post('/', auth, authorize(['admin', 'instructor']), async (req, res) => {
  try {
    const { title, course, date, maxScore } = req.body;
    const newExam = new Exam({
      title,
      course,
      instructor: req.user.id,
      date,
      maxScore
    });
    const exam = await newExam.save();
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET api/exams
// @desc    Get all exams (with optional course filter)
router.get('/', auth, async (req, res) => {
  try {
    const { course } = req.query;
    const filter = course ? { course } : {};
    const exams = await Exam.find(filter)
      .populate('course', 'name')
      .populate('instructor', 'name')
      .sort({ date: -1 });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET api/exams/:id/results
// @desc    Get results for a specific exam
router.get('/:id/results', auth, async (req, res) => {
  try {
    const results = await Result.find({ exam: req.params.id })
      .populate('student', 'name email');
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST api/exams/:id/results
// @desc    Submit/Update results for an exam
router.post('/:id/results', auth, authorize(['admin', 'instructor']), async (req, res) => {
  try {
    const { formData } = req.body; // Array of { studentId, score, note }
    
    const results = await Promise.all(formData.map(async (item) => {
      return await Result.findOneAndUpdate(
        { exam: req.params.id, student: item.studentId },
        { score: item.score, note: item.note },
        { upsert: true, new: true }
      );
    }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE api/exams/:id
// @desc    Delete exam and its results
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    await Result.deleteMany({ exam: req.params.id });
    res.json({ message: 'Exam and results deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
