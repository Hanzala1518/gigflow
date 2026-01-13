require('dotenv').config();

const http = require('http');
const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const { connectDB, configureCors, getCorsOptions, initializeSocket } = require('./config');
const { authRoutes, gigRoutes, bidRoutes } = require('./routes');
const { errorHandler, notFound, apiLimiter } = require('./middleware');

// Initialize Express app
const app = express();

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Connect to database
connectDB();

// Get CORS options for Socket.io
const corsOptions = getCorsOptions();

// Initialize Socket.io (no longer needs corsOptions passed)
initializeSocket(server);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Needed for Socket.io
  contentSecurityPolicy: false, // Disable CSP for API
}));
app.use(configureCors());
app.use(express.json({ limit: '10kb' })); // Body parser with size limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Sanitize data to prevent NoSQL injection
app.use(mongoSanitize());

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GigFlow API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      gigs: '/api/gigs',
      bids: '/api/bids',
    },
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GigFlow API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bids', bidRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║                                           ║
  ║   🚀 GigFlow API Server                   ║
  ║                                           ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}              ║
  ║   Port: ${PORT}                              ║
  ║   URL: http://localhost:${PORT}              ║
  ║   Socket.io: Enabled                      ║
  ║                                           ║
  ╚═══════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

module.exports = { app, server };
