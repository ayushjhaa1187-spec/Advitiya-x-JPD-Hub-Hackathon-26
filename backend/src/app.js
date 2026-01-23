const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Main API routes
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Advitiya x JPD Hub Hackathon Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      products: '/api/products',
      orders: '/api/orders',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    statusCode: 404,
    message: 'Route not found',
    path: req.path,
    timestamp: new Date().toISOString(),
  });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
