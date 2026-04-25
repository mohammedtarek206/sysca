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
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/halls', require('./routes/halls'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/notifications', require('./routes/notifications'));

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
    const User = require('./models/User');
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

app.get('/', (req, res) => {
  res.send('Academy API is running properly...');
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
    })
    .catch(err => console.log('MongoDB connection error:', err));
}

module.exports = app;
