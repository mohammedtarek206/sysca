const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { auth, authorize } = require('../middleware/auth');

// Get all payments (Admin only) or personal payments (Student)
router.get('/', auth, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'student') {
      filter = { student: req.user.id };
    }
    const payments = await Payment.find(filter).populate('student', 'name email').sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create payment record (Admin only)
router.post('/', auth, authorize(['admin']), async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update payment status (Admin only)
router.put('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get financial statistics (Admin only)
router.get('/stats', auth, authorize(['admin']), async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
    ]);
    res.json(stats[0] || { totalRevenue: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
