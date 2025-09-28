
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { deleteThread } from '../chatSlice';
import { FiMoreVertical } from 'react-icons/fi';
import type { Channel as StreamChannel } from 'stream-chat';
import { useChatContext } from 'stream-chat-react';
import type { AppDispatch } from '../../../store';


// Define a type for a StreamChat member
type StreamMember = {
  user?: {
    id: string;
    [key: string]: any;
  };
  user_id?: string;
  [key: string]: any;
};

// תפריט נפתח לפעולות בצ'אט
export default function MenuDropdown({ channel }: { channel: StreamChannel }) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { setActiveChannel } = useChatContext();
  const client = channel.getClient();
  // peer: נסה מהstate, ואם אין — מהparticipantsMeta
  const data = channel.state as any || {};
//   console.log('MenuDropdown channel data:', data);
  let peer: StreamMember | null = null;
  if (data.members && typeof data.members === 'object') {
    const myId = client.userID;
    const membersArr: StreamMember[] = Object.values(data.members);
    // מצא את החבר שאינו אני
    peer = membersArr.find((p) => p.user && p.user_id !== myId) || null;
  }
  
  // סגירה בלחיצה מחוץ
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  // פעולות לדוגמה
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


  // סימון הערוץ כ"מוסתר" (isArchived: true)
  const handleHideChat = async () => {
    if (window.confirm('האם לסיים (להסתיר)  זו?')) {
      await channel.update({ isArchived: true } as any);
  setActiveChannel(undefined);
      setTimeout(() => setActiveChannel(channel), 0);
    }
    setOpen(false);
  };

  // ביטול הסתרה
  const handleUnarchive = async () => {
  await channel.update({ isArchived: false } as any);
  setActiveChannel(undefined);
    setTimeout(() => setActiveChannel(channel), 0);
    setOpen(false);
  };

  // דוגמה לשימוש ב-deleteThread thunk
  const handleDeleteChat = async () => {
    if (window.confirm('האם למחוק  זו?')) {
      // נניח שיש ל-channel אובייקט data עם threadId
      const threadId = (channel as any)?.cid || (channel.data as any)?._id;
      console.log('[] Deleting threadId:', threadId);
      console.log('[] Current channel data:', channel);
      if (!threadId) {
        alert('לא נמצא מזהה  (threadId)');
        setOpen(false);
        return;
      }
      try {
          await channel.delete();
       
       
        const result = await dispatch(deleteThread(threadId));
       setActiveChannel(undefined);

        // אפשר לבדוק אם נמחק בהצלחה:
        if ((result as any).meta?.requestStatus === 'fulfilled') {
          alert('ה נמחקה בהצלחה');
          navigate('/');
          setTimeout(() => window.location.reload(), 300);
        } else {
          alert('מחיקת ה נכשלה');
          console.error('[] Delete thread failed:', result);
        }
      } catch (e) {
        alert('שגיאה במחיקת ה');
        console.error('[] Delete thread error:', e);
      }
    }
    setOpen(false);
  };

  // בדיקת הרשאות למחיקת ערוץ: רק admin/owner או מי שיש לו deleteChannel
  const userRole = client.user?.role;
  const canDelete = userRole === 'admin' || userRole === 'owner';
  console.log('[] User role:', client, 'Can delete:', canDelete);

  return (
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
          { (
            <button className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50" onClick={handleDeleteChat}>
              Delete Chat
            </button>
          )}
        </div>
      )}
    </div>
  );
}
