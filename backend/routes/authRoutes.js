const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { authenticate, authLimiter } = require('../middleware');

// Public routes (with rate limiting to prevent brute-force attacks)
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
