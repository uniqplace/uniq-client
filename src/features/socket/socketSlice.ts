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

export interface BidResponse {
  bidId: string;
  status: 'accepted' | 'rejected' | 'pending';
  message?: string;
  updatedAt?: string;
}

export interface SocketNotification {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'success' | 'error';
  createdAt?: string;
}

interface SocketState {
  bids: BidRequest[];
  bidResponses: BidResponse[];
  notifications: SocketNotification[];
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
    pushNewBidFromSocket(state, action: PayloadAction<BidRequest>) {
      state.bids.push(action.payload);
    },
    appendSocketBidResponse(state, action: PayloadAction<BidResponse>) {
      state.bidResponses.push(action.payload);
    },
    appendSocketNotification(state, action: PayloadAction<SocketNotification>) {
      state.notifications.push(action.payload);
    },
    clearSocketState(state) {
      state.bids = [];
      state.bidResponses = [];
      state.notifications = [];
    }
  },
});

export const {
  pushNewBidFromSocket,
  appendSocketBidResponse,
  appendSocketNotification,
  clearSocketState
} = socketSlice.actions;
export default socketSlice.reducer;
