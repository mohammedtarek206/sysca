const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true }, // e.g., "3 Months"
  instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  hall: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall' },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
