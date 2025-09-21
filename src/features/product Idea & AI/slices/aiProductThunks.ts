import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { ProductParam } from "./aiProductTypes";

export const generateDraft = createAsyncThunk(
  "aiProduct/generateDraft",
  async (payload: { userText: string; locale?: any }, thunkAPI) => {
    const state: any = thunkAPI.getState();
    const sessionId = state.aiProduct?.sessionId;
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/ai/spec/draft`, {
      sessionId,
      userPrompt: payload.userText,
      locale: payload.locale,
    });
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
    // Basic client-side validations
    for (const param of params) {
      if (param.requiredByAI && (param.value === undefined || param.value === null || param.value === "")) {
        return thunkAPI.rejectWithValue({
          error: `The parameter "${param.label}" is required and was not provided.`,
          paramId: param.id,
        });
      }
      if (param.type === "number" && param.value !== undefined && param.value !== null && param.value !== "") {
        if (isNaN(Number(param.value))) {
          return thunkAPI.rejectWithValue({
            error: `The parameter "${param.label}" must be a valid number.`,
            paramId: param.id,
          });
        }
      }
      if (param.type === "boolean" && param.value !== undefined && param.value !== null && param.value !== "") {
        if (!(param.value === true || param.value === false || param.value === "true" || param.value === "false")) {
          return thunkAPI.rejectWithValue({
            error: `The parameter "${param.label}" must be a boolean value (true/false).`,
            paramId: param.id,
          });
        }
      }
      if (param.type === "enum" && param.value !== undefined && param.value !== null && param.value !== "") {
        if (!param.enumOptions || !param.enumOptions.includes(param.value)) {
          return thunkAPI.rejectWithValue({
            error: `The parameter "${param.label}" must be one of: ${param.enumOptions?.join(", ")}.`,
            paramId: param.id,
          });
        }
      }
      if (param.type === "date" && param.value !== undefined && param.value !== null && param.value !== "") {
        if (isNaN(Date.parse(param.value))) {
          return thunkAPI.rejectWithValue({
            error: `The parameter "${param.label}" must be a valid date.`,
            paramId: param.id,
          });
        }
      }
      // file/text: add more validations as needed
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
