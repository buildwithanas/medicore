/**
 * server.js — MediCore HMS Backend
 * Main Express application entry point.
 *
 * Start:    node server.js
 * Dev mode: npm run dev  (uses nodemon)
 */

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const path       = require('path');
require('dotenv').config();

const app = express();

/* ─────────────────────────────────────────────────────
   SECURITY MIDDLEWARE
───────────────────────────────────────────────────── */
// Helmet sets secure HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow frontend to load images
}));

// CORS — allow your frontend origin
app.use(cors({
  origin:      process.env.CORS_ORIGIN || 'http://localhost:5500',
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Global rate limiter (100 requests per 15 min per IP)
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:      parseInt(process.env.RATE_LIMIT_MAX)        || 100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', globalLimiter);

// Stricter limiter for auth routes (10 attempts per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  message:  { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
});

/* ─────────────────────────────────────────────────────
   BODY PARSING & LOGGING
───────────────────────────────────────────────────── */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logger (dev=colorful, production=combined)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

/* ─────────────────────────────────────────────────────
   STATIC FILES (uploaded patient photos, lab docs)
───────────────────────────────────────────────────── */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ─────────────────────────────────────────────────────
   HEALTH CHECK
───────────────────────────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MediCore HMS API is running ✅',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/* ─────────────────────────────────────────────────────
   API ROUTES
───────────────────────────────────────────────────── */
const authRoutes        = require('./routes/authRoutes');
const patientRoutes     = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const doctorRoutes      = require('./routes/doctorRoutes');
const recordRoutes      = require('./routes/recordRoutes');
const dashboardRoutes   = require('./routes/dashboardRoutes');

app.use('/api/auth',         authLimiter, authRoutes);
app.use('/api/patients',     patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors',      doctorRoutes);
app.use('/api/records',      recordRoutes);
app.use('/api/dashboard',    dashboardRoutes);

/* ─────────────────────────────────────────────────────
   404 HANDLER
───────────────────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/* ─────────────────────────────────────────────────────
   GLOBAL ERROR HANDLER
───────────────────────────────────────────────────── */
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('Unhandled error:', err);

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'A record with this value already exists.' });
  }
  // MySQL FK violation
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ success: false, message: 'Referenced record does not exist.' });
  }

  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred.'
      : err.message,
  });
});

/* ─────────────────────────────────────────────────────
   START SERVER
───────────────────────────────────────────────────── */
const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  🏥  MediCore HMS API`);
  console.log(`  🚀  Running on http://localhost:${PORT}`);
  console.log(`  🌍  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  📋  Health: http://localhost:${PORT}/api/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});

module.exports = app;