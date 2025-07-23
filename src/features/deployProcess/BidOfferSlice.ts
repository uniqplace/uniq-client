import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { BidOffer } from "../../types";

export const AddBidOffer = createAsyncThunk("AddBidOffer",
    async (bidOffer: BidOffer, thunkAPI) => {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/bidOffers`, bidOffer,
            {
                withCredentials: true,
            }
        );
        return response.data;
      } catch (error: any) {
        return thunkAPI.rejectWithValue(error.response?.data?.message);
      }
    }
  );

  const getInitialBidOffer = () => ({
    price: '',
    estimatedDelivery: '',
    note: '',
    attachmentUrl: '',
})

  const bidOfferSlice = createSlice({
    name: "BidOffer",
    initialState: {
      bidOffer: getInitialBidOffer(),
      loading: true,
      error: null as string | null,
    },
    reducers: {
    },
    extraReducers: (builder) => {
      builder
      .addCase(AddBidOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(AddBidOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.BidOffer = action.payload;
      })
      .addCase(AddBidOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
   });
}
  });
  export default BidOfferSlice.reducer;
