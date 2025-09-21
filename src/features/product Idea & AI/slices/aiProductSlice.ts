// src/features/aiProduct/aiProductSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import type {
  ProductParam,
  ProductPayload,
} from "./aiProductTypes";
import {
  generateDraft,
  refineSpec,
  validateSpec,
  lockSpec,
} from "./aiProductThunks";

// ==== Local Storage Helpers ====
const LOCAL_STORAGE_KEY = 'aiProductState';

function saveToLocalStorage(state: ProductPayload) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // ignore
  }
}

function loadFromLocalStorage(): ProductPayload | undefined {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    // ignore
  }
  return undefined;
}

// ==== Initial State ====
const initialState: ProductPayload = loadFromLocalStorage() || {
  sessionId: uuidv4(),
  title: "",
  description: "",
  price: 0,
  images: [],
  creator: undefined,
  category: undefined,
  subCategories: [],
  status: "draft",
  condition: "new",
  location: "",
  tags: [],
  params: [],
  audit: [],
  summary: undefined,
  aiVersion: undefined,
  createdByAI: true
};

// ==== Slice ====
const aiProductSlice = createSlice({
  name: "aiProduct",
  initialState,
  reducers: {
    addParam(state, action: PayloadAction<ProductParam>) {
      state.params.push({ ...action.payload, source: "user" });
      state.audit.push({
        at: new Date().toISOString(),
        actor: "user",
        action: "add_param",
        details: { id: action.payload.id },
      });
      saveToLocalStorage(state);
    },
    updateParam(state, action: PayloadAction<{ id: string; value: any }>) {
      const param = state.params.find((p) => p.id === action.payload.id);
      if (param) {
        param.value = action.payload.value;
        param.status = "confirmed";
        state.audit.push({
          at: new Date().toISOString(),
          actor: "user",
          action: "update_param",
          details: { id: param.id, value: action.payload.value },
        });
        saveToLocalStorage(state);
      }
    },
    skipParam(state, action: PayloadAction<{ id: string; reason?: string }>) {
      const param = state.params.find((p) => p.id === action.payload.id);
      if (param) {
        param.status = "skipped";
        param.skipConfirmation = {
          confirmed: true,
          confirmedAt: new Date().toISOString(),
          reason: action.payload.reason,
        };
        state.audit.push({
          at: new Date().toISOString(),
          actor: "user",
          action: "skip_param",
          details: { id: param.id },
        });
        saveToLocalStorage(state);
      }
    },
    resetProductState() {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateDraft.pending, (state) => {
        state.status = "drafting";
      })
      .addCase(generateDraft.fulfilled, (state, action) => {
        state.status = "idle";
        state.params = action.payload.params;
        state.summary = action.payload.summary;
        state.category = action.payload.category;
        state.aiVersion = action.payload.aiVersion;
        if (action.payload.title) state.title = action.payload.title;
        if (action.payload.description) state.description = action.payload.description;
        if (action.payload.price) state.price = action.payload.price;
        if (action.payload.images) state.images = action.payload.images;
        if (action.payload.subCategories) state.subCategories = action.payload.subCategories;
        if (action.payload.condition) state.condition = action.payload.condition;
        if (action.payload.location) state.location = action.payload.location;
        if (action.payload.tags) state.tags = action.payload.tags;
        saveToLocalStorage(state);
      })
      .addCase(refineSpec.pending, (state) => {
        state.status = "refining";
      })
      .addCase(refineSpec.fulfilled, (state, action) => {
        state.status = "idle";
        state.params = action.payload.updatedParams;
        state.summary = action.payload.summary;
        saveToLocalStorage(state);
      })
      .addCase(validateSpec.pending, (state) => {
        state.status = "validating";
      })
      .addCase(validateSpec.fulfilled, (state, action) => {
        state.status = action.payload.blocking ? "error" : "idle";
        saveToLocalStorage(state);
      })
      .addCase(lockSpec.fulfilled, (state) => {
        state.status = "locked";
        saveToLocalStorage(state);
      });
  },
});

export const { addParam, updateParam, skipParam, resetProductState } = aiProductSlice.actions;
export default aiProductSlice.reducer;
