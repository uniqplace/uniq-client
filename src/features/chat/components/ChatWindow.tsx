// Full chat window by cid (Header/List/Input)

// src/features/chat/components/ChatWindow.tsx
import { useEffect, useState } from 'react';
import ChatHeaderBar from './ChatHeaderBar';
import { Channel, MessageList, MessageInput, Window } from 'stream-chat-react';
import type { Channel as StreamChannel } from 'stream-chat';
import { parseCid } from '../utils/parseCid';
import { useStreamClient } from './ChatProvider';
// import { useDispatch, useSelector } from 'react-redux';
import {threadByCid } from '../chatSlice';
import { useDispatch } from 'react-redux';


type Props = { cid: string };

export default function ChatWindow({ cid }: Props) {
  const client = useStreamClient();
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const dispatch = useDispatch<any>();


  useEffect(() => {
    if (!client) return;
    let closed = false;

    (async () => {
      try {
        const { type, id } = parseCid(cid);
        await dispatch(threadByCid({ cid }) as any);
        const ch = client.channel(type as any, id);
        await ch.watch();
        if (!closed) setChannel(ch);
      } catch (e) {
        console.error('[ChatWindow] watch failed:', e);
      }
    })();

    return () => {
      closed = true;
      setChannel(null);
    };
  }, [client, cid]);

  if (!client || !channel) return null;

  return (
    <Channel channel={channel}>
      <Window>
        <ChatHeaderBar channel={channel} />
        <MessageList />
        {channel.data && (channel.data as any).isArchived ? (
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



