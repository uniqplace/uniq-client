
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { BidRequest, BidResponse } from '../../types/socket';
import type { Notification } from '../../types/notification';


interface SocketState {
  bids: BidRequest[];
  bidResponses: BidResponse[];
  notifications: Notification[];
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
    appendSocketNotification(state, action: PayloadAction<Notification>) {
      state.notifications.push(action.payload);
    },
    clearBids(state) {
      state.bids = [];
    },
    clearBidResponses(state) {
      state.bidResponses = [];
    },
    clearNotifications(state) {
      state.notifications = [];
    }
  },
});

export const {
  pushNewBidFromSocket,
  appendSocketBidResponse,
  appendSocketNotification,
  clearBids,
  clearBidResponses,
  clearNotifications
} = socketSlice.actions;
export default socketSlice.reducer;
