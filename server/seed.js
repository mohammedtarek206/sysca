const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Course = require('./models/Course');
const dotenv = require('dotenv');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/academy_db');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});

    // Create Admin
    const admin = new User({
      name: 'المدير العام',
      email: 'admin@academy.com',
      phone: '01012345678',
      password: 'admin123', // Will be hashed by pre-save hook
      role: 'admin'
    });
    await admin.save();

    // Create Instructors
    const instructor1 = new User({
      name: 'م. أحمد علي',
      email: 'ahmed@instructor.com',
      phone: '01122334455',
      password: 'instructor123',
      role: 'instructor'
    });
    await instructor1.save();

    const instructor2 = new User({
      name: 'د. سارة محمود',
      email: 'sara@instructor.com',
      phone: '01233445566',
      password: 'instructor123',
      role: 'instructor'
    });
    await instructor2.save();

    // Create Students
    const students = [
      { name: 'محمد حسن', email: 'mohammad@student.com', phone: '01511111111', role: 'student' },
      { name: 'ليلى يوسف', email: 'laila@student.com', phone: '01522222222', role: 'student' },
      { name: 'عمر خالد', email: 'omar@student.com', phone: '01533333333', role: 'student' }
    ];
    for (const s of students) {
      const student = new User({ ...s, password: 'student123' });
      await student.save();
    }

    // Create Courses
    const courses = [
      { name: 'كورس البرمجة للمبتدئين', price: 1500, duration: 'شهرين', instructor: instructor1._id },
      { name: 'أساسيات التصميم الجرافيكي', price: 1200, duration: 'شهر', instructor: instructor2._id },
      { name: 'إدارة الأعمال الاحترافية', price: 2000, duration: '3 أشهر', instructor: instructor1._id }
    ];
    await Course.insertMany(courses);

    console.log('Database seeded successfully!');
    process.exit();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seed();
