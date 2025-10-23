import { logError } from '../../utils/logger';
import { Toast } from 'primereact/toast';
import { getSocket } from '../../services/socket';
import store from '../../store';

import { upsertThreadPreview, bumpThread } from './chatSlice';
import type { RefObject } from 'react';
import { createRef } from 'react';


export const toastRef: RefObject<Toast | null> = createRef<Toast>();


import type { NewThreadPayload, MessagePayload } from './chatTypes';

export function handleNewThread(p: NewThreadPayload) {
  toastRef.current?.show({ severity: 'info', summary: 'New chat thread', detail: p.preview || 'You have a new chat thread', life: 3000 });
  try {
    store.dispatch(upsertThreadPreview(p));
  } catch (e) {
    logError('[socket] chat:new-thread handler failed:', e);
  }
}

export function handleNewMessage(p: MessagePayload) {
  toastRef.current?.show({ severity: 'info', summary: 'New message', detail: p.message.text || 'You have a new message', life: 3000 });
  try {
    const { threadId } = p || {};
    const preview = p?.message?.text;
    const at = p?.message?.at;
    if (threadId) store.dispatch(bumpThread({ threadId, preview, at }));
  } catch (e) {
    logError('[socket] chat:message handler failed:', e);
  }
}

export function initChatSocketBridge() {
  const socket = getSocket(); 
  if (!socket) return;

  socket.on('chat:new-thread', handleNewThread);
  socket.on('chat:message', handleNewMessage);

  return () => {
    socket.off('chat:new-thread', handleNewThread);
    socket.off('chat:message', handleNewMessage);
  };
}


