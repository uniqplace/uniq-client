import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { BidRequest } from "../../../types";
import type { RootState } from '../../../store';

interface BidRequestState {
  bidRequests: BidRequest[];
  currentBidRequest: BidRequest | null;
  loading: boolean;
  error: string | null;
}

export const getBidRequestsByCreator = createAsyncThunk<BidRequest[], void>("getBidRequesByCreator",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/bidRequests/creator`,
        {
          withCredentials: true,
        }
      );
      return response.data.bidRequests;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getBidRequestsForManufacturer = createAsyncThunk<BidRequest[], void>("getBidRequestsForManufacturer",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
     
      const userId = state.user?.id;

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/bidRequests/manufacturer/${userId}`, {
        withCredentials: true,
      });
      return response.data.bidRequests;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchBidRequestById = createAsyncThunk<BidRequest, string>(
  "bidRequests/fetchById",
  async (bidRequestId, thunkAPI) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/bidRequests/${bidRequestId}`, {
        withCredentials: true,
      });
      return response.data.bidRequest;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch bid request');
    }
  }
);

const initialState: BidRequestState = {
  bidRequests: [] as BidRequest[],
  currentBidRequest: null,
  loading: true,
  error: null,
};

const bidRequestSlice = createSlice({
  name: "bidRequests",
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBidRequestsByCreator.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBidRequestsByCreator.fulfilled, (state, action) => {
        state.loading = false;
        state.bidRequests = action.payload;
      })
      .addCase(getBidRequestsByCreator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getBidRequestsForManufacturer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBidRequestsForManufacturer.fulfilled, (state, action) => {
        state.loading = false;
        state.bidRequests = action.payload;
      })
      .addCase(getBidRequestsForManufacturer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchBidRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
  state.currentBidRequest = null;
      })
      .addCase(fetchBidRequestById.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBidRequest = action.payload;
        const existingBidRequestIndex = state.bidRequests.findIndex(bidRequest => bidRequest._id === updatedBidRequest._id);
        if (existingBidRequestIndex !== -1) {
          state.bidRequests[existingBidRequestIndex] = updatedBidRequest;
        } else {
          state.bidRequests.push(updatedBidRequest);
        }
  state.currentBidRequest = updatedBidRequest;
      })
      .addCase(fetchBidRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
  state.currentBidRequest = null;
      });
  }
});
export default bidRequestSlice.reducer;
