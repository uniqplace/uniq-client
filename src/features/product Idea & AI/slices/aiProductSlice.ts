// src/features/aiProduct/aiProductSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";   
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

// ==== Types ====
export type ParamStatus = "confirmed" | "missing" | "skipped";
export type ParamSource = "ai" | "user";
export type ParamType = "text" | "number" | "boolean" | "color" | "enum" | "file" | "date";

export interface ProductParam {
  id: string;
  label: string;
  type: ParamType;
  requiredByAI: boolean;
  status: ParamStatus;
  value?: any;
  unit?: string;
  enumOptions?: string[];
  source: ParamSource;
  skipConfirmation?: {
    confirmed: true;
    confirmedAt: string;
    reason?: string;
  };
  notes?: string;
  validation?: { valid: boolean; issues?: string[] };
}

export interface ProductSummary {
  requiredTotal: number;
  requiredConfirmed: number;
  requiredSkippedApproved: number;
  requiredMissing: number;
  optionalProvided: number;
  addedByUser: number;
  completenessScore: number;
  blocking: boolean;
}

export interface AuditEntry {
  at: string;
  actor: "user" | "system" | "ai";
  action: string;
  details?: any;
}

export interface ProductPayload {
  sessionId: string;
  productName?: string;
  category?: { id: string; name: string; confidence: number };
  aiVersion?: string;
  params: ProductParam[];
  summary?: ProductSummary;
  audit: AuditEntry[];
  locale?: { currency?: string; units?: "metric" | "imperial"; language?: string };
  status: "idle" | "drafting" | "refining" | "validating" | "locked" | "error";
  error?: string;
}

// ==== Initial State ====
const initialState: ProductPayload = {
  sessionId: uuidv4(),
  params: [],
  audit: [],
  status: "idle",
};

// ==== Thunks ====
export const generateDraft = createAsyncThunk(
  "aiProduct/generateDraft",
  async (payload: { userText: string; locale?: any }, thunkAPI) => {
    const state: any = thunkAPI.getState();
    const sessionId = state.aiProduct?.sessionId || initialState.sessionId;
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
    const sessionId = state.aiProduct?.sessionId || initialState.sessionId;
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
    const sessionId = state.aiProduct?.sessionId || initialState.sessionId;
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
    const sessionId = state.aiProduct?.sessionId || initialState.sessionId;
    const res = await axios.post("/api/product/lock", {
      sessionId,
      ...payload,
    });
    return res.data;
  }
);

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
