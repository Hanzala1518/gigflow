const connectDB = require('./database');
const { configureCors, getCorsOptions } = require('./cors');
const { initializeSocket, getIO, emitToUser } = require('./socket');

module.exports = {
  connectDB,
  configureCors,
  getCorsOptions,
  initializeSocket,
  getIO,
  emitToUser,
};
