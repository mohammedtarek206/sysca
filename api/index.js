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
app.get('/', (req, res) => {
  res.send('Academy API is running properly...');
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/academy_db';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
  })
  .catch(err => console.log('MongoDB connection error:', err));

module.exports = app;
