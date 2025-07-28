import marketplaceReducer from './features/marketplace/slices/marketplaceSlice'
import paymentsReducer from './features/payments/slices/paymentsSlice'
import userReducer from './features/user/slices/userSlice'
import { configureStore } from '@reduxjs/toolkit';
import apiSlice from './api/apiSlice';
import authSliceReducer from "./features/auth/authSlice";
import stepperReducer from './features/deployProcess/slices/stepperSlice';
import BidOfferSlice from './features/deployProcess/BidOfferSlice';
import socketReducer from './features/socket/socketSlice';


export const store = configureStore({
  reducer: {
    marketplace: marketplaceReducer,
    payments: paymentsReducer,
    user: userReducer,
     auth: authSliceReducer,
     bidOffer: BidOfferSlice,
     socket: socketReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    stepper: stepperReducer,
   // [deployApi.reducerPath]: deployApi.reducer,
  //[locationApiSlice.reducerPath]: locationApiSlice.reducer, 
  },

 

  // Add the API middleware to the store
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware ),
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store
