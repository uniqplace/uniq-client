import marketplaceReducer from './features/marketplace/slices/marketplaceSlice'
import paymentsReducer from './features/payments/slices/paymentsSlice'
import userReducer from './features/marketplace/slices/userSlice'
import { configureStore } from '@reduxjs/toolkit';
import apiSlice from './api/apiSlice';
import authSliceReducer from "./features/auth/authSlice";
import { deployApi } from './features/deployProcess/slices/deployApiSlice';
import { locationApiSlice } from './features/deployProcess/slices/locationApiSlice';
import socketReducer from './features/socket/socketSlice';

export const store = configureStore({
  reducer: {
    marketplace: marketplaceReducer,
    payments: paymentsReducer,
    user: userReducer,
     auth: authSliceReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [deployApi.reducerPath]: deployApi.reducer,
    [locationApiSlice.reducerPath]: locationApiSlice.reducer,
    socket: socketReducer,
  },
  // Add the API middleware to the store
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware, deployApi.middleware, locationApiSlice.middleware),
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store