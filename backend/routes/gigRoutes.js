const express = require('express');
const router = express.Router();
const gigController = require('../controllers/gigController');
const { authenticate } = require('../middleware');

// Public routes
router.get('/', gigController.getGigs);

// Protected routes (must come before /:id to prevent route conflicts)
router.get('/my-gigs', authenticate, gigController.getMyGigs);
router.post('/', authenticate, gigController.createGig);

// Public route with param (must come after named routes)
router.get('/:id', gigController.getGigById);

module.exports = router;
