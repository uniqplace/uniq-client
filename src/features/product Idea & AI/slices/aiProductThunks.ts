import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { ProductParam } from "./aiProductTypes";
import { validateProductParams } from '../../../utils/productParamValidation';
function shapeDraftPayload(payload: { userText: string; locale?: any }, sessionId: string) {
  return {
    sessionId,
    userPrompt: payload.userText,
    locale: payload.locale,
  };
}
export const generateDraft = createAsyncThunk(
  "aiProduct/generateDraft",
  async (payload: { userText: string; locale?: any }, thunkAPI) => {
    const state: any = thunkAPI.getState();
    const sessionId = state.aiProduct?.sessionId;
    const shapedPayload = shapeDraftPayload(payload, sessionId);
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/ai/spec/draft`, shapedPayload);
    return res.data;
  }
);
export const refineSpec = createAsyncThunk(
  "aiProduct/refineSpec",
  async (payload: { userInstruction: string; params: ProductParam[]; locale?: any }, thunkAPI) => {
    const state: any = thunkAPI.getState();
    const sessionId = state.aiProduct?.sessionId;
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/ai/spec/refine`, {
      sessionId,
      ...payload,
    });
    return res.data;
  }
);
export const validateSpec = createAsyncThunk(
  "aiProduct/validateSpec",
  async (params: ProductParam[], thunkAPI) => {
    const validationError = validateProductParams(params);
    if (validationError) {
      return thunkAPI.rejectWithValue(validationError);
    }
    // If all is valid – send to server
    const state: any = thunkAPI.getState();
    const sessionId = state.aiProduct?.sessionId;
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/product/validate`, {
      sessionId,
      params,
    });
    return res.data;
  }
);
export const lockSpec = createAsyncThunk(
  "aiProduct/lockSpec",
  async (payload: { productData: any }, thunkAPI) => {
    const state: any = thunkAPI.getState();
    const sessionId = state.aiProduct?.sessionId;
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/product/lock`, {
      sessionId,
      ...payload.productData,
    });
    return res.data;
  }
);