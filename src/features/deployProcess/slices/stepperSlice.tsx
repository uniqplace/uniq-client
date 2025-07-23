import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { steps } from '../components/Stepper/steps';

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

const initialState: StepperState = {
  currentStepIndex: 0,
  completedSteps: new Array(steps.length).fill(false),
  product: null,
  loading: false,
  error: null,
};

// יצירת מוצר חדש
export const createProduct = createAsyncThunk<Product>(
  'stepper/createProduct',
  async (_, thunkAPI) => {
    try {
      const response = await axios.post(
        'http://localhost:5002/api/create-product',
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

// שליפת סטטוס מוצר
export const fetchProductStatus = createAsyncThunk<Product, string>(
  'stepper/fetchProductStatus',
  async (productId, thunkAPI) => {
    try {
      const response = await axios.get(
        `http://localhost:5002/api/create-product/${productId}/status`,
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

// עדכון שלב מוצר
export const updateProductStep = createAsyncThunk<
  Product,
  { productId: string; stepNumber: number }
>(
  'stepper/updateProductStep',
  async ({ productId, stepNumber }, thunkAPI) => {
    try {
      const stepName = steps[stepNumber - 1]?.title || steps[0].title;
      const response = await axios.patch(
        `http://localhost:5002/api/create-product/${productId}/step-${stepNumber}`,
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
      localStorage.setItem('currentStep', action.payload.toString());
    },
    goToNextStep(state) {
      if (
        state.completedSteps[state.currentStepIndex] &&
        state.currentStepIndex < steps.length - 1
      ) {
        state.currentStepIndex += 1;
        localStorage.setItem('currentStep', state.currentStepIndex.toString());
      }
    },
    goToPrevStep(state) {
      if (state.currentStepIndex > 0) {
        state.currentStepIndex -= 1;
        localStorage.setItem('currentStep', state.currentStepIndex.toString());
      }
    },
    markStepCompleted(state, action: PayloadAction<number>) {
      state.completedSteps[action.payload] = true;
      localStorage.setItem(
        'completedSteps',
        JSON.stringify(state.completedSteps)
      );
    },
    restoreStepperState(state) {
      const savedStep = localStorage.getItem('currentStep');
      const savedCompleted = localStorage.getItem('completedSteps');
      if (savedStep) state.currentStepIndex = parseInt(savedStep);
      if (savedCompleted) state.completedSteps = JSON.parse(savedCompleted);
    },
    clearStepper(state) {
      state.currentStepIndex = 0;
      state.completedSteps = new Array(steps.length).fill(false);
      state.product = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('productId');
      localStorage.removeItem('currentStep');
      localStorage.removeItem('completedSteps');
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
        localStorage.setItem('productId', action.payload._id);
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
        const idx = steps.findIndex(
          (s) => s.title === action.payload.CreationStatus
        );
        // עדכון אינדקס ושלבים שהושלמו
        state.currentStepIndex = idx >= 0 ? idx : 0;
        state.completedSteps = state.completedSteps.map((_, i) => i < idx);
      })
      .addCase(fetchProductStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // UPDATE STEP
      .addCase(updateProductStep.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductStep.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
        const idx = steps.findIndex(
          (s) => s.title === action.payload.CreationStatus
        );
        if (idx >= 0) {
          state.currentStepIndex = idx;
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
