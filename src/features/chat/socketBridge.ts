import { Toast } from 'primereact/toast';
import { getSocket } from '../../services/socket';
import store from '../../store';

import { upsertThreadPreview, bumpThread } from './chatSlice';
// מניח שיש לך מחבר סוקט ב: src/features/socket/socket.ts שמייצא 'socket'
import type { RefObject } from 'react';
import { createRef } from 'react';


export const toastRef: RefObject<Toast | null> = createRef<Toast>();

type NewThreadPayload = {
  threadId: string;
  cid?: string;
  context?: any;
  fromUserId?: string;
  preview?: string;
  participants?: any[];
  participantsInfo?: Array<{ userId: string; name?: string; image?: string; role?: string }>;
  lastMessageAt?: string;
  lastMessageText?: string;
};

type MessagePayload = {
  threadId: string;
  cid?: string;
  message: {
    text?: string;
    at?: string; // ISO
    senderId: string;
    attachments?: Array<{ url: string; name?: string; mime?: string; size?: number }>;
  };
};

export function initChatSocketBridge() {
    const socket = getSocket(); 
    if (!socket) return;

    socket.on('chat:new-thread', (p: NewThreadPayload) => {
        toastRef.current?.show({ severity: 'info', summary: 'New chat thread', detail: p.preview || 'You have a new chat thread', life: 3000 });
     try {
      store.dispatch(upsertThreadPreview(p));
    } catch (e) {
      console.warn('[socket] chat:new-thread handler failed:', e);
    }
  });

  // התקבלה הודעה חדשה – קפיצת הת׳רד לראש הרשימה + עדכון preview
  socket.on('chat:message', (p: MessagePayload) => {
     toastRef.current?.show({ severity: 'info', summary: 'New message', detail: p.message.text || 'You have a new message', life: 3000 });
     try {
      const { threadId } = p || {};
      const preview = p?.message?.text;
      const at = p?.message?.at;
      if (threadId) store.dispatch(bumpThread({ threadId, preview, at }));
    } catch (e) {
      console.warn('[socket] chat:message handler failed:', e);
    }
  });
  return () => {
    socket.off('chat:new-thread');
    socket.off('chat:message');
  };
}


