require('dotenv').config();

const http = require('http');
const express = require('express');
const cookieParser = require('cookie-parser');
const { connectDB, configureCors, getCorsOptions, initializeSocket } = require('./config');
const { authRoutes, gigRoutes, bidRoutes } = require('./routes');
const { errorHandler, notFound } = require('./middleware');

// Initialize Express app
const app = express();

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Connect to database
connectDB();

// Get CORS options for Socket.io
const corsOptions = getCorsOptions();

// Initialize Socket.io
initializeSocket(server, corsOptions);

// Middleware
app.use(configureCors());
app.use(express.json({ limit: '10kb' })); // Body parser with size limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
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
