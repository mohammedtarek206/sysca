const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['rent', 'electricity', 'water', 'salary', 'marketing', 'maintenance', 'other'],
    default: 'other'
  },
  date: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
