import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStreamClient } from '../components/ChatProvider';

export interface ThreadPreviewProps {
  thread: any;
  isActive: boolean;
  onSelect: () => void;
  onOpenPopup?: () => void;
}

export default function ThreadPreview({ thread, isActive, onSelect, onOpenPopup }: ThreadPreviewProps) {
  const navigate = useNavigate();
  const chatClient = useStreamClient();
  const myId = chatClient?.user?.id ?? chatClient?.userID;
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadChannel() {
      if (chatClient && thread.streamCid) {
        const [type, id] = thread.streamCid.split(":");
        const ch = chatClient.channel(type, id);
        await ch.watch();
        if (isMounted) {
          setChannel(ch);
          setLoading(false);
        }
      }
    }
    loadChannel();
    return () => { isMounted = false; };
  }, [chatClient, thread.streamCid]);

  // peer detection
  let peer = undefined;
  let lastMessage = undefined;
  let unreadCount = 0;
  if (channel && channel.state) {
    const members = Object.values(channel.state.members || {}) as Array<{ user?: { id: string; name?: string; image?: string } }>;
    peer = members.find((m) => m.user && m.user.id !== myId)?.user;
    lastMessage = channel.state.messages?.slice(-1)[0];
    unreadCount = typeof channel.countUnread === 'function' ? channel.countUnread() : 0;
  }

  return (
    <div
      className={`p-3 border-b flex flex-col gap-1 ${isActive ? 'bg-blue-100' : 'hover:bg-gray-50'}`}
      onClick={onSelect}
      style={{ cursor: 'pointer' }}
    >
      {loading ? (
        <div className="text-xs text-gray-400">טוען נתוני …</div>
      ) : (
        <>
          <div className="flex gap-3 items-center">
            {peer?.image ? (
              <img src={peer.image} alt={peer.name || peer.id || ''} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-lg">
                {peer?.name?.[0]?.toUpperCase() || peer?.id?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <div className="flex justify-between items-center">
                <div className="truncate font-medium">{peer?.name || peer?.id || '—'}</div>
                {unreadCount > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">{unreadCount}</span>
                )}
              </div>
              <div className="truncate text-xs text-gray-500">
                {lastMessage ? (
                  <>
                    <span className="font-semibold text-gray-700">
                      {lastMessage.user?.id === myId ? 'me:' : (lastMessage.user?.name || lastMessage.user?.id || '—') + ':'}
                    </span> {lastMessage.text || '—'}
                  </>
                ) : '—'}
              </div>
            </div>
          </div>
          {/* מידע נוסף מה-context */}
          <div className="flex flex-col min-w-0 mt-1">
            {thread.context ? (
              <div className="flex flex-wrap gap-1 text-xs text-gray-500 truncate">
                {thread.context.productTitle && (
                  <span className="bg-blue-100 text-blue-800 rounded px-2 py-0.5 font-medium cursor-pointer hover:bg-blue-200">
                    {thread.context.productTitle}
                  </span>
                )}
                {thread.context.bidRequestId && (
                  <span
                    className="bg-green-100 text-green-800 rounded px-2 py-0.5 font-medium cursor-pointer hover:bg-green-200"
                    onClick={e => { e.stopPropagation(); navigate(`/myBidRequests/${thread.context.bidRequestId}`); }}
                    title="מעבר לעמוד בקשה"
                  >
                    request: {String(thread.context.bidRequestId).slice(-6)}
                  </span>
                )}
                {thread.context.bidOfferId && (
                  <span
                    className="bg-purple-100 text-purple-800 rounded px-2 py-0.5 font-medium cursor-pointer hover:bg-purple-200"
                    onClick={e => { e.stopPropagation(); navigate(`/BidOfferDetails/${thread.context.bidOfferId}`); }}
                    title="מעבר לעמוד הצעה"
                  >
                    offer: {String(thread.context.bidOfferId).slice(-6)}
                  </span>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-400">טוען פרטי …</div>
            )} <button
            type="button"
            title="פתח חלון  קטן"
            onClick={e => {
              e.stopPropagation();
              if (onOpenPopup) onOpenPopup();
            }}
            className="opacity-60 group-hover:opacity-100 transition-opacity self-end"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 2a1 1 0 0 1 1 1v7a1 1 0 1 1-2 0V5.41l-9.3 9.3a1 1 0 0 1-1.4-1.42l9.3-9.3H14a1 1 0 1 1 0-2h5ZM5 6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-4a1 1 0 1 1 2 0v4a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5V9a5 5 0 0 1 5-5h4a1 1 0 1 1 0 2H5Z"/>
            </svg>
          </button>
          </div>
         
        </>
      )}
    </div>
  );
}
