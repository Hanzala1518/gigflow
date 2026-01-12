const cors = require('cors');

/**
 * Get CORS configuration
 */
const getCorsOptions = () => {
  const origin = process.env.CORS_ORIGIN || 'http://localhost:3000';

  // Support multiple origins (comma-separated in env)
  const allowedOrigins = origin.split(',').map((o) => o.trim());

  return {
    origin: (requestOrigin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!requestOrigin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(requestOrigin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['set-cookie'],
    optionsSuccessStatus: 200,
  };
};

/**
 * Configure CORS middleware
 */
const configureCors = () => {
  return cors(getCorsOptions());
};

module.exports = {
  configureCors,
  getCorsOptions,
};
