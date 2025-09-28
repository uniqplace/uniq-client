import marketplaceReducer from './features/marketplace/slices/marketplaceSlice'
import paymentsReducer from './features/payments/slices/paymentsSlice'
import userReducer from './features/user/slices/userSlice'
import { configureStore } from '@reduxjs/toolkit';
import authSliceReducer from "./features/auth/authSlice";
import BidOfferSlice from './features/deployProcess/slices/BidOfferSlice';
import BidRequestSlice from './features/deployProcess/slices/BidRequestSlice';
import stepperReducer from './features/deployProcess/slices/stepperSlice';
import socketReducer from './features/socket/socketSlice';
import manufacturerReducer from './features/user/slices/manufacturerSlice';
import apiSlice from './api/apiSlice';
import orderSlice from './features/order/slices/orderSlice';
import chatReducer from './features/chat/chatSlice'; 
import chatPopupReducer from './features/chat/popupSlice';


export const store = configureStore({
  reducer: {
    marketplace: marketplaceReducer,
    payments: paymentsReducer,
    user: userReducer,
    auth: authSliceReducer,
    bidOffer: BidOfferSlice,
    bidRequest: BidRequestSlice,
    [apiSlice.reducerPath]: apiSlice.reducer,
    socket: socketReducer,
    stepper: stepperReducer,
    manufacturer: manufacturerReducer,
    order: orderSlice,
  chat: chatReducer, 
  chatPopup: chatPopupReducer,
  },



  // Add the API middleware to the store
  // temporary
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).concat(apiSlice.middleware),
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store
