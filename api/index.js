// Vercel Serverless API Handler
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

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

// === ROUTES ===
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: 'vercel-serverless'
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'Smart Link Hub Backend API',
    version: '1.0.0',
    environment: 'production',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      links: '/api/links'
    }
  });
});

// Placeholder routes - these will be expanded
app.post('/api/users/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  // Temporary: Return mock token
  res.status(201).json({
    token: 'mock-jwt-token-' + Date.now(),
    user: { id: 1, email, name: name || email }
  });
});

app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  // Temporary: Return mock token
  res.status(200).json({
    token: 'mock-jwt-token-' + Date.now(),
    user: { id: 1, email, name: email.split('@')[0] }
  });
});

app.get('/api/links', (req, res) => {
  // Protected route - check for token
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.status(200).json({
    links: [],
    message: 'Database integration needed'
  });
});

app.post('/api/links', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.status(201).json({
    id: 1,
    ...req.body,
    message: 'Database integration needed'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    statusCode: 404,
    message: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

module.exports = app;
