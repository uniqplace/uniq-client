// deleteThread

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { ChatState, Thread, ServerThread, ListThreadsResult } from './chatTypes';
import { moveToTop, upsertThreadArray } from './chatHelpers';
import {
  fetchThreads,
  deleteThread,
  openDirectChat,
  threadByCid
} from './chatThunks';
import type { EnsureDirectBidRes } from './api/chatApi.types';

/* ========= State ========= */

const initialState: ChatState = {
  threads: [],
  currentThread: null,
  page: 1,
  limit: 20,
  total: 0,
  hasMore: false,
  loading: false,
  error: null,

  ensuring: false,
  ensureError: null,
  lastOpened: null,
};

/* ========= Slice ========= */

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearChatError(state) {
      state.error = null;
    },
    clearEnsureState(state) {
      state.ensuring = false;
      state.ensureError = null;
      state.lastOpened = null;
    },

  // Add/update Thread and move to top — for socket event (chat:new-thread)
    upsertThreadPreview(
      state,
      action: PayloadAction<
        Partial<Thread> & { threadId?: string; _id?: string }
      >
    ) {
      const id = String(action.payload.threadId || action.payload._id || '');
      if (!id) return;
      upsertThreadArray(state.threads, { ...action.payload, _id: id });
    },

  // Move Thread to top and update text/time — for socket event (chat:message)
    bumpThread(
      state,
      action: PayloadAction<{ threadId: string; preview?: string; at?: string }>
    ) {
      const { threadId, preview, at } = action.payload;
      const t = state.threads.find((x) => x._id === threadId);
      if (!t) return;
      if (preview) t.lastMessageText = preview;
      t.lastMessageAt = at || new Date().toISOString();
      t.updatedAt = new Date().toISOString();
      moveToTop(state.threads, threadId);
    },

  // Local update of archive (after successful PATCH)
    setThreadArchivedLocal(
      state,
      action: PayloadAction<{ threadId: string; archived: boolean }>
    ) {
      const { threadId, archived } = action.payload;
      const t = state.threads.find((x) => x._id === threadId);
      if (!t) return;
      t.archived = archived;
      t.updatedAt = new Date().toISOString();
    },
  },

  extraReducers: (builder) => {
    // fetchThreads
    builder.addCase(fetchThreads.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchThreads.fulfilled,
      (state, action: PayloadAction<ListThreadsResult>) => {
        state.loading = false;
        state.error = null;
        state.threads = action.payload.items.slice(); // מחליפים רשימה
        console.log('[] fetched threads:', state.threads);
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.total = action.payload.total;
        state.hasMore = action.payload.hasMore;
      }
    );
    builder.addCase(fetchThreads.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || 'Failed to list threads';
    });
        builder.addCase(deleteThread.fulfilled, (state, action) => {
      // Remove the thread from the list
      state.threads = state.threads.filter(t => t._id !== action.payload.threadId);
      // If the deleted thread is the current one, clear it
      if (state.currentThread && state.currentThread._id === action.payload.threadId) {
        state.currentThread = null;
      }
    });
    builder.addCase(threadByCid.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.currentThread = null;
     
    });
    builder.addCase(
      threadByCid.fulfilled,
      (state, action: PayloadAction<ServerThread>) => {
        state.loading = false;
        state.error = null;
        state.currentThread = action.payload;
         console.log('[] fetching thread by cid...', state.currentThread);
      }
    );

    // openDirectChat
    builder.addCase(openDirectChat.pending, (state) => {
      state.ensuring = true;
      state.ensureError = null;
      state.lastOpened = null;
    });
    builder.addCase(
      openDirectChat.fulfilled,
      (state, action: PayloadAction<EnsureDirectBidRes>) => {
        state.ensuring = false;
        state.ensureError = null;
        state.lastOpened = {
          cid: action.payload.cid,
          threadId: action.payload.threadId,
        };
        // אפשרות: אם הת׳רד כבר קיים, לקפיץ לראש:
        const t = state.threads.find((x) => x._id === action.payload.threadId);
        if (t) moveToTop(state.threads, t._id);
      }
    );
    builder.addCase(openDirectChat.rejected, (state, action) => {
      state.ensuring = false;
      state.ensureError =
        (action.payload as string) || 'Failed to ensure direct chat';
    });
  },
});

export const {
  clearChatError,
  clearEnsureState,
  upsertThreadPreview,
  bumpThread,
  setThreadArchivedLocal,
} = chatSlice.actions;

export default chatSlice.reducer;
