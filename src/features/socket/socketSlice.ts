
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { BidRequest, BidResponse, SocketNotification } from '../../types/socket';


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
