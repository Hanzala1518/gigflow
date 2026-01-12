const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for a user
 * @param {string} userId - The user's MongoDB ObjectId
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Get cookie options for JWT token
 * @returns {Object} Cookie options
 */
const getCookieOptions = () => {
  const maxAge = parseInt(process.env.COOKIE_MAX_AGE) || 7 * 24 * 60 * 60 * 1000; // 7 days
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'lax', // Capital 'N' for 'None'
    maxAge,
  };
};

/**
 * Set JWT token in HttpOnly cookie
 * @param {Object} res - Express response object
 * @param {string} token - JWT token
 */
const setTokenCookie = (res, token) => {
  res.cookie('token', token, getCookieOptions());
};

/**
 * Clear JWT token cookie
 * @param {Object} res - Express response object
 */
const clearTokenCookie = (res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
};

module.exports = {
  generateToken,
  getCookieOptions,
  setTokenCookie,
  clearTokenCookie,
};
