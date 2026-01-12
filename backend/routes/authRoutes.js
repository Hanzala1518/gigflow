const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { authenticate } = require('../middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
