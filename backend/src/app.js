const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const hubRoutes = require('./routes/hubs');
const linkRoutes = require('./routes/links');
const analyticsRoutes = require('./routes/analytics');
const ruleRoutes = require('./routes/rules');
const userRoutes = require('./routes/users');

const app = express();

// === MIDDLEWARE ===
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// === RATE LIMITING ===
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // strict limit for auth
  message: 'Too many authentication attempts, please try again later'
});

app.use('/api/', generalLimiter);

// === HEALTH CHECK ===
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    message: 'Smart Link Hub Backend API is running'
  });
});

// === API INFO ===
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'Smart Link Hub Backend API',
    version: '1.0.0',
    description: 'Backend API for Advitiya x JPD Hub Hackathon',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      hubs: '/api/hubs',
      links: '/api/links',
      analytics: '/api/analytics',
      rules: '/api/rules',
      health: '/api/health'
    },
    documentation: 'See API-STRUCTURE.md for detailed endpoint documentation'
  });
});

// === ROUTE REGISTRATION ===
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hubs', hubRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/rules', ruleRoutes);

// === 404 HANDLER (MUST BE AFTER ALL ROUTES) ===
app.use((req, res) => {
  res.status(404).json({
    statusCode: 404,
    message: 'Endpoint not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    suggestion: 'Please refer to API documentation at /api/health for available endpoints'
  });
});

// === ERROR HANDLER (MUST BE LAST) ===
app.use(errorHandler);

module.exports = app;
