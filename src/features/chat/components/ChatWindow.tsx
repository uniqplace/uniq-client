// src/features/chat/components/ChatWindow.tsx
import { Channel, MessageList, MessageInput, Window } from 'stream-chat-react';
import type { StreamChat } from 'stream-chat';
import ChatHeaderBar from './ChatHeaderBar';
import { useChatChannel } from '../hooks/useChatChannel';
import { useStreamClient } from './ChatProvider';

export default function ChatWindow({ cid }: { cid: string }) {
  const client = useStreamClient() as StreamChat | undefined;
  const { channel, loading, fatalError } = useChatChannel(cid, client);

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
