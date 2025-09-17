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

// ==== Initial State ====
const initialState: ProductPayload = {
  sessionId: uuidv4(),
  params: [],
  audit: [],
  status: "idle",
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
      }
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
      })
      .addCase(refineSpec.pending, (state) => {
        state.status = "refining";
      })
      .addCase(refineSpec.fulfilled, (state, action) => {
        state.status = "idle";
        state.params = action.payload.updatedParams;
        state.summary = action.payload.summary;
      })
      .addCase(validateSpec.pending, (state) => {
        state.status = "validating";
      })
      .addCase(validateSpec.fulfilled, (state, action) => {
        state.status = action.payload.blocking ? "error" : "idle";
      })
      .addCase(lockSpec.fulfilled, (state) => {
        state.status = "locked";
      });
  },
});

export const { addParam, updateParam, skipParam } = aiProductSlice.actions;
export default aiProductSlice.reducer;
