const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

let io;

/**
 * Initialize Socket.io server
 * @param {Object} server - HTTP server instance
 * @param {Object} corsOptions - CORS configuration
 */
const initializeSocket = (server, corsOptions) => {
  io = new Server(server, {
    cors: {
      origin: corsOptions.origin,
      credentials: true,
    },
  });

  // Authentication middleware for Socket.io
  io.use((socket, next) => {
    try {
      // Parse cookies from handshake
      const cookies = socket.handshake.headers.cookie;
      if (!cookies) {
        return next(new Error('Authentication required'));
      }

      const parsedCookies = cookie.parse(cookies);
      const token = parsedCookies.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user to their personal room for targeted notifications
    socket.join(`user:${socket.userId}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  console.log('Socket.io initialized');
  return io;
};

/**
 * Get Socket.io instance
 * @returns {Object} Socket.io server instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

/**
 * Emit a notification to a specific user
 * @param {string} userId - Target user ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
};
