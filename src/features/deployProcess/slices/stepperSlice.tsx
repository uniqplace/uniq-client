// src/features/stepper/stepperSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type{ PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { steps } from '../components/Stepper/steps';
import type{ Product } from '../../../types';

interface StepperState {
  currentStepIndex: number;
  completedSteps: string[];
  product: Product | null;
  loading: boolean;
}

const initialState: StepperState = {
  currentStepIndex: 0,
  completedSteps: [],
  product: null,
  loading: false,
};

// --- API Calls ---
export const createProduct = createAsyncThunk('stepper/createProduct', async () => {
  const response = await axios.post('/api/products');
  const product: Product = response.data;
  localStorage.setItem('productId', product._id);
  return product;
});

export const fetchProductStatus = createAsyncThunk(
  'stepper/fetchStatus',
  async (productId: string) => {
    const response = await axios.get(`/api/products/${productId}`);
    return response.data as Product;
  }
);

export const updateProductStatus = createAsyncThunk(
  'stepper/updateStatus',
  async (stepId: string, { getState }) => {
    const state = getState() as { stepper: StepperState };
    const productId = state.stepper.product?._id;
    if (!productId) throw new Error('No product to update');
    const response = await axios.patch(`/api/products/${productId}/status`, { status: stepId });
    return response.data as Product;
  }
);

const stepperSlice = createSlice({
  name: 'stepper',
  initialState,
  reducers: {
    completeStep: (state, action: PayloadAction<string>) => {
      if (!state.completedSteps.includes(action.payload)) {
        state.completedSteps.push(action.payload);
      }
    },
    goToStep: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      const allCompleted = steps.slice(0, index).every(s => state.completedSteps.includes(s.id));
      if (allCompleted) state.currentStepIndex = index;
    },
    goToNextStep: (state) => {
      const next = state.currentStepIndex + 1;
      if (next < steps.length && state.completedSteps.includes(steps[state.currentStepIndex].id)) {
        state.currentStepIndex = next;
      }
    },
    goToPrevStep: (state) => {
      if (state.currentStepIndex > 0) state.currentStepIndex--;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
        state.currentStepIndex = steps.findIndex(s => s.id === action.payload.status);
        if (state.currentStepIndex === -1) state.currentStepIndex = 0;
      })
      .addCase(fetchProductStatus.fulfilled, (state, action) => {
        state.product = action.payload;
        const currentIndex = steps.findIndex(s => s.id === action.payload.status);
        state.currentStepIndex = currentIndex !== -1 ? currentIndex : 0;
      })
      .addCase(updateProductStatus.fulfilled, (state, action) => {
        state.product = action.payload;
        const index = steps.findIndex(s => s.id === action.payload.status);
        state.currentStepIndex = index !== -1 ? index : state.currentStepIndex;
      });
  },
});

export const { completeStep, goToStep, goToNextStep, goToPrevStep } = stepperSlice.actions;
export default stepperSlice.reducer;
