import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';


import { stepsConfig } from '../components/Stepper/steps';
import type { BidRequest } from '../../../types';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

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
  currentStepIndex: number | null;
  completedSteps: boolean[];
  product: Product | null;
  loading: boolean;
  error: string | null;
  bidRequest?: BidRequest | null;
}

function getStepIndexByCreationStatus(creationStatus: string): number {
  const idx = stepsConfig.findIndex((step) => step.title === creationStatus);
  return idx >= 0 ? idx : 0;
}

const initialState: StepperState = {
  currentStepIndex: null,
  completedSteps: new Array(stepsConfig.length).fill(false),
  product: null,
  loading: false,
  error: null,
  bidRequest: null,
};

// Thunk to save bidRequest to server
export const saveBidRequest = createAsyncThunk(
  'stepper/saveBidRequest',
  async (bidRequest: BidRequest, thunkAPI) => {
    try {
      const response = await axios.post(
        `${apiBaseUrl}/bidRequests`,
        bidRequest,
        { withCredentials: true }
      );
      return response.data.bidRequest as BidRequest;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchBidRequestByProductId = createAsyncThunk(
  'stepper/fetchBidRequestByProductId',
  async (productId: string, thunkAPI) => {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/bidRequests/product/${productId}`,
        { withCredentials: true }
      );
      return response.data as BidRequest;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createProduct = createAsyncThunk<Product, Partial<Product>>(
  'stepper/createProduct',
  async (productData, thunkAPI) => {
    try {
      const response = await axios.post(
        `${apiBaseUrl}/create-product`,
        productData ?? {},
        { withCredentials: true }
      );
      return response.data as Product;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

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
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
export const fetchProductByUserID = createAsyncThunk<Product, string>(
  'stepper/fetchProductByUserID',
  async (userId, thunkAPI) => {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/create-product/user/${userId}`,
        { withCredentials: true }
      );
      return response.data as Product;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateProductStep = createAsyncThunk<
  Product,
  { productId: string; stepNumber: number }
>(
  'stepper/updateProductStep',
async ({ productId, stepNumber }, thunkAPI) => {
  try {
    const stepIndex = stepNumber - 1;
    if (stepIndex < 0 || stepIndex >= stepsConfig.length) {
      throw new Error(`Invalid stepNumber: ${stepNumber}`);
    }
    const stepName = stepsConfig[stepIndex].title;
      const response = await axios.patch(
        `${apiBaseUrl}/create-product/${productId}/step-${stepNumber}`,
        { step: stepName },
        { withCredentials: true }
      );
      
      return response.data as Product;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


export const fetchOpenBidRequestsByProductId = createAsyncThunk(
  'stepper/fetchOpenBidRequestsByProductId',
  async (productId: string, thunkAPI) => {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/bidRequests/product/${productId}`,
        { withCredentials: true }
      );
      console.log('Fetched open bid requests:', response.data);
      // Returns the first bid request from the array
      return response.data.bidRequests[0] as BidRequest;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
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
    setCompletedSteps(state, action: PayloadAction<boolean[]>) {

      state.completedSteps = action.payload;
      localStorage.setItem(LOCAL_STORAGE_KEYS.completedSteps, JSON.stringify(action.payload));
    },
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
      state.completedSteps = new Array(stepsConfig.length).fill(false);
      state.product = null;
      state.loading = false;
      state.error = null;
      state.bidRequest = null;
      localStorage.removeItem(LOCAL_STORAGE_KEYS.productId);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.currentStep);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.completedSteps);
    },
    setBidRequest(state, action: PayloadAction<BidRequest | null>) {
      state.bidRequest = action.payload;
    },
    clearBidRequest(state) {
      state.bidRequest = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(saveBidRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveBidRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.bidRequest = action.payload;
      })
      .addCase(saveBidRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOpenBidRequestsByProductId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOpenBidRequestsByProductId.fulfilled, (state, action) => {
        state.loading = false;
        state.bidRequest = action.payload;
      })
      .addCase(fetchOpenBidRequestsByProductId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchBidRequestByProductId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBidRequestByProductId.fulfilled, (state, action) => {
        state.loading = false;
        state.bidRequest = action.payload;
      })
      .addCase(fetchBidRequestByProductId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
        state.currentStepIndex = 0;
        state.completedSteps = new Array(stepsConfig.length).fill(false);
        localStorage.setItem(LOCAL_STORAGE_KEYS.productId, action.payload._id);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProductStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
        const idx = getStepIndexByCreationStatus(action.payload.CreationStatus);
        state.currentStepIndex = idx;
        state.completedSteps = state.completedSteps.map((_, i) => i < idx);
      })
      .addCase(fetchProductByUserID.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProductByUserID.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductByUserID.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
        const idx = getStepIndexByCreationStatus(action.payload.CreationStatus);
        state.currentStepIndex = idx;
        state.completedSteps = state.completedSteps.map((_, i) => i < idx);
      })
      .addCase(fetchProductStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
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
          state.completedSteps = state.completedSteps.map((_, i) => i < idx);
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
  markStepCompleted,
  restoreStepperState,
  clearStepper,
} = stepperSlice.actions;
export { getStepIndexByCreationStatus };
export default stepperSlice.reducer;
