// src/features/chat/components/ChatWindow.tsx
import { useEffect, useRef, useState } from 'react';
import {
  Channel,
  MessageList,
  MessageInput,
  Window
} from 'stream-chat-react';
import type { Channel as StreamChannel, StreamChat } from 'stream-chat';
import ChatHeaderBar from './ChatHeaderBar';
import { parseCid } from '../utils/parseCid';
import { threadByCid } from '../chatSlice';
import { useStreamClient } from './ChatProvider';
import { useDispatch } from 'react-redux';

// // ===== Custom Message that injects our Attachment
// const CustomMessage: React.FC<any> = (props) => (
//   <MessageSimple {...props} Attachment={CustomAttachment as any} />
// );

export default function ChatWindow({ cid }: { cid: string }) {
  const client = useStreamClient() as StreamChat | undefined;
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const dispatch = useDispatch<any>();
  const mountedRef = useRef(true);

  // ===== Upload function injected into Stream composer
  

  // ===== Inject upload handler into composer (client v12+/v13 pattern)
  

  // ===== Create/watch channel for given cid
  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    setFatalError(null);
    setChannel(null);

    if (!client) {
      setLoading(false);
      setFatalError('Chat client is not ready.');
      return () => {
        mountedRef.current = false;
      };
    }

    let closed = false;

    (async () => {
      try {
        const { type, id } = parseCid(cid);
        await dispatch(threadByCid({ cid }) as any);

        const ch = client.channel(type as any, id);
        await ch.watch();

        if (!closed && mountedRef.current) {
          setChannel(ch);
        }
      } catch (e: any) {
        console.error('[ChatWindow] watch failed:', e);
        if (mountedRef.current) {
          setFatalError(e?.message || 'Failed to open chat');
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    })();

    return () => {
      closed = true;
      mountedRef.current = false;
      setChannel(null);
    };
  }, [client, cid, dispatch]);

  // ===== Render states
  if (fatalError) {
    return (
      <div className="p-4 text-center text-red-600 text-sm">
        {fatalError}
      </div>
    );
  }

  if (loading || !client || !channel) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        Loading chat…
      </div>
    );
  }

  const isArchived = Boolean((channel.data as Record<string, unknown> | undefined)?.['isArchived']);

  return (
    <Channel channel={channel}>
      <Window>
        <ChatHeaderBar channel={channel} />
        <MessageList />
        {isArchived ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            This chat has ended. You cannot send new messages.
          </div>
        ) : (
          <MessageInput />
        )}
      </Window>
    </Channel>
  );
}
