const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

/**
 * Authentication middleware
 * Verifies JWT from HttpOnly cookies and attaches user to request
 */
const authenticate = catchAsync(async (req, res, next) => {
  // Get token from cookies
  const token = req.cookies.token;

  if (!token) {
    throw new AppError('Please log in to access this resource', 401);
  }

  // Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
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
    throw new AppError('User no longer exists', 401);
  }

  // Attach user to request
  req.user = user;
  next();
});

/**
 * Optional authentication middleware
 * Attaches user to request if token exists, but doesn't block if not
 */
const optionalAuth = catchAsync(async (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    try {
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
