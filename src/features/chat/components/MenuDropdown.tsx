
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { deleteThread } from '../chatThunks';
import { FiMoreVertical } from 'react-icons/fi';
import type { Channel as StreamChannel } from 'stream-chat';
import { useChatContext } from 'stream-chat-react';
import type { AppDispatch } from '../../../store';


import type { StreamMember } from '../chatTypes';
import Toast from '../../../components/shared/Toast';
import { canDeleteChannel } from '../utils/permissions';

// Dropdown menu for chat actions
export default function MenuDropdown({ channel }: { channel: StreamChannel }) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { setActiveChannel } = useChatContext();
  const client = channel.getClient();
  // peer: try from state, if not found — from participantsMeta
  const data = channel.state as any || {};
  let peer: StreamMember | null = null;
  if (data.members && typeof data.members === 'object') {
    const myId = client.userID;
    const membersArr: StreamMember[] = Object.values(data.members);
    // Find the member who is not me
    peer = membersArr.find((p) => p.user && p.user_id !== myId) || null;
  }
  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);
  // Example actions
  const handleShowProfile = () => {
    console.log('Show profile of', peer);
    if (peer && peer.user && peer.user.id) window.open(`/user/${peer.user.id}`, '_blank');
    setOpen(false);
  };
  const handleBlock = async () => {
    if (peer && peer.user && peer.user.id) await client.banUser(peer.user.id);
    setOpen(false);
  };
  const handleMute = async () => {
    if (peer && peer.user && peer.user.id) await client.muteUser(peer.user.id);
    setOpen(false);
  };
  // Mark the channel as "archived" (isArchived: true)
  const handleHideChat = async () => {
    if (window.confirm('האם לסיים (להסתיר)  זו?')) {
      await channel.update({ isArchived: true } as any);
      setActiveChannel(undefined);
      setTimeout(() => setActiveChannel(channel), 0);
    }
    setOpen(false);
  };
  // Unarchive
  const handleUnarchive = async () => {
    await channel.update({ isArchived: false } as any);
    setActiveChannel(undefined);
    setTimeout(() => setActiveChannel(channel), 0);
    setOpen(false);
  };
  // Example usage of deleteThread thunk
  const handleDeleteChat = async () => {
    if (window.confirm('האם למחוק  זו?')) {
      // Assume the channel has a data object with threadId
      const threadId = (channel as any)?.cid || (channel.data as any)?._id;
      if (!threadId) {
        setToastMsg('Thread ID not found');
        setOpen(false);
        return;
      }
      try {
        await channel.delete();
        const result = await dispatch(deleteThread(threadId));
        setActiveChannel(undefined);
        // You can check if it was deleted successfully:
        if ((result as any).meta?.requestStatus === 'fulfilled') {
          setToastMsg('Chat deleted successfully');
          navigate('/');
          setTimeout(() => window.location.reload(), 300);
        } else {
          setToastMsg('Chat deletion failed');
          // console.error('[] Delete thread failed:', result);
        }
      } catch (e) {
        setToastMsg('Error deleting chat');
      }
    }
    setOpen(false);
  };
  // Check permissions for deleting channel using helper
  const userRole = client.user?.role;
  const canDelete = canDeleteChannel(userRole);
  console.log('[] User role:', client, 'Can delete:', canDelete);
  return (
    <>
      <div className="relative" ref={ref}>
        <button
          className="p-2 rounded hover:bg-gray-100"
          title="תפריט"
          onClick={() => setOpen((v) => !v)}
        >
          <FiMoreVertical size={18} />
        </button>
        {open && (
          <div className="absolute left-0 top-full mt-2 w-44 bg-white border rounded shadow-lg z-50 text-right">
            <button className="block w-full px-4 py-2 text-sm hover:bg-gray-100" onClick={handleShowProfile}>
              Show Profile
            </button>
            <button className="block w-full px-4 py-2 text-sm hover:bg-gray-100" onClick={handleMute}>
              Mute User
            </button>
            <button className="block w-full px-4 py-2 text-sm hover:bg-gray-100" onClick={handleBlock}>
              Block User
            </button>
            {(channel.data && (channel.data as any).isArchived) ? (
              <button className="block w-full px-4 py-2 text-sm hover:bg-gray-100" onClick={handleUnarchive}>
                Unarchive
              </button>
            ) : (
              <button className="block w-full px-4 py-2 text-sm hover:bg-gray-100" onClick={handleHideChat}>
                End Chat (Hide)
              </button>
            )}
            <button className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50" onClick={handleDeleteChat}>
              Delete Chat
            </button>
          </div>
        )}
      </div>
      {toastMsg && (
        <Toast message={toastMsg} onClose={() => setToastMsg(null)} />
      )}
    </>
  );
}
