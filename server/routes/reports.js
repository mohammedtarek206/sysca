const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const { auth, authorize } = require('../middleware/auth');

// Get Profit Report (Admin only)
router.get('/profit', auth, authorize(['admin']), async (req, res) => {
  try {
    const payments = await Payment.find();
    const totalIncome = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    
    // Calculate Teacher Expenses (Fixed Salaries + Commissions)
    const teachers = await User.find({ role: 'instructor' });
    let totalSalaries = 0;
    let totalCommissions = 0;

    for (const teacher of teachers) {
      totalSalaries += teacher.salary || 0;
      
      // Calculate Commissions for this teacher
      const assignedCourses = await Course.find({ instructors: teacher._id });
      for (const course of assignedCourses) {
        const enrolledStudentsCount = await User.countDocuments({ enrolledCourses: course._id, role: 'student' });
        totalCommissions += (course.price * (teacher.commissionRate / 100)) * enrolledStudentsCount;
      }
    }

    // Get Academy Expenses
    const academyExpenses = await Expense.find();
    const totalAcademyExpenses = academyExpenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      totalIncome,
      totalSalaries,
      totalCommissions,
      totalAcademyExpenses,
      netProfit: totalIncome - (totalSalaries + totalCommissions + totalAcademyExpenses)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Student Statement of Account
router.get('/student/:id', auth, async (req, res) => {
  try {
    // Check permissions (Admin or self)
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const student = await User.findById(req.params.id).populate('enrolledCourses').select('-password');
    const payments = await Payment.find({ student: req.params.id }).sort({ date: -1 });
    
    // Calculate Balance
    const totalRequired = student.enrolledCourses.reduce((sum, c) => sum + c.price, 0);
    const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

    res.json({
      student,
      payments,
      summary: {
        totalRequired,
        totalPaid,
        balance: totalRequired - totalPaid
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Teacher Statement of Account
router.get('/teacher/:id', auth, async (req, res) => {
  try {
    // Check permissions (Admin or self)
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const teacher = await User.findById(req.params.id).select('-password');
    const assignedCourses = await Course.find({ instructors: req.params.id });
    
    const courseDetails = [];
    let totalCommissionEarnings = 0;

    for (const course of assignedCourses) {
      const enrolledStudents = await User.find({ enrolledCourses: course._id, role: 'student' }).select('name phone');
      const studentsCount = enrolledStudents.length;
      const commission = (course.price * ((teacher.commissionRate || 0) / 100)) * studentsCount;
      totalCommissionEarnings += commission;
      
      courseDetails.push({
        _id: course._id,
        name: course.name,
        price: course.price,
        studentsCount,
        enrolledStudents,
        commissionEarned: commission
      });
    }

    res.json({
      teacher,
      courses: courseDetails,
      summary: {
        fixedSalary: teacher.salary || 0,
        totalCommissions: totalCommissionEarnings,
        totalEarnings: (teacher.salary || 0) + totalCommissionEarnings
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
