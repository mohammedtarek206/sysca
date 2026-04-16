const express = require('express');
const router = express.Router();
const Hall = require('../models/Hall');
const { auth, authorize } = require('../middleware/auth');

// Get all halls
router.get('/', auth, async (req, res) => {
  try {
    const halls = await Hall.find().sort({ name: 1 });
    res.json(halls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create hall (Admin only)
router.post('/', auth, authorize(['admin']), async (req, res) => {
  const { name, capacity, description } = req.body;
  const hall = new Hall({ name, capacity, description });
  try {
    const newHall = await hall.save();
    res.status(201).json(newHall);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update hall (Admin only)
router.put('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const updatedHall = await Hall.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedHall);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete hall (Admin only)
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    await Hall.findByIdAndDelete(req.params.id);
    res.json({ message: 'Hall deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
