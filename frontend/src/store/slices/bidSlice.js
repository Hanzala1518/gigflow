import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import bidService from '../../services/bidService';

// Async thunks
export const createBid = createAsyncThunk(
  'bids/createBid',
  async (bidData, { rejectWithValue }) => {
    try {
      const data = await bidService.createBid(bidData);
      return data.data.bid;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBidsForGig = createAsyncThunk(
  'bids/fetchBidsForGig',
  async (gigId, { rejectWithValue }) => {
    try {
      const data = await bidService.getBidsForGig(gigId);
      return data.data.bids;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyBids = createAsyncThunk(
  'bids/fetchMyBids',
  async (_, { rejectWithValue }) => {
    try {
      const data = await bidService.getMyBids();
      return data.data.bids;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const hireBid = createAsyncThunk(
  'bids/hireBid',
  async (bidId, { rejectWithValue }) => {
    try {
      const data = await bidService.hireBid(bidId);
      return data.data.bid;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  gigBids: [], // Bids for a specific gig (owner view)
  myBids: [], // Bids placed by current user (freelancer view)
  isLoading: false,
  isHiring: false,
  error: null,
};

const bidSlice = createSlice({
  name: 'bids',
  initialState,
  reducers: {
    clearGigBids: (state) => {
      state.gigBids = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    resetBidState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Create Bid
      .addCase(createBid.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBid.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myBids.unshift(action.payload);
      })
      .addCase(createBid.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Bids For Gig
      .addCase(fetchBidsForGig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBidsForGig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gigBids = action.payload;
      })
      .addCase(fetchBidsForGig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch My Bids
      .addCase(fetchMyBids.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyBids.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myBids = action.payload;
      })
      .addCase(fetchMyBids.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Hire Bid
      .addCase(hireBid.pending, (state) => {
        state.isHiring = true;
        state.error = null;
      })
      .addCase(hireBid.fulfilled, (state, action) => {
        state.isHiring = false;
        // Update the hired bid
        const hiredBidId = action.payload._id;
        state.gigBids = state.gigBids.map((bid) => {
          if (bid._id === hiredBidId) {
            return { ...bid, status: 'hired' };
          }
          return { ...bid, status: 'rejected' };
        });
      })
      .addCase(hireBid.rejected, (state, action) => {
        state.isHiring = false;
        state.error = action.payload;
      });
  },
});

export const { clearGigBids, clearError, resetBidState } = bidSlice.actions;
export default bidSlice.reducer;
