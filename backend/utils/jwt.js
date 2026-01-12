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
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

  // For cross-origin cookies to work, MUST have:
  // - secure: true (required for SameSite=None)
  // - sameSite: 'None' (required for cross-origin)
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
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
