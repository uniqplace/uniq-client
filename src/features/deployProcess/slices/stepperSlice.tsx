import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { steps } from '../components/Stepper/steps';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Constants for localStorage keys to avoid repetition and errors
const LOCAL_STORAGE_KEYS = {
  productId: 'productId',
  currentStep: 'currentStep',
  completedSteps: 'completedSteps',
};

export interface Product {
  _id: string;
  CreationStatus: string;
  title?: string;
}

interface StepperState {
  currentStepIndex: number;
  completedSteps: boolean[];
  product: Product | null;
  loading: boolean;
  error: string | null;
}

// Helper function to map CreationStatus string to step index
function getStepIndexByCreationStatus(status: string): number {
  const idx = steps.findIndex((step) => step.title === status);
  return idx >= 0 ? idx : 0;
}

const initialState: StepperState = {
  currentStepIndex: 0,
  completedSteps: new Array(steps.length).fill(false),
  product: null,
  loading: false,
  error: null,
};

// Create a new product
export const createProduct = createAsyncThunk<Product>(
  'stepper/createProduct',
  async (_, thunkAPI) => {
    try {
      const response = await axios.post(
        `${apiBaseUrl}/create-product`,
        null,
        { withCredentials: true }
      );
      return response.data as Product;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// Fetch product status
export const fetchProductStatus = createAsyncThunk<Product, string>(
  'stepper/fetchProductStatus',
  async (productId, thunkAPI) => {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/create-product/${productId}/status`,
        { withCredentials: true }
      );
      return response.data as Product;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// Update product step
export const updateProductStep = createAsyncThunk<
  Product,
  { productId: string; stepNumber: number }
>(
  'stepper/updateProductStep',
  async ({ productId, stepNumber }, thunkAPI) => {
    try {
      const stepName = steps[stepNumber - 1]?.title || steps[0].title;
      const response = await axios.patch(
        `${apiBaseUrl}/create-product/${productId}/step-${stepNumber}`,
        { step: stepName },
        { withCredentials: true }
      );
      return response.data as Product;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

const stepperSlice = createSlice({
  name: 'stepper',
  initialState,
  reducers: {
    setCurrentStepIndex(state, action: PayloadAction<number>) {
      state.currentStepIndex = action.payload;
      localStorage.setItem(LOCAL_STORAGE_KEYS.currentStep, action.payload.toString());
    },
    goToNextStep(state) {
      if (
        state.completedSteps[state.currentStepIndex] &&
        state.currentStepIndex < steps.length - 1
      ) {
        state.currentStepIndex += 1;
        localStorage.setItem(LOCAL_STORAGE_KEYS.currentStep, state.currentStepIndex.toString());
      }
    },
    goToPrevStep(state) {
      if (state.currentStepIndex > 0) {
        state.currentStepIndex -= 1;
        localStorage.setItem(LOCAL_STORAGE_KEYS.currentStep, state.currentStepIndex.toString());
      }
    },
    // Marks a step as completed locally when user finishes the step.
    // This updates UI state and localStorage but does not sync with server.
    markStepCompleted(state, action: PayloadAction<number>) {
      state.completedSteps[action.payload] = true;
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.completedSteps,
        JSON.stringify(state.completedSteps)
      );
    },
    restoreStepperState(state) {
      const savedStep = localStorage.getItem(LOCAL_STORAGE_KEYS.currentStep);
      const savedCompleted = localStorage.getItem(LOCAL_STORAGE_KEYS.completedSteps);
      if (savedStep) state.currentStepIndex = parseInt(savedStep);
      if (savedCompleted) state.completedSteps = JSON.parse(savedCompleted);
    },
    clearStepper(state) {
      state.currentStepIndex = 0;
      state.completedSteps = new Array(steps.length).fill(false);
      state.product = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem(LOCAL_STORAGE_KEYS.productId);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.currentStep);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.completedSteps);
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE PRODUCT
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
        state.currentStepIndex = 0;
        state.completedSteps = new Array(steps.length).fill(false);
        localStorage.setItem(LOCAL_STORAGE_KEYS.productId, action.payload._id);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // FETCH STATUS
      .addCase(fetchProductStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
        const idx = getStepIndexByCreationStatus(action.payload.CreationStatus);
        // Update current step index and completed steps based on server status
        state.currentStepIndex = idx;
        state.completedSteps = state.completedSteps.map((_, i) => i < idx);
      })
      .addCase(fetchProductStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // UPDATE STEP
      // Updates the product step based on server response
      // and syncs current step and completed steps accordingly
      .addCase(updateProductStep.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductStep.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
        const idx = getStepIndexByCreationStatus(action.payload.CreationStatus);
        if (idx >= 0) {
          state.currentStepIndex = idx;
          // Mark all steps up to current as completed, reflecting server's status
          state.completedSteps = state.completedSteps.map((_, i) => i <= idx);
        }
      })
      .addCase(updateProductStep.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentStepIndex,
  goToNextStep,
  goToPrevStep,
  markStepCompleted,
  restoreStepperState,
  clearStepper,
} = stepperSlice.actions;

export default stepperSlice.reducer;
