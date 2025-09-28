// Chat types (Thread, Peer, etc.)

export type Thread = {
  _id: string;
  streamCid: string;
  lastMessageText?: string;
  lastMessageAt?: string;
  participants: Array<{ _id: string; name?: string; email?: string; avatarUrl?: string }>;
  peer?: { _id: string; name?: string; email?: string; avatarUrl?: string } | null;
  context?: Record<string, any>;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};
