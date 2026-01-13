import { io } from 'socket.io-client';

let socket = null;

/**
 * Initialize Socket.io connection
 * Called after user authentication
 */
export const initializeSocket = () => {
  if (socket?.connected) {
    return socket;
  }

  // Connect to the backend server using the same URL as the API
  // Remove /api suffix if present since Socket.io connects to the root
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const serverUrl = apiUrl.replace(/\/api$/, '');

  // Get JWT token from localStorage
  const token = localStorage.getItem('gigflow_token');

  console.log('Socket.io connecting to:', serverUrl);

  socket = io(serverUrl, {
    auth: {
      token: token
    },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket.io connected');
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket.io disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.io connection error:', error.message);
  });

  return socket;
};

/**
 * Get the current socket instance
 */
export const getSocket = () => socket;

/**
 * Disconnect socket
 * Called on logout
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Subscribe to an event
 */
export const subscribeToEvent = (event, callback) => {
  if (socket) {
    socket.on(event, callback);
  }
};

/**
 * Unsubscribe from an event
 */
export const unsubscribeFromEvent = (event, callback) => {
  if (socket) {
    socket.off(event, callback);
  }
};

export default {
  initializeSocket,
  getSocket,
  disconnectSocket,
  subscribeToEvent,
  unsubscribeFromEvent,
};
