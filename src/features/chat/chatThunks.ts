// Chat thunks
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { EnsureDirectBidReq, EnsureDirectBidRes, ListThreadsQuery } from './api/chatApi.types';
import type { ListThreadsResult, ServerThread } from './chatTypes';
import { listThreads, deleteThreadById, ensureDirectBid, selectThreadByCid } from './api/chatApi';

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
