const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');
const { authenticate, bidLimiter } = require('../middleware');

// All bid routes require authentication
router.use(authenticate);

// Get bids placed by the authenticated user
router.get('/my-bids', bidController.getMyBids);

// Create a new bid (with rate limiting to prevent spam)
router.post('/', bidLimiter, bidController.createBid);

// Hire a freelancer (gig owner only) - uses optimistic locking
router.patch('/:bidId/hire', bidController.hireBid);

// Reject a bid with optional message (gig owner only)
router.patch('/:bidId/reject', bidController.rejectBid);

// Get all bids for a specific gig (owner only)
router.get('/:gigId', bidController.getBidsForGig);

module.exports = router;
