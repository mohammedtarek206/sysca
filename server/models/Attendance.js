const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['present', 'absent', 'late'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
