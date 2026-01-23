const jwt = require('jsonwebtoken');
const env = require('../config/env');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      statusCode: 401,
      message: 'No token provided',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({
      statusCode: 403,
      message: 'Invalid token',
      timestamp: new Date().toISOString(),
    });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      statusCode: 403,
      message: 'Admin access required',
      timestamp: new Date().toISOString(),
    });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
