// Payload types for socket events
export type NewThreadPayload = {
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

export type MessagePayload = {
  threadId: string;
  cid?: string;
  message: {
    text?: string;
    at?: string; // ISO
    senderId: string;
    attachments?: Array<{ url: string; name?: string; mime?: string; size?: number }>;
  };
};
// Popup state type for chat popup
export interface PopupState {
  cid: string | null;
}
// Shared props for chat header bar/details
export interface ChatHeaderBarProps {
  context?: ThreadContext;
}
// StreamChat member type for reuse
export type StreamMember = {
  user?: {
    id: string;
    [key: string]: any;
  };
  user_id?: string;
  [key: string]: any;
};
// Chat types and interfaces

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
  lastMessageSender?: string;
  unreadCount?: number;
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

export type ChatState = {
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
