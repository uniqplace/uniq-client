import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { ProductPayload } from "./aiProductTypes";
export const generateDraft = createAsyncThunk(
  "aiProduct/generateDraft",
  async (payload: { userPrompt: string; files: File[] }, thunkAPI) => {
    try {
      const state: any = thunkAPI.getState();
      const sessionId = state.aiProduct?.sessionId;
      const formData = new FormData();
      payload.files.forEach(f => console.log(f));
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
    } catch (e) {
      console.log("error in generateDraft", e);
    }
  }
);
export const refineSpec = createAsyncThunk(
  "aiProduct/refineSpec",
  async (
    payload: {
      userPrompt: string;
      productPayload: ProductPayload;
      files?: File[];   // :point_left: עדכון – מערך קבצים
    },
    thunkAPI
  ) => {
    try {
      console.log("in refineSpec");
      console.log("payload.productPayload:");
      console.log(payload.productPayload);
      const state: any = thunkAPI.getState();
      const sessionId = state.aiProduct?.sessionId;
      const formData = new FormData();
      formData.append("userInstruction", payload.userPrompt);
      formData.append("sessionId", sessionId);
      formData.append("productPayload", JSON.stringify(payload.productPayload));
      if (payload.files && payload.files.length > 0) {
        payload.files.forEach((file) => {
          console.log(" payload.files.f");
          console.log(file);
          formData.append("files", file); // :point_left: שולחים כ־"files"
        });
      }
      console.log(formData);
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/ai/spec/refine`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return res.data;
    } catch (e) {
      console.log("error in refineSpec", e);
    }
  });
export const lockSpec = createAsyncThunk(
  "aiProduct/lockSpec",
  async (payload: { category: any; productPayload: ProductPayload }, thunkAPI) => {
    console.log("in lockSpec thunk");
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