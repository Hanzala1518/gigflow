const express = require('express');
const router = express.Router();
const gigController = require('../controllers/gigController');
const { authenticate } = require('../middleware');

// Public routes
router.get('/', gigController.getGigs);
router.get('/:id', gigController.getGigById);

// Protected routes
router.post('/', authenticate, gigController.createGig);

module.exports = router;
