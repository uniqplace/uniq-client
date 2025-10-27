import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { ProductPayload } from "./aiProductTypes";
export const generateDraft = createAsyncThunk(
  "aiProduct/generateDraft",
  async (payload: { userPrompt: string; files: File[] }, thunkAPI) => {
    try {
      const state: any = thunkAPI.getState();
      const sessionId = state.aiProduct?.sessionId;
      // If there are files, use FormData
      if (payload.files && payload.files.length > 0) {
        const formData = new FormData();
        if (payload.userPrompt) formData.append("userPrompt", payload.userPrompt);
        payload.files.forEach((file) => formData.append("files", file));
        formData.append("sessionId", sessionId);
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/ai/spec/draft`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        return res.data;
      } else {
        // No files, send as JSON
        const requestBody = {
          userPrompt: payload.userPrompt,
          sessionId,
        };
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/ai/spec/draft`,
          requestBody,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        return res.data;
      }
    } catch (e) {
      console.error("error in generateDraft", e);
      return thunkAPI.rejectWithValue(e);
    }
  }
);
export const refineSpec = createAsyncThunk(
  "aiProduct/refineSpec",
  async (
    payload: {
      userPrompt: string;
      productPayload: ProductPayload;
      files?: File[];
      forcedSkips?: string[];
      forcedKeeps?: string[];
      aiVersion?: string;
    },
    thunkAPI
  ) => {
    try {
      const state: any = thunkAPI.getState();
      const sessionId = state.aiProduct?.sessionId;
      if (payload.files && payload.files.length > 0) {
        const formData = new FormData();
        formData.append("userInstruction", payload.userPrompt);
        formData.append("sessionId", sessionId);
        formData.append("productPayload", JSON.stringify(payload.productPayload));
        if (payload.forcedSkips) formData.append("forcedSkips", JSON.stringify(payload.forcedSkips));
        if (payload.forcedKeeps) formData.append("forcedKeeps", JSON.stringify(payload.forcedKeeps));
        if (payload.productPayload.locale) formData.append("locale", JSON.stringify(payload.productPayload.locale));
        payload.files.forEach((file) => {
          formData.append("files", file);
        });
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/ai/spec/refine`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        return res.data;
      } else {
        const requestBody = {
          sessionId,
          userInstruction: payload.userPrompt,
          params: payload.productPayload.params,
          forcedSkips: payload.forcedSkips || [],
          forcedKeeps: payload.forcedKeeps || [],
          locale: payload.productPayload.locale,
        };
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/ai/spec/refine`,
          requestBody,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        return res.data;
      }
    } catch (e) {
      console.error("error in refineSpec", e);
      return thunkAPI.rejectWithValue(e);
    }
  });
export const lockSpec = createAsyncThunk(
  "aiProduct/lockSpec",
  async (
    payload: { category: any; productPayload: ProductPayload; productData?: any },
    thunkAPI
  ) => {
    const state: any = thunkAPI.getState();
    const sessionId = state.aiProduct?.sessionId;
    const userId = state.auth?.userId;
    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/ai/product/lock`,
      {
        userId,
        sessionId,
        ...payload,
      },
      {
        withCredentials: true,
      }
    );
    return res.data;
  }
);