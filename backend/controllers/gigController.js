const { Gig } = require('../models');
const { AppError, catchAsync } = require('../utils');
const { isValidObjectId } = require('../utils/validators');

/**
 * @desc    Get all open gigs with optional search
 * @route   GET /api/gigs
 * @access  Public
 */
const getGigs = catchAsync(async (req, res) => {
  const { search } = req.query;

  // Build query - only fetch open gigs
  const query = { status: 'open' };

  // Add search filter if provided
  if (search && search.trim()) {
    query.title = { $regex: search.trim(), $options: 'i' };
  }

  const gigs = await Gig.find(query)
    .populate('ownerId', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: gigs.length,
    data: {
      gigs,
    },
  });
});

/**
 * @desc    Create a new gig
 * @route   POST /api/gigs
 * @access  Private
 */
const createGig = catchAsync(async (req, res) => {
  const { title, description, budget } = req.body;

  // Validate required fields
  if (!title || !description || budget === undefined) {
    throw new AppError('Please provide title, description and budget', 400);
  }

  // Validate budget is a positive number
  if (typeof budget !== 'number' || budget < 1) {
    throw new AppError('Budget must be a positive number', 400);
  }

  // Create gig with ownerId from authenticated user
  const gig = await Gig.create({
    title,
    description,
    budget,
    ownerId: req.user._id,
    status: 'open',
  });

  // Populate owner info for response
  await gig.populate('ownerId', 'name email');

  res.status(201).json({
    success: true,
    message: 'Gig created successfully',
    data: {
      gig,
    },
  });
});

/**
 * @desc    Get a single gig by ID
 * @route   GET /api/gigs/:id
 * @access  Public
 */
const getGigById = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!isValidObjectId(id)) {
    throw new AppError('Invalid gig ID', 400);
  }

  const gig = await Gig.findById(id).populate('ownerId', 'name email');

  if (!gig) {
    throw new AppError('Gig not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      gig,
    },
  });
});

/**
 * @desc    Get all gigs owned by the current user
 * @route   GET /api/gigs/my-gigs
 * @access  Private
 */
const getMyGigs = catchAsync(async (req, res) => {
  const gigs = await Gig.find({ ownerId: req.user._id })
    .populate('ownerId', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: gigs.length,
    data: {
      gigs,
    },
  });
});

module.exports = {
  getGigs,
  createGig,
  getGigById,
  getMyGigs,
};
