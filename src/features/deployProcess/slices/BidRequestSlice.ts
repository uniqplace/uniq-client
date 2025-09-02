import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { BidRequest } from "../../../types";
import type { RootState } from '../../../store';

interface BidRequestState {
  bidRequests: BidRequest[];
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
      const manufacturerId = state.user?.manufacturerId;

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/bidRequests/manufacturer/${manufacturerId}`, {
        withCredentials: true,
      });
      return response.data.bidRequests;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);


const initialState: BidRequestState = {
  bidRequests: [] as BidRequest[],
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
      });
  }
});
export default bidRequestSlice.reducer;
