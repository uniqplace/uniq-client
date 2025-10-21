// Hook for managing Stream chat client connect/disconnect
// src/features/chat/hooks/useChatClient.ts
import { useEffect, useRef, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { issueStreamToken } from '../api/chatApi';
import { logError } from '../../../utils/logger';

export function useChatClient() {
  const [client, setClient] = useState<StreamChat | null>(null);
  const connecting = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      if (connecting.current) return;
      connecting.current = true;
      try {
        const { apiKey, userId, token } = await issueStreamToken();
        const c = StreamChat.getInstance(apiKey);
        await c.connectUser({ id: userId }, token);
        if (!cancelled) setClient(c);
      } catch (e) {
        logError('[useChatClient] connect failed:', e);
      } finally {
        connecting.current = false;
      }
    }

    connect();

    return () => {
      cancelled = true;
      if (client && client.user) {
        client.disconnectUser().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return client;
}

