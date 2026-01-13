const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

/**
 * Authentication middleware
 * Verifies JWT from Authorization header and attaches user to request
 */
const authenticate = catchAsync(async (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Auth middleware - No Authorization header found');
    throw new AppError('Please log in to access this resource', 401);
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  console.log('Auth middleware - Token found:', token.substring(0, 20) + '...');

  // Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Token verified for user:', decoded.userId);
  } catch (error) {
    console.log('Auth middleware - Token verification failed:', error.message);
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Your session has expired. Please log in again', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token. Please log in again', 401);
    }
    throw new AppError('Authentication failed', 401);
  }

  // Check if user still exists
  const user = await User.findById(decoded.userId);
  if (!user) {
    console.log('Auth middleware - User not found:', decoded.userId);
    throw new AppError('User no longer exists', 401);
  }

  console.log('Auth middleware - User authenticated:', user.email);
  
  // Attach user to request
  req.user = user;
  next();
});

/**
 * Optional authentication middleware
 * Attaches user to request if token exists, but doesn't block if not
 */
const optionalAuth = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Token invalid or expired, continue without user
    }
  }

  next();
});

module.exports = {
  authenticate,
  optionalAuth,
};
