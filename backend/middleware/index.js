const { authenticate, optionalAuth } = require('./auth');
const { errorHandler, notFound } = require('./error');

module.exports = {
  authenticate,
  optionalAuth,
  errorHandler,
  notFound,
};
