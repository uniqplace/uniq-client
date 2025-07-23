
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface BidManufacturer {
  manufacturer: string; // ObjectId as string
  status: 'read' | 'unread';
}

export interface BidRequest {
  _id?: string;
  creatorId: string;
  productId: string;
  categoryId: string;
  locationPreference: string;
  priceRange: { min: number; max: number };
  deliveryTimeframe: string;
  deliveryMethod: 'pickup' | 'shipping';
  status: 'open' | 'closed' | 'expired';
  manufacturers: BidManufacturer[];
  createdAt: string;
  updatedAt: string;
}


interface SocketState {
  bids: BidRequest[];
  bidResponses: any[];
  notifications: any[];
}

const initialState: SocketState = {
  bids: [],
  bidResponses: [],
  notifications: [],
};


const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    addBid(state, action: PayloadAction<BidRequest>) {
      state.bids.push(action.payload);
    },
    addBidResponse(state, action: PayloadAction<any>) {
      state.bidResponses.push(action.payload);
    },
    addNotification(state, action: PayloadAction<any>) {
      state.notifications.push(action.payload);
    },
    clearSocketState(state) {
      state.bids = [];
      state.bidResponses = [];
      state.notifications = [];
    }
  },
});

export const { addBid, addBidResponse, addNotification, clearSocketState } = socketSlice.actions;
export default socketSlice.reducer;
