const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    gigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: [true, 'Gig ID is required'],
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Freelancer ID is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be at least 1'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'hired', 'rejected'],
        message: 'Status must be pending, hired, or rejected',
      },
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster lookups
bidSchema.index({ gigId: 1 });
bidSchema.index({ freelancerId: 1 });
bidSchema.index({ gigId: 1, freelancerId: 1 }, { unique: true }); // One bid per freelancer per gig

const Bid = mongoose.model('Bid', bidSchema);

module.exports = Bid;
