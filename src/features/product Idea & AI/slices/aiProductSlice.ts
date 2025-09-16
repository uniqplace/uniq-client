// features/aiProduct/aiProductSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type ParamStatus = "confirmed" | "missing" | "skipped";
type ParamSource = "ai" | "user";
type ParamType = "text" | "number" | "boolean" | "color" | "enum" | "file" | "date";

interface ProductParam {
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

interface ProductPayload {
  sessionId: string;
  productName?: string;
  category: { id: string; name: string; confidence: number };
  aiVersion?: string;
  params: ProductParam[];
  summary: {
    requiredTotal: number;
    requiredConfirmed: number;
    requiredSkippedApproved: number;
    requiredMissing: number;
    optionalProvided: number;
    addedByUser: number;
    completenessScore: number;
    blocking: boolean;
  };
  audit: Array<{
    at: string;
    actor: "user" | "system" | "ai";
    action: string;
    details?: any;
  }>;
  locale?: { currency?: string; units?: "metric" | "imperial"; language?: string };
}

interface AiProductState {
  payload: ProductPayload | null;
}

const initialState: AiProductState = {
  payload: null,
};

const aiProductSlice = createSlice({
  name: "aiProduct",
  initialState,
  reducers: {
    setPayload(state, action: PayloadAction<ProductPayload>) {
      state.payload = action.payload;
    },
    confirmParam(state, action: PayloadAction<{ id: string; value: any }>) {
      if (!state.payload) return;
      const param = state.payload.params.find(p => p.id === action.payload.id);
      if (param) {
        param.status = "confirmed";
        param.value = action.payload.value;
        param.source = "user";
        param.validation = { valid: true };
      }
    },
    skipParam(state, action: PayloadAction<{ id: string; reason?: string }>) {
      if (!state.payload) return;
      const param = state.payload.params.find(p => p.id === action.payload.id);
      if (param) {
        param.status = "skipped";
        param.skipConfirmation = {
          confirmed: true,
          confirmedAt: new Date().toISOString(),
          reason: action.payload.reason,
        };
      }
    },
    addParam(state, action: PayloadAction<ProductParam>) {
      if (!state.payload) return;
      state.payload.params.push({
        ...action.payload,
        source: "user",
      });
    },
    updateSummary(state) {
      if (!state.payload) return;
      const required = state.payload.params.filter(p => p.requiredByAI);
      const optional = state.payload.params.filter(p => !p.requiredByAI);

      state.payload.summary = {
        requiredTotal: required.length,
        requiredConfirmed: required.filter(p => p.status === "confirmed").length,
        requiredSkippedApproved: required.filter(p => p.status === "skipped").length,
        requiredMissing: required.filter(p => p.status === "missing").length,
        optionalProvided: optional.filter(p => p.status === "confirmed").length,
        addedByUser: state.payload.params.filter(p => p.source === "user").length,
        completenessScore: Math.round(
          (required.filter(p => p.status === "confirmed" || p.status === "skipped").length / required.length) * 100
        ),
        blocking: required.some(p => p.status === "missing"),
      };
    },
    finalizeProduct(state) {
      if (!state.payload) return;
      // כאן בעתיד תבצעי קריאת API לשרת לשמירת מוצר
    },
    resetSession(state) {
      state.payload = null;
    },
  },
});

export const {
  setPayload,
  confirmParam,
  skipParam,
  addParam,
  updateSummary,
  finalizeProduct,
  resetSession,
} = aiProductSlice.actions;

export default aiProductSlice.reducer;
