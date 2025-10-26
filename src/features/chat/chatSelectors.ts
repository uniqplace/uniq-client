// Chat selectors
import type { RootState } from '../../store';
import { createSelector } from 'reselect';
import type { Thread } from './chatTypes';

export const selectChatState = (s: RootState) => s.chat;
export const selectThreads = (s: RootState) => s.chat.threads;
export const selectThreadsLoading = (s: RootState) => s.chat.loading;
export const selectThreadsError = (s: RootState) => s.chat.error;
export const selectEnsuring = (s: RootState) => s.chat.ensuring;
export const selectEnsureError = (s: RootState) => s.chat.ensureError;
export const selectLastOpened = (s: RootState) => s.chat.lastOpened;

export const selectThreadsOrdered = createSelector(
  (s: RootState) => s.chat.threads,
  (threads) =>
    [...threads].sort((a, b) => {
      const ax = a.lastMessageAt || a.updatedAt || '';
      const bx = b.lastMessageAt || b.updatedAt || '';
      return bx.localeCompare(ax);
    })
);

export const selectThreadById =
  (threadId: string) => (s: RootState) =>
    s.chat.threads.find((t) => t._id === threadId) || null;

export const selectThreadsWithPeer = (s: RootState, myUserId: string) =>
  s.chat.threads.map((t: Thread) => {
    const peer =
      t.participants.find((p) => p._id !== myUserId) || null;
    return { ...t, peer };
  });
