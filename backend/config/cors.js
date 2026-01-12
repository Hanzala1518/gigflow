const cors = require('cors');

/**
 * Get CORS configuration
 * Uses FRONTEND_URL environment variable for cross-origin requests
 */
const getCorsOptions = () => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  console.log('CORS configured for origin:', frontendUrl);

  return {
    origin: frontendUrl,
    credentials: true,
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
