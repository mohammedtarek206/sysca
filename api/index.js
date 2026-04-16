const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// Database Connection Middleware for Vercel Serverless
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/academy_db';
let cachedConn = null;

const connectDB = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return next();
    }
    
    if (!cachedConn) {
      cachedConn = mongoose.connect(MONGO_URI);
    }
    
    await cachedConn;
    next();
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
};

app.use(connectDB);

// Routes
app.use('/api/auth', require('../server/routes/auth'));
app.use('/api/users', require('../server/routes/users'));
app.use('/api/courses', require('../server/routes/courses'));
app.use('/api/payments', require('../server/routes/payments'));
app.use('/api/attendance', require('../server/routes/attendance'));
app.use('/api/stats', require('../server/routes/stats'));
app.use('/api/halls', require('../server/routes/halls'));
app.use('/api/reports', require('../server/routes/reports'));

// Root route for health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({
    status: 'Server is running',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    env: {
      hasMongoUri: !!process.env.MONGO_URI,
      nodeEnv: process.env.NODE_ENV
    }
  });
});

// One-time Database Initialization (Seeding)
app.get('/api/init-db', async (req, res) => {
  try {
    const User = require('../server/models/User');
    const email = 'admin@academy.com';
    
    let admin = await User.findOne({ email });
    if (admin) {
      return res.json({ message: 'Admin user already exists.' });
    }

    admin = new User({
      name: 'المدير العام',
      email: email,
      phone: '01012345678',
      password: 'admin123',
      role: 'admin'
    });
    
    await admin.save();
    res.json({ message: 'Admin user created successfully!', email: admin.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Isolated Login Route for Debugging
app.post('/api/auth/login', async (req, res) => {
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const User = require('../server/models/User');

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'البريد وكلمة المرور مطلوبان' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'بيانات الدخول غير صحيحة (U)' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'بيانات الدخول غير صحيحة (P)' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '1d' }
    );
    
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).send(`CRITICAL_LOGIN_ERROR: ${err.message}`);
  }
});

app.get('/', (req, res) => {
  res.send('Academy API is running properly...');
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('Connected to MongoDB (Local)');
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.log('MongoDB connection error:', err));
}

module.exports = app;
