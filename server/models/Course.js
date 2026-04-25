const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true }, // e.g., "3 Months"
  schedule: [{
    day: { type: String, enum: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
    startTime: String, // e.g., "14:00"
    endTime: String    // e.g., "16:00"
  }],
  instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  hall: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall' },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
