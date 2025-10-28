import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface RestockStepperState {
  currentStepIndex: number;
  completedSteps: boolean[];
  productId: string | null;
  selectedManufacturerId: string | null;
  bidRequestId: string | null;
}

const initialState: RestockStepperState = {
  currentStepIndex: 0,
  completedSteps: [],
  productId: null,
  selectedManufacturerId: null,
  bidRequestId: null,
};

const restockStepperSlice = createSlice({
  name: 'restockStepper',
  initialState,
  reducers: {
    setCurrentStepIndex(state, action: PayloadAction<number>) {
      state.currentStepIndex = action.payload;
    },
    setCompletedSteps(state, action: PayloadAction<boolean[]>) {
      state.completedSteps = action.payload;
    },
    setProductId(state, action: PayloadAction<string>) {
      state.productId = action.payload;
    },
    setSelectedManufacturerId(state, action: PayloadAction<string | null>) {
      state.selectedManufacturerId = action.payload;
    },
    setBidRequestId(state, action: PayloadAction<string | null>) {
      state.bidRequestId = action.payload;
    },
    resetRestockStepper(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setCurrentStepIndex,
  setCompletedSteps,
  setProductId,
  setSelectedManufacturerId,
  setBidRequestId,
  resetRestockStepper,
} = restockStepperSlice.actions;

export default restockStepperSlice.reducer;
