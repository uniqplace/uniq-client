import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Order, Payment } from '../../../types';

interface PaymentsState {
  orders: Order[];
  payments: Payment[];
  loading: boolean;
  error: string | null;
  selectedOrder: Order | null;
  selectedPayment: Payment | null;
}

const initialState: PaymentsState = {
  orders: [],
  payments: [],
  loading: false,
  error: null,
  selectedOrder: null,
  selectedPayment: null,
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    setPayments: (state, action: PayloadAction<Payment[]>) => {
      state.payments = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
    setSelectedPayment: (state, action: PayloadAction<Payment | null>) => {
      state.selectedPayment = action.payload;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.push(action.payload);
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: Order['status'] }>) => {
      const order = state.orders.find(o => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
      }
    },
    addPayment: (state, action: PayloadAction<Payment>) => {
      state.payments.push(action.payload);
    },
    updatePaymentStatus: (state, action: PayloadAction<{ paymentId: string; status: Payment['status'] }>) => {
      const payment = state.payments.find(p => p.id === action.payload.paymentId);
      if (payment) {
        payment.status = action.payload.status;
      }
    },
  },
});

export const {
  setOrders,
  setPayments,
  setLoading,
  setError,
  setSelectedOrder,
  setSelectedPayment,
  addOrder,
  updateOrderStatus,
  addPayment,
  updatePaymentStatus,
} = paymentsSlice.actions;

export default paymentsSlice.reducer; 