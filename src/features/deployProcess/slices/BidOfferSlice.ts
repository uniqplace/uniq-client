

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { BidOffer } from "../../../types";

export const fetchBidOfferById = createAsyncThunk(
  "BidOffer/fetchById",
  async (bidOfferId: string, thunkAPI) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bidOffers/${bidOfferId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch offer');
      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch offer');
    }
  }
);
// Thunk to fetch offers by bidRequestId
export const fetchBidOffersByRequest = createAsyncThunk(
  "BidOffer/fetchByBidRequest",
  async (
    params: { bidRequestId: string; sort?: 'price' | 'rating' },
    thunkAPI
  ) => {
    try {
      console.log('Fetching offers for bidRequestId:', params.bidRequestId);
      
      const { bidRequestId, sort } = params;
      const url = `${import.meta.env.VITE_API_BASE_URL}/bidOffers/MyBidOffers/${bidRequestId}` +
        (sort ? `?sort=${sort}` : '');
        console.log('Constructed URL:', url);
        
      const response = await axios.get(url, {
        withCredentials: true,
      });
      return response.data.data; // assuming { success, data }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch offers');
    }
  }
);

export const AddBidOffer = createAsyncThunk("AddBidOffer",
    async (bidOffer: BidOffer, thunkAPI) => {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/bidOffers/${bidOffer.manufacturerId}`, bidOffer,
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

  const getInitialBidOffer = (): Partial<BidOffer> => ({
    price: -1,
    estimatedDelivery: '',
    note: '',
    attachmentUrl: '',
})

const bidOfferSlice = createSlice({
  name: "BidOffer",
  initialState: {
    bidOffer: getInitialBidOffer(),
    offers: [] as BidOffer[],
    loading: false,
    error: null as string | null
  },
  reducers: {
    resetBidOffer: (state) => {
      state.bidOffer = getInitialBidOffer();
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(AddBidOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(AddBidOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.bidOffer = action.payload;
      })
      .addCase(AddBidOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch offers by bidRequestId
      .addCase(fetchBidOffersByRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBidOffersByRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.offers = action.payload;
      })
      .addCase(fetchBidOffersByRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })




      .addCase(fetchBidOfferById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBidOfferById.fulfilled, (state, action) => {
        state.loading = false;
        state.bidOffer = action.payload;
      })
      .addCase(fetchBidOfferById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
   


  },
});
  
  export const { resetBidOffer } = bidOfferSlice.actions;

  export default bidOfferSlice.reducer;
