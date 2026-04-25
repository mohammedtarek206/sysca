const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Expense = require('../models/Expense');

// @route   POST api/expenses
// @desc    Add an expense
router.post('/', auth, authorize(['admin']), async (req, res) => {
  try {
    const { title, amount, category, date, note } = req.body;
    const newExpense = new Expense({ title, amount, category, date, note });
    await newExpense.save();
    res.json(newExpense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET api/expenses
// @desc    Get all expenses
router.get('/', auth, authorize(['admin']), async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE api/expenses/:id
// @desc    Delete an expense
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
