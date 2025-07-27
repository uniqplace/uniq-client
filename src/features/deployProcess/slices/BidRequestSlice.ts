import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { BidRequest } from "../../../types";

export const getBidRequesByCreator = createAsyncThunk("getBidRequesByCreator",
    async ( _ , thunkAPI) => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/bidRequests/creator`,
            {
                withCredentials: true,
            }
        );
        return response.data.bidRequests ;
      } catch (error: any) {
        return thunkAPI.rejectWithValue(error.response?.data?.message);
      }
    }
  );

  const bidRequestSlice = createSlice({
    name: "bidRequests",
    initialState: {
      bidRequests: [] as BidRequest[],
      loading: true,
      error: null as string | null,
    },
    reducers: {
    },
    extraReducers: (builder) => {
      builder
      .addCase(getBidRequesByCreator.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBidRequesByCreator.fulfilled, (state, action) => {
        state.loading = false;
        state.bidRequests = action.payload;
      })
      .addCase(getBidRequesByCreator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
   });
}
  });
  export default bidRequestSlice.reducer;
