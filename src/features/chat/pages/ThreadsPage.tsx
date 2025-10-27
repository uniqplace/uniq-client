// ThreadsStreamPage.tsx
import { Chat, useChatContext } from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';

import { useStreamClient } from '../components/ChatProvider';
import ChatPopup from '../components/ChatPopup';
import { useSelector, useDispatch } from 'react-redux';
import { openPopup, closePopup } from '../popupSlice';
// import { useEffect } from 'react'; // Removed, not used
import { fetchThreads, threadByCid } from '../chatThunks';
import type { AppDispatch } from '../../../store';
import ThreadPreview from '../components/ThreadPreview';
import { useStreamThreads } from '../hooks/useStreamThreads';
import { selectThreads } from '../chatSelectors';
import { useEffect } from 'react';


export default function ThreadsPage() {
  const chatClient = useStreamClient();
  const dispatch = useDispatch<AppDispatch>();
  const { setActiveChannel, channel: activeChannel } = useChatContext();
  const threads = useSelector(selectThreads);
  const uid = chatClient?.user?.id ?? chatClient?.userID;
  const popupCid = useSelector((state: any) => state.chatPopup?.cid);
  // Use the new hook to get channels from Stream
  const { channels, loading, error } = useStreamThreads({ client: chatClient, meId: uid, limit: 30 });

  useEffect(() => {
    dispatch(fetchThreads() as any);
  } , [dispatch, uid]);
  if (!chatClient) return <div className="p-4">Connecting chat…</div>;
  if (!uid) return <div className="p-4">Waiting for user identity…</div>;
  let thread = null;
  return (
    <Chat client={chatClient}>
      <div className="h-[80vh] border rounded overflow-y-auto bg-white">
        {loading && <div className="p-4 text-gray-400">Loading chats…</div>}
        {error && <div className="p-4 text-red-400">{error}</div>}
        {!loading && channels.length === 0 && (
          <div className="p-4 text-gray-400">No chats found</div>
        )}
        {[...channels]
          .sort((a, b) => {
            const aDate = new Date((a.data as any)?.last_message_at || a.data?.updated_at || 0).getTime();
            const bDate = new Date((b.data as any)?.last_message_at || b.data?.updated_at || 0).getTime();
            return bDate - aDate;
          })
          .map((channel) => (
          thread = threads.find(t => t.streamCid === channel.cid) ,
         
          <ThreadPreview
            key={channel.cid}
            thread={{
              _id: channel.cid,
              participants: channel.state?.members ? Object.values(channel.state.members).map((m: any) => ({
                _id: m.user?.id,
                name: m.user?.name,
                email: m.user?.email,
                avatarUrl: m.user?.image,
              })) : [],
              lastMessageText:
                (channel.data as any)?.last_message_text ||
                channel.state?.messages?.[channel.state?.messages?.length - 1]?.text || '',
              lastMessageAt:
                channel.data?.last_message_at ||
                (channel.state?.messages?.[channel.state?.messages?.length - 1]?.created_at
                  ? String(channel.state?.messages?.[channel.state?.messages?.length - 1]?.created_at)
                  : '') ||
                channel.data?.updated_at || '',
              lastMessageSender:
                (channel.data as any)?.last_message_sender ||
                channel.state?.messages?.[channel.state?.messages?.length - 1]?.user?.name ||
                channel.state?.messages?.[channel.state?.messages?.length - 1]?.user?.id || '',
              context: thread?.context ?? undefined,
              streamCid: channel.cid,
              archived: !!(channel.data as any)?.archived,
              createdAt: channel.data?.created_at || '',
              updatedAt: channel.data?.updated_at || '',
            }}
            isActive={activeChannel?.cid === channel.cid}
            onSelect={async () => {
              setActiveChannel(channel);
              await dispatch(threadByCid({ cid: channel.cid }));
            }}
            onOpenPopup={() => dispatch(openPopup(channel.cid))}
          
          />
        ))}
      </div>
      {/* Chat popup using Redux state */}
      <ChatPopup cid={popupCid} onClose={() => dispatch(closePopup())} />
    </Chat>
  );
}


