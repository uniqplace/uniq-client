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
  lockSpec,
} from "./aiProductThunks";
import { saveToLocalStorage, loadFromLocalStorage } from '../../../utils/localStorageUtils';
import { validateProductPayload } from '../../../utils/validation';
import type { Middleware } from '@reduxjs/toolkit';

// ==== Local Storage Helpers ====
const LOCAL_STORAGE_KEY = 'aiProductState';

function getInitialProductState(): ProductPayload {
  const loadedState = loadFromLocalStorage<ProductPayload>(LOCAL_STORAGE_KEY);
  return validateProductPayload(loadedState)
    ? loadedState
    : {
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
}

// ==== Initial State ====
const initialState: ProductPayload = getInitialProductState();

// ==== Slice ====
const aiProductSlice = createSlice({
  name: "aiProduct",
  initialState: {
    ...initialState,
    errorMessage: undefined as string | undefined,
  },
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
    resetProductState(state) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      Object.assign(state, initialState);
      state.errorMessage = undefined;
    },
    clearError(state) {
       state.status = 'idle';
       state.errorMessage = '';
     },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateDraft.pending, (state) => {
        state.status = "drafting";
        state.errorMessage = undefined;
      })
      .addCase(generateDraft.fulfilled, (state, action) => {
        state.status = "idle";
        state.errorMessage = undefined;
        const payload = action.payload || {};
        state.params = payload.params || [];
        state.summary = payload.summary || "";
        state.category = payload.category || "";
        state.aiVersion = payload.aiVersion || "";
        state.title = payload.title || "";
        state.description = payload.description || "";
        state.price = payload.price || 0;
        state.images = payload.images || [];
        state.subCategories = payload.subCategories || [];
        state.condition = payload.condition || "new";
        state.location = payload.location || "";
        state.tags = payload.tags || [];
        state.locale = payload.locale || undefined;
      })
      .addCase(generateDraft.rejected, (state, action) => {
        state.status = "error";
        state.errorMessage = action.error?.message || "AI request failed. Please try again.";
      })
      .addCase(refineSpec.pending, (state) => {
        state.status = "refining";
        state.errorMessage = undefined;
      })
      .addCase(refineSpec.fulfilled, (state, action) => {
        state.status = action.payload?.status || "idle";
        state.errorMessage = undefined;
        state.params = action.payload?.params || action.payload?.updatedParams || [];
        state.summary = action.payload.summary;
        state.category = action.payload.category || state.category;
        state.aiVersion = action.payload.aiVersion || state.aiVersion;
        if (action.payload.title) state.title = action.payload.title;
        if (action.payload.description) state.description = action.payload.description;
        if (action.payload.price) state.price = action.payload.price;
        if (action.payload.images) state.images = action.payload.images;
        if (action.payload.subCategories) state.subCategories = action.payload.subCategories;
        if (action.payload.condition) state.condition = action.payload.condition;
        if (action.payload.location) state.location = action.payload.location;
        if (action.payload.tags) state.tags = action.payload.tags;
        if (action.payload.locale) state.locale = action.payload.locale;
      })
      .addCase(refineSpec.rejected, (state, action) => {
        state.status = "error";
        state.errorMessage = action.error?.message || "AI request failed. Please try again.";
      })
      .addCase(lockSpec.fulfilled, (state) => {
        state.status = "locked";
      });
  },
});

export const { addParam, updateParam, skipParam, resetProductState, clearError } = aiProductSlice.actions;
export default aiProductSlice.reducer;

// NOTE: If you use local state (useState) for params/messages in any component, make sure to reset them as well on logout/login!
// For example, in AiProductDebugPanel, reset messages state when user changes or on logout.
//
// Example for AiProductDebugPanel:
// const user = useAppSelector(state => state.user);
// useEffect(() => {
//   setMessages([]); // or set to initial value
// }, [user]);

// Custom middleware to persist state changes automatically
export const persistAiProductStateMiddleware: Middleware = (store) => (next) => (action: any) => {
  const result = next(action);

  // Check if the action is related to aiProduct and persist the state
  if (action.type.startsWith('aiProduct/')) {
    const state = store.getState().aiProduct;
    saveToLocalStorage(LOCAL_STORAGE_KEY, state);
  }

  return result;
};

// Ensure to add this middleware to the store configuration
// Example: applyMiddleware(persistAiProductStateMiddleware)