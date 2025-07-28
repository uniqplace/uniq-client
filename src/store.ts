import marketplaceReducer from './features/marketplace/slices/marketplaceSlice'
import paymentsReducer from './features/payments/slices/paymentsSlice'
import userReducer from './features/user/slices/userSlice'
import { configureStore } from '@reduxjs/toolkit';
import authSliceReducer from "./features/auth/authSlice";
import BidOfferSlice from './features/deployProcess/slices/BidOfferSlice';
import BidRequestSlice from './features/deployProcess/slices/BidRequestSlice';
import stepperReducer from './features/deployProcess/slices/stepperSlice';
import socketReducer from './features/socket/socketSlice';
import apiSlice from './api/apiSlice';



export const store = configureStore({
  reducer: {
    marketplace: marketplaceReducer,
    payments: paymentsReducer,
    user: userReducer,
     auth: authSliceReducer,
     bidOffer: BidOfferSlice,
     bidRequest: BidRequestSlice,
    [apiSlice.reducerPath]: apiSlice.reducer,
    //[deployApi.reducerPath]: deployApi.reducer,
    //[locationApiSlice.reducerPath]: locationApiSlice.reducer,
     socket: socketReducer,
    stepper: stepperReducer,
  },

 

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).concat(apiSlice.middleware),
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store
