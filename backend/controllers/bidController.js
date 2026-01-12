const mongoose = require('mongoose');
const { Bid, Gig } = require('../models');
const { AppError, catchAsync } = require('../utils');
const { isValidObjectId } = require('../utils/validators');
const { emitToUser } = require('../config');

/**
 * @desc    Create a new bid on a gig
 * @route   POST /api/bids
 * @access  Private
 */
const createBid = catchAsync(async (req, res) => {
  const { gigId, message, price } = req.body;

  // Validate required fields
  if (!gigId || !message || price === undefined) {
    throw new AppError('Please provide gigId, message and price', 400);
  }

  // Validate gigId
  if (!isValidObjectId(gigId)) {
    throw new AppError('Invalid gig ID', 400);
  }

  // Validate price is a positive number
  if (typeof price !== 'number' || price < 1) {
    throw new AppError('Price must be a positive number', 400);
  }

  // Check if gig exists and is open
  const gig = await Gig.findById(gigId);
  if (!gig) {
    throw new AppError('Gig not found', 404);
  }

  if (gig.status !== 'open') {
    throw new AppError('Cannot bid on a gig that is not open', 400);
  }

  // Prevent users from bidding on their own gig
  if (gig.ownerId.toString() === req.user._id.toString()) {
    throw new AppError('You cannot bid on your own gig', 403);
  }

  // Check if user already placed a bid on this gig
  const existingBid = await Bid.findOne({
    gigId,
    freelancerId: req.user._id,
  });

  if (existingBid) {
    throw new AppError('You have already placed a bid on this gig', 400);
  }

  // Create bid
  const bid = await Bid.create({
    gigId,
    freelancerId: req.user._id,
    message,
    price,
    status: 'pending',
  });

  // Populate freelancer info for response
  await bid.populate('freelancerId', 'name email');
  await bid.populate('gigId', 'title');

  res.status(201).json({
    success: true,
    message: 'Bid placed successfully',
    data: {
      bid,
    },
  });
});

/**
 * @desc    Get all bids for a specific gig
 * @route   GET /api/bids/:gigId
 * @access  Private (Gig owner only)
 */
const getBidsForGig = catchAsync(async (req, res) => {
  const { gigId } = req.params;

  // Validate gigId
  if (!isValidObjectId(gigId)) {
    throw new AppError('Invalid gig ID', 400);
  }

  // Check if gig exists
  const gig = await Gig.findById(gigId);
  if (!gig) {
    throw new AppError('Gig not found', 404);
  }

  // Authorization: Only gig owner can view bids
  if (gig.ownerId.toString() !== req.user._id.toString()) {
    throw new AppError('You are not authorized to view bids for this gig', 403);
  }

  // Get all bids for this gig with freelancer info
  const bids = await Bid.find({ gigId })
    .populate('freelancerId', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bids.length,
    data: {
      bids,
    },
  });
});

/**
 * @desc    Get bids placed by the authenticated user
 * @route   GET /api/bids/my-bids
 * @access  Private
 */
const getMyBids = catchAsync(async (req, res) => {
  const bids = await Bid.find({ freelancerId: req.user._id })
    .populate('gigId', 'title description budget status')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bids.length,
    data: {
      bids,
    },
  });
});

/**
 * @desc    Hire a freelancer for a gig
 * @route   PATCH /api/bids/:bidId/hire
 * @access  Private (Gig owner only)
 * 
 * OPTIMISTIC LOCKING APPROACH:
 * ============================
 * This implementation uses optimistic locking via findOneAndUpdate with
 * conditions instead of MongoDB transactions. This approach:
 * 1. Uses atomic findOneAndUpdate to ensure gig is still "open" when updating
 * 2. Uses atomic findOneAndUpdate to ensure bid is still "pending" when hiring
 * 3. Works without requiring a MongoDB replica set
 * 
 * For production with high concurrency, consider:
 * - Using MongoDB transactions with a replica set
 * - Adding version fields for stricter optimistic locking
 */
const hireBid = catchAsync(async (req, res) => {
  const { bidId } = req.params;

  // Validate bidId format
  if (!isValidObjectId(bidId)) {
    throw new AppError('Invalid bid ID', 400);
  }

  // Fetch the bid
  const bid = await Bid.findById(bidId);
  
  if (!bid) {
    throw new AppError('Bid not found', 404);
  }

  // Check if bid is already processed
  if (bid.status !== 'pending') {
    throw new AppError(`Bid has already been ${bid.status}`, 400);
  }

  // Fetch the associated gig
  const gig = await Gig.findById(bid.gigId);
  
  if (!gig) {
    throw new AppError('Gig not found', 404);
  }

  // Authorization: Only the gig owner can hire
  if (gig.ownerId.toString() !== req.user._id.toString()) {
    throw new AppError('Only the gig owner can hire for this gig', 403);
  }

  // CRITICAL CHECK: Verify gig is still open
  if (gig.status !== 'open') {
    throw new AppError('This gig has already been assigned to another freelancer', 409);
  }

  // ===== ATOMIC UPDATE WITH OPTIMISTIC LOCKING =====
  // Use findOneAndUpdate with conditions to atomically check and update
  
  // 1. Atomically update the gig status (only if still "open")
  const updatedGig = await Gig.findOneAndUpdate(
    { _id: gig._id, status: 'open' }, // Only update if status is still "open"
    { status: 'assigned' },
    { new: true }
  );

  if (!updatedGig) {
    // Gig was already assigned by another request
    throw new AppError('This gig has already been assigned to another freelancer', 409);
  }

  // 2. Atomically update the selected bid to "hired" (only if still "pending")
  const updatedBid = await Bid.findOneAndUpdate(
    { _id: bidId, status: 'pending' }, // Only update if status is still "pending"
    { status: 'hired' },
    { new: true }
  );

  if (!updatedBid) {
    // Rollback gig status if bid update failed
    await Gig.findByIdAndUpdate(gig._id, { status: 'open' });
    throw new AppError('Bid was already processed', 409);
  }

  // 3. Reject all other pending bids for this gig
  await Bid.updateMany(
    {
      gigId: gig._id,
      _id: { $ne: bidId }, // Exclude the hired bid
      status: 'pending',   // Only update pending bids
    },
    { status: 'rejected' }
  );

  // Fetch the final bid with populated fields for the response
  const finalBid = await Bid.findById(bidId)
    .populate('freelancerId', 'name email')
    .populate('gigId', 'title status');

  // ===== REAL-TIME NOTIFICATION =====
  // Send notification to the hired freelancer via Socket.io
  const freelancerId = bid.freelancerId.toString();
  emitToUser(freelancerId, 'hired', {
    message: `You have been hired for "${gig.title}"`,
    gigId: gig._id,
    gigTitle: gig.title,
    bidId: bidId,
  });

  res.status(200).json({
    success: true,
    message: 'Freelancer hired successfully',
    data: {
      bid: finalBid,
    },
  });
});

module.exports = {
  createBid,
  getBidsForGig,
  getMyBids,
  hireBid,
};
