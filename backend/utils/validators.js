const mongoose = require('mongoose');

/**
 * Validate if a string is a valid MongoDB ObjectId
 * @param {string} id - The string to validate
 * @returns {boolean} True if valid ObjectId
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id;
};

module.exports = { isValidObjectId };
