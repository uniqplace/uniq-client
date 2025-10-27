import { useEffect, useState } from 'react';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import ContextTags from './ContextTags';
import type { Thread } from '../chatTypes';
import { useStreamClient } from './ChatProvider';

export interface ThreadPreviewProps {
  thread: Thread;
  isActive: boolean;
  onSelect: () => void;
  onOpenPopup?: () => void;
}

export default function ThreadPreview({ thread, isActive, onSelect, onOpenPopup }: ThreadPreviewProps) {
 
  const chatClient = useStreamClient();
  const myId = chatClient?.user?.id ?? chatClient?.userID;
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); 
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [isArchived, setIsArchived] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadChannel() {
      if (chatClient && thread.streamCid) {
        const [type, id] = thread.streamCid.split(":");
        const ch = chatClient.channel(type, id);
        try {
          await ch.watch();
          if (isMounted) {
            setChannel(ch);
            setLoading(false);
            setError(null);
            // initial values
            setUnreadCount(typeof ch.countUnread === 'function' ? ch.countUnread() : 0);
            setLastMessage(ch.state.messages?.slice(-1)[0]);
            setIsArchived(!!(ch.data && (ch.data as any).isArchived));
          }
        } catch (err) {
          if (isMounted) {
            setError('Error loading chat channel');
            setLoading(false);
          }
        }
      }
    }
    loadChannel();
    return () => { isMounted = false; };
  }, [chatClient, thread.streamCid]);

  // Listen for real-time events
  useEffect(() => {
    if (!channel) return;
    function updateUnread() {
      setUnreadCount(typeof channel.countUnread === 'function' ? channel.countUnread() : 0);
    }
    function updateLastMsg() {
      setLastMessage(channel.state.messages?.slice(-1)[0]);
    }
    function updateArchived() {
  setIsArchived(!!(channel.data && (channel.data as any).isArchived));
    }
    channel.on('message.new', () => {
      updateUnread();
      updateLastMsg();
    });
    channel.on('message.read', updateUnread);
    channel.on('notification.mark_read', updateUnread);
    channel.on('message.updated', updateLastMsg);
    channel.on('channel.updated', updateArchived);
    return () => {
      channel.off('message.new', updateUnread);
      channel.off('message.new', updateLastMsg);
      channel.off('message.read', updateUnread);
      channel.off('notification.mark_read', updateUnread);
      channel.off('message.updated', updateLastMsg);
      channel.off('channel.updated', updateArchived);
    };
  }, [channel]);

  // peer detection
  let peer = undefined;
  if (channel && channel.state) {
    const members = Object.values(channel.state.members || {}) as Array<{ user?: { id: string; name?: string; image?: string } }>;
    peer = members.find((m) => m.user && m.user.id !== myId)?.user;
  }

  return (
    <div
      className={`p-3 border-b border-gray-100 group cursor-pointer ${isActive ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
      onClick={onSelect}
      style={{ cursor: 'pointer' }}
    >
      {error ? (
        <div className="text-xs text-red-500">{error}</div>
      ) : loading ? (
  <div className="text-xs text-gray-400">Loading data…</div>
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
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                {isArchived && (
                  <span className="ml-2 bg-gray-400 text-white text-xs rounded-full px-2 py-0.5" title="Archived chat">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline', verticalAlign: 'middle' }}>
                      <path d="M4 7V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="4" y="7" width="16" height="13" rx="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M9 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                )}
              </div>
              <div className="truncate text-xs text-gray-500">
                {lastMessage ? (
                  <>
                    <span className="font-semibold text-gray-700">
                      {lastMessage.user?.id === myId ? 'me:' : (lastMessage.user?.name || lastMessage.user?.id || '—') + ':'}
                    </span> {lastMessage.text || '—'}
                    {/* Attachment icon if lastMessage has attachments */}
                    {Array.isArray(lastMessage.attachments) && lastMessage.attachments.length > 0 && (
                      <span className="inline-block ml-1 align-middle" title="Attachment">
                        {/* Paperclip icon for attachment */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.5 6.5L7.5 16.5a3 3 0 0 1-4.24-4.24l10-10a4 4 0 1 1 5.66 5.66l-10 10a1 1 0 0 1-1.42-1.42l10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    )}
                  </>
                ) : '—'}
              </div>
            </div>
          </div>
          {/* מידע נוסף מה-context */}
          <div className="flex flex-col min-w-0 mt-1">
            {/* Date at top right */}
            {lastMessage?.created_at && (
              <div className="flex justify-end mb-1">
                <span className="text-xs text-gray-400" title={format(new Date(lastMessage.created_at), 'dd/MM/yyyy HH:mm')}>
                  {differenceInDays(new Date(), new Date(lastMessage.created_at)) < 1
                    ? formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })
                    : format(new Date(lastMessage.created_at), 'dd/MM/yyyy HH:mm')}
                </span>
              </div>
            )}
            <ContextTags context={thread.context ?? null} />
            <button
              type="button"
              title="Open chat in popup"
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
