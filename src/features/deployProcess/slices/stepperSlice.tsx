import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';


import { stepsConfig } from '../components/Stepper/steps';
import type { BidRequest } from '../../../types';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// const LOCAL_STORAGE_KEYS = {
//   productId: 'productId',
//   currentStep: 'currentStep',
//   completedSteps: 'completedSteps',
// };

export interface Product {
  _id: string;
  CreationStatus: string;
  title?: string;
}

interface ProductStepperState {
  product: Product | null;
  currentStepIndex: number | null;
  completedSteps: boolean[];
  loading: boolean;
  error: string | null;
  bidRequest?: BidRequest | null;
}

interface StepperState {
  productsInProgress: Record<string, ProductStepperState>;
  currentProductId: string | null;
}

const initialState: StepperState = {
  productsInProgress: {},
  currentProductId: null,
};

function getStepIndexByCreationStatus(creationStatus: string): number {
  const idx = stepsConfig.findIndex((step) => step.title === creationStatus);
  return idx >= 0 ? idx : 0;
}

function extractProductId(val: any): string | undefined {
  if (!val) return undefined;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && '_id' in val && typeof val._id === 'string') return val._id;
  return undefined;
}

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
      console.log('Created product🐶🐶🐶🐶:', response.data);
      
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
export const fetchProductByUserID = createAsyncThunk<Product[], string>(
  'stepper/fetchProductByUserID',
  async (userId, thunkAPI) => {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/create-product/user/${userId}`,
        { withCredentials: true }
      );
      return response.data as Product[];
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
        `${apiBaseUrl}/bidRequests/product/${productId}/open`,
        { withCredentials: true }
      );
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
    setCurrentProductId(state, action: PayloadAction<string | null>) {
      state.currentProductId = action.payload;
    },
    setCurrentStepIndex(state, action: PayloadAction<{ productId: string; stepIndex: number }>) {
      const { productId, stepIndex } = action.payload;
      if (!state.productsInProgress[productId]) return;
      state.productsInProgress[productId].currentStepIndex = stepIndex;
    },
    setCompletedSteps(state, action: PayloadAction<{ productId: string; completed: boolean[] }>) {
      const { productId, completed } = action.payload;
      if (!state.productsInProgress[productId]) return;
      state.productsInProgress[productId].completedSteps = completed;
    },
    markStepCompleted(state, action: PayloadAction<{ productId: string; stepIndex: number }>) {
      const { productId, stepIndex } = action.payload;
      if (!state.productsInProgress[productId]) return;
      state.productsInProgress[productId].completedSteps[stepIndex] = true;
    },
    clearStepper(state, action: PayloadAction<{ productId: string }>) {
      const { productId } = action.payload;
      delete state.productsInProgress[productId];
      if (state.currentProductId === productId) state.currentProductId = null;
    },
    // ...שאר reducers קיימים, יש לעדכן אותם לפעול לפי productId במידת הצורך...
  },

  extraReducers: (builder) => {
    builder
      .addCase(saveBidRequest.pending, (state, action) => {
        const productId = extractProductId(action.meta.arg.productId) || extractProductId(action.meta.arg._id) || state.currentProductId;
        if (!productId) return;
        const prod = state.productsInProgress[productId];
        if (prod) { prod.loading = true; prod.error = null; }
      })
      .addCase(saveBidRequest.fulfilled, (state, action) => {
        const productId = extractProductId(action.payload.productId) || state.currentProductId;
        if (!productId) return;
        const prod = state.productsInProgress[productId];
        if (prod) { prod.loading = false; prod.bidRequest = action.payload; }
      })
      .addCase(saveBidRequest.rejected, (state, action) => {
        const productId = extractProductId(action.meta.arg.productId) || extractProductId(action.meta.arg._id) || state.currentProductId;
        if (!productId) return;
        const prod = state.productsInProgress[productId];
        if (prod) { prod.loading = false; prod.error = action.payload as string; }
      })
      .addCase(fetchBidRequestByProductId.fulfilled, (state, action) => {
        const productId = extractProductId(action.payload.productId) || state.currentProductId;
        if (!productId) return;
        const prod = state.productsInProgress[productId];
        if (prod) { prod.bidRequest = action.payload; }
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        const productId = extractProductId(action.payload._id) || state.currentProductId;
        if (!productId) return;
        state.productsInProgress[productId] = {
          product: action.payload,
          currentStepIndex: 0,
          completedSteps: new Array(stepsConfig.length).fill(false),
          loading: false,
          error: null,
          bidRequest: null,
        };
        state.currentProductId = productId;
      })
      .addCase(fetchProductStatus.fulfilled, (state, action) => {
        const productId = extractProductId(action.payload._id) || state.currentProductId;
        if (!productId) return;
        const prod = state.productsInProgress[productId];
        if (prod) {
          prod.product = action.payload;
          prod.currentStepIndex = getStepIndexByCreationStatus(action.payload.CreationStatus);
        }
      })
      .addCase(fetchProductByUserID.fulfilled, (state, action) => {
        (action.payload as Product[]).forEach((product: Product) => {
          const productId = extractProductId(product._id);
          if (!productId) return;
          state.productsInProgress[productId] = {
            product,
            currentStepIndex: 0,
            completedSteps: new Array(stepsConfig.length).fill(false),
            loading: false,
            error: null,
            bidRequest: null,
          };
        });
      })
      .addCase(updateProductStep.fulfilled, (state, action) => {
        const productId = extractProductId(action.payload._id) || state.currentProductId;
        if (!productId) return;
        const prod = state.productsInProgress[productId];
        if (prod) {
          prod.product = action.payload;
          prod.currentStepIndex = getStepIndexByCreationStatus(action.payload.CreationStatus);
        }
      })
      .addCase(fetchOpenBidRequestsByProductId.fulfilled, (state, action) => {
        const productId = extractProductId(action.meta.arg) || state.currentProductId;
        console.log('[stepperSlice][fetchOpenBidRequestsByProductId.fulfilled]', { productId, payload: action.payload });
        if (!productId) return;
        const prod = state.productsInProgress[productId];
        if (prod) { prod.bidRequest = action.payload; }
      });
  },
});

export const {
  setCurrentProductId,
  setCurrentStepIndex,
  setCompletedSteps,
  markStepCompleted,
  clearStepper,
} = stepperSlice.actions;

export default stepperSlice.reducer;
