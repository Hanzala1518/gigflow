const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');
const { authenticate } = require('../middleware');

// All bid routes require authentication
router.use(authenticate);

// Get bids placed by the authenticated user
router.get('/my-bids', bidController.getMyBids);

// Create a new bid
router.post('/', bidController.createBid);

// Hire a freelancer (gig owner only) - uses MongoDB transactions
router.patch('/:bidId/hire', bidController.hireBid);

// Get all bids for a specific gig (owner only)
router.get('/:gigId', bidController.getBidsForGig);

module.exports = router;
