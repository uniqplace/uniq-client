// ThreadsStreamPage.tsx
import { Chat, useChatContext } from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';

import { useStreamClient } from '../components/ChatProvider';
import ChatPopup from '../components/ChatPopup';
import { useSelector, useDispatch } from 'react-redux';
import { openPopup, closePopup } from '../popupSlice';
import { useEffect} from 'react';
import { fetchThreads, selectThreads, threadByCid } from '../chatSlice';
import type { AppDispatch } from '../../../store';
import ThreadPreview from '../components/ThreadPreview';

export default function ThreadsPage() {
  const chatClient = useStreamClient();
  const dispatch = useDispatch<AppDispatch>();
  const { setActiveChannel, channel: activeChannel } = useChatContext();
  const threads = useSelector(selectThreads);
  const uid = chatClient?.user?.id ?? chatClient?.userID;
  const popupCid = useSelector((state: any) => state.chatPopup?.cid);

 

  useEffect(() => {
    dispatch(fetchThreads() as any);
  }, [dispatch]);

  if (!chatClient) return <div className="p-4">Connecting chat…</div>;
  if (!uid) return <div className="p-4">Waiting for user identity…</div>;

  return (
    <Chat client={chatClient}>
      {/* רשימת ת'רדים בלבד */}
      <div className="h-[80vh] border rounded overflow-y-auto bg-white">
        {threads.length === 0 && (
          <div className="p-4 text-gray-400">אין שיחות</div>
        )}
        {threads.map((thread: any) => (
          <ThreadPreview
            key={thread._id}
            thread={thread}
            isActive={activeChannel?.cid === thread.streamCid}
            onSelect={async () => {
              if (chatClient && thread.streamCid) {
                const [type, id] = thread.streamCid.split(":");
                const channel = chatClient.channel(type, id);
                setActiveChannel(channel);
              }
              await dispatch(threadByCid({ cid: thread.streamCid }));
            }}
            onOpenPopup={() => dispatch(openPopup(thread.streamCid))}
          />
        ))}
      </div>
  {/* Chat popup using Redux state */}
  <ChatPopup cid={popupCid} onClose={() => dispatch(closePopup())} />
    </Chat>
  );
}


// ThreadPreview was moved to components/ThreadPreview.tsx
