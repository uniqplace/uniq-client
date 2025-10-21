import { ChannelHeader } from 'stream-chat-react';
import MenuDropdown from './MenuDropdown';
import type { ThreadContext } from '../chatTypes';
import type { Channel as StreamChannel } from 'stream-chat';
import ContextTags from './ContextTags';
import { useChatHeaderContext } from '../hooks/useChatHeaderContext';

interface ChatHeaderBarProps {
  channel: StreamChannel;
  context?: ThreadContext;
}

export default function ChatHeaderBar({ channel, context }: ChatHeaderBarProps) {
  const ctx = useChatHeaderContext(context);

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b bg-white min-h-[56px]">
      <ChannelHeader />
      <div className="flex-1 min-w-0">
        <div className="flex flex-col">
          <ContextTags context={ctx} />
        </div>
      </div>
      <MenuDropdown channel={channel} />
    </div>
  );
}
