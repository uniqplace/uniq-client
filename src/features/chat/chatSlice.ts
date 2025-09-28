
    // deleteThread

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import {
  ensureDirectBid,
  listThreads,
  selectThreadByCid
} from './api/chatApi'; // << תיקון מסלול
import type {
  EnsureDirectBidReq,
  EnsureDirectBidRes,
  ListThreadsQuery,
} from './api/chatApi';
import type { RootState } from '../../store';
import { createSelector } from 'reselect';

/* ========= Types ========= */

export type ParticipantInfo = {
  userId: string;
  name?: string;
  image?: string;
  role: string;
  _id: string;
};

export type ThreadContext = {
  type: string;
  bidRequestId?: string;
  bidOfferId?: string;
  productTitle?: string | null;
  [key: string]: any;
};

export type ServerThread = {
  _id: string;
  participants: string[];
  participantsInfo: ParticipantInfo[];
  streamCid: string;
  type: string;
  context: ThreadContext;
  lastMessageAt: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  name?: string;
};

export type Thread = {
  _id: string;
  streamCid: string;
  lastMessageText?: string;
  lastMessageAt?: string;
  participants: Array<{ _id: string; name?: string; email?: string; avatarUrl?: string }>;
  peer?: { _id: string; name?: string; email?: string; avatarUrl?: string } | null;
  context?: ThreadContext;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ListThreadsResult = {
  items: Thread[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

/* ========= Thunks ========= */

export const fetchThreads = createAsyncThunk<
  ListThreadsResult,
  ListThreadsQuery | void,
  { rejectValue: string }
>('chat/fetchThreads', async (query, { rejectWithValue }) => {
  try {
    const res = await listThreads(query ?? {});
    return res as ListThreadsResult;
  } catch (e: any) {
    return rejectWithValue(e?.message || 'Failed to list threads');
  }
});
import { deleteThreadById } from './api/chatApi';
// Thunk to delete a thread by threadId
export const deleteThread = createAsyncThunk<
  { success: boolean; threadId: string },
  string,
  { rejectValue: string }
>(
  'chat/deleteThread',
  async (threadId, { rejectWithValue }) => {
    try {
      const res = await deleteThreadById(threadId);
      return { ...res, threadId };
    } catch (e: any) {
      return rejectWithValue(e?.message || 'Failed to delete thread');
    }
  }
);
export const openDirectChat = createAsyncThunk<
  EnsureDirectBidRes,
  EnsureDirectBidReq,
  { rejectValue: string }
>('chat/openDirectChat', async (body, { rejectWithValue }) => {
  try {
    const res = await ensureDirectBid(body);
    return res; // { cid, threadId }
  } catch (e: any) {
    return rejectWithValue(e?.message || 'Failed to ensure direct chat');
  }
});



export const threadByCid = createAsyncThunk<
  ServerThread,
  { cid: string }
>(
  'chat/threadByCid',
  async (body, { rejectWithValue }) => {
    try {
      const res = await selectThreadByCid(body);
      return res;
    } catch (e: any) {
      return rejectWithValue(e?.message || 'Failed to fetch thread by cid');
    }
  }
);

/* ========= State ========= */

type ChatState = {
  threads: Thread[];
  currentThread: ServerThread | null;
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;

  ensuring: boolean;
  ensureError: string | null;
  lastOpened?: { cid: string; threadId: string } | null;
};

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

/* ========= Helpers ========= */

function moveToTop<T extends { _id: string }>(arr: T[], id: string) {
  const i = arr.findIndex((x) => x._id === id);
  if (i > 0) {
    const [x] = arr.splice(i, 1);
    arr.unshift(x);
  }
}

function upsertThreadArray(threads: Thread[], incoming: Partial<Thread> & { _id: string }) {
  const idx = threads.findIndex((t) => t._id === incoming._id);
  if (idx === -1) {
    // הוספה לראש הרשימה
    const now = new Date().toISOString();
    threads.unshift({
      _id: incoming._id,
      streamCid: incoming.streamCid || '',
      participants: incoming.participants || [],
      peer: incoming.peer ?? null,
      context: incoming.context,
      lastMessageText: incoming.lastMessageText,
      lastMessageAt: incoming.lastMessageAt || now,
      archived: incoming.archived ?? false,
      createdAt: incoming.createdAt || now,
      updatedAt: incoming.updatedAt || now,
    });
  } else {
    // מיזוג ועדכון
    threads[idx] = {
      ...threads[idx],
      ...incoming,
      participants: incoming.participants ?? threads[idx].participants,
      peer: incoming.peer ?? threads[idx].peer,
      lastMessageAt: incoming.lastMessageAt ?? threads[idx].lastMessageAt,
      lastMessageText: incoming.lastMessageText ?? threads[idx].lastMessageText,
      updatedAt: new Date().toISOString(),
    };
    // להזיז לראש
    moveToTop(threads, incoming._id);
  }
}

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

    /** מוסיף/מעדכן Thread ומקפיץ לראש הרשימה — לשימוש מאירועי Socket (chat:new-thread) */
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

    /** מקפיץ Thread לראש ומעדכן טקסט/זמן אחרון — לשימוש מאירוע Socket (chat:message) */
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

    /** עדכון לוקאלי של ארכוב (אחרי PATCH מוצלח) */
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

/* ========= Selectors ========= */

export const selectChatState = (s: RootState) => s.chat;
export const selectThreads = (s: RootState) => s.chat.threads;
export const selectThreadsLoading = (s: RootState) => s.chat.loading;
export const selectThreadsError = (s: RootState) => s.chat.error;

export const selectEnsuring = (s: RootState) => s.chat.ensuring;
export const selectEnsureError = (s: RootState) => s.chat.ensureError;
export const selectLastOpened = (s: RootState) => s.chat.lastOpened;

/** ת׳רדים ממויינים לפי עדכניות (לפי lastMessageAt/updatedAt) — ממוזכר */
export const selectThreadsOrdered = createSelector(
  (s: RootState) => s.chat.threads,
  (threads) =>
    [...threads].sort((a, b) => {
      const ax = a.lastMessageAt || a.updatedAt || '';
      const bx = b.lastMessageAt || b.updatedAt || '';
      return bx.localeCompare(ax);
    })
);

/** סלקטור לפי מזהה */
export const selectThreadById =
  (threadId: string) => (s: RootState) =>
    s.chat.threads.find((t) => t._id === threadId) || null;

/**
 * דוגמה לסלקטור שמחשב peer (בן שיח) בצד ה־UI:
 * קראי: const threads = useSelector((s) => selectThreadsWithPeer(s, myUserId));
 */
export const selectThreadsWithPeer = (s: RootState, myUserId: string) =>
  s.chat.threads.map((t) => {
    const peer =
      t.participants.find((p) => p._id !== myUserId) || null;
    return { ...t, peer };
  });
