import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Order } from '../../../types';

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrders(state, action: PayloadAction<Order[]>) {
      state.orders = action.payload;
    },
    setSelectedOrder(state, action: PayloadAction<Order | null>) {
      state.selectedOrder = action.payload;
    },
    addOrder(state, action: PayloadAction<Order>) {
      state.orders.push(action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearOrders(state) {
      state.orders = [];
      state.selectedOrder = null;
      state.error = null;
    },
  },
});

export const {
  setOrders,
  setSelectedOrder,
  addOrder,
  setLoading,
  setError,
  clearOrders,
} = orderSlice.actions;

export default orderSlice.reducer;