import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import gigService from '../../services/gigService';

// Async thunks
export const fetchGigs = createAsyncThunk(
  'gigs/fetchGigs',
  async (search = '', { rejectWithValue }) => {
    try {
      const data = await gigService.getGigs(search);
      return data.data.gigs;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGigById = createAsyncThunk(
  'gigs/fetchGigById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await gigService.getGigById(id);
      return data.data.gig;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createGig = createAsyncThunk(
  'gigs/createGig',
  async (gigData, { rejectWithValue }) => {
    try {
      const data = await gigService.createGig(gigData);
      return data.data.gig;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyGigs = createAsyncThunk(
  'gigs/fetchMyGigs',
  async (_, { rejectWithValue }) => {
    try {
      const data = await gigService.getMyGigs();
      return data.data.gigs;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  gigs: [],
  myGigs: [], // Gigs created by the current user
  currentGig: null,
  isLoading: false,
  isLoadingMyGigs: false,
  error: null,
};

const gigSlice = createSlice({
  name: 'gigs',
  initialState,
  reducers: {
    clearCurrentGig: (state) => {
      state.currentGig = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateGigStatus: (state, action) => {
      const { gigId, status } = action.payload;
      if (state.currentGig && state.currentGig._id === gigId) {
        state.currentGig.status = status;
      }
      const gigIndex = state.gigs.findIndex((g) => g._id === gigId);
      if (gigIndex !== -1) {
        state.gigs[gigIndex].status = status;
      }
      // Also update in myGigs
      const myGigIndex = state.myGigs.findIndex((g) => g._id === gigId);
      if (myGigIndex !== -1) {
        state.myGigs[myGigIndex].status = status;
      }
    },
    resetGigState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Gigs
      .addCase(fetchGigs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGigs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gigs = action.payload;
      })
      .addCase(fetchGigs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Gig By ID
      .addCase(fetchGigById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGigById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGig = action.payload;
      })
      .addCase(fetchGigById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Gig
      .addCase(createGig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gigs.unshift(action.payload);
        state.myGigs.unshift(action.payload); // Also add to myGigs
      })
      .addCase(createGig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch My Gigs
      .addCase(fetchMyGigs.pending, (state) => {
        state.isLoadingMyGigs = true;
        state.error = null;
      })
      .addCase(fetchMyGigs.fulfilled, (state, action) => {
        state.isLoadingMyGigs = false;
        state.myGigs = action.payload;
      })
      .addCase(fetchMyGigs.rejected, (state, action) => {
        state.isLoadingMyGigs = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentGig, clearError, updateGigStatus, resetGigState } = gigSlice.actions;
export default gigSlice.reducer;
