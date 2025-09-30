import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { ProductParam } from "./aiProductTypes";

export const generateDraft = createAsyncThunk(
  "aiProduct/generateDraft",
  async (payload: { userText: string; locale?: any }, thunkAPI) => {
    const state: any = thunkAPI.getState();
    const sessionId = state.aiProduct?.sessionId;
    const res = await axios.post("/api/ai/spec/draft", {
      sessionId,
      ...payload,
    });
    return res.data;
  }
);

export const refineSpec = createAsyncThunk(
  "aiProduct/refineSpec",
  async (payload: { userInstruction: string; params: ProductParam[]; locale?: any }, thunkAPI) => {
    const state: any = thunkAPI.getState();
    const sessionId = state.aiProduct?.sessionId;
    const res = await axios.post("/api/ai/spec/refine", {
      sessionId,
      ...payload,
    });
    return res.data;
  }
);

export const validateSpec = createAsyncThunk(
  "aiProduct/validateSpec",
  async (params: ProductParam[], thunkAPI) => {
    const state: any = thunkAPI.getState();
    const sessionId = state.aiProduct?.sessionId;
    const res = await axios.post("/api/product/validate", {
      sessionId,
      params,
    });
    return res.data;
  }
);

export const lockSpec = createAsyncThunk(
  "aiProduct/lockSpec",
  async (payload: { category: any; params: ProductParam[] }, thunkAPI) => {
    const state: any = thunkAPI.getState();
    const sessionId = state.aiProduct?.sessionId;
    const res = await axios.post("/api/product/lock", {
      sessionId,
      ...payload,
    });
    return res.data;
  }
);
