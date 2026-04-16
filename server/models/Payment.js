const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, // Optional: specific course payment
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['paid', 'unpaid', 'pending'], default: 'pending' },
  note: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
