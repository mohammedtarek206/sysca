const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Material = require('../models/Material');

// @route   POST api/materials
// @desc    Upload material (Admin/Instructor)
router.post('/', auth, authorize(['admin', 'instructor']), async (req, res) => {
  try {
    const { title, type, url, course, description } = req.body;
    const newMaterial = new Material({
      title,
      type,
      url,
      course,
      description,
      uploadedBy: req.user.id
    });
    const material = await newMaterial.save();
    res.json(material);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET api/materials
// @desc    Get materials (filtered by course if provided)
router.get('/', auth, async (req, res) => {
  try {
    const { course } = req.query;
    let query = {};
    
    // Students only see materials for their enrolled courses (simplified here to see all or specific course)
    // Actually, fine-grained student filtering can be added later
    if (course) query.course = course;

    const materials = await Material.find(query)
      .populate('course', 'name')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE api/materials/:id
// @desc    Delete material
router.delete('/:id', auth, authorize(['admin', 'instructor']), async (req, res) => {
  try {
    await Material.findByIdAndDelete(req.params.id);
    res.json({ message: 'Material removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
