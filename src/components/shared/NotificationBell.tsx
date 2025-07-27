import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { ListBox } from 'primereact/listbox';
import socket from '../../services/socket';
import { getUnreadCount, getNotifications, markAsRead } from '../../services/notificationApi';
import { toast } from 'react-toastify';
import getUserIdFromToken from '../../utils/getUserIdFromToken';
import { getCookie } from '../../utils/cookies';
import { deduplicateNotifications } from '../../utils/notificationHelpers';

interface Notification {
  _id: string;
  title: string;
  isRead: boolean;
  [key: string]: any;
}



const NotificationBell = () => {
  const [count, setCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [authError, setAuthError] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get token from cookies
    const token = getCookie('token');
    if (!token) {
      setAuthError(true);
      return;
    }

    const userId = getUserIdFromToken();
    if (!userId) {
      setAuthError(true);
      return;
    }

    socket.on('new_bid', (data: any) => {
      getUnreadCount()
        .then((res) => setCount(res.data.count))
        .catch(() => {});
      setNotifications((prev) => [data.payload, ...prev]);
    });

    getUnreadCount()
      .then((res) => setCount(res.data.count))
      .catch((err) => {
        if (err?.response?.status === 401) setAuthError(true);
      });
    loadNotifications(1);


 

    return () => {
      socket.off('general_notification');
    };
  }, []);

  const loadNotifications = async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getNotifications(pageNum);
      const notificationsArr = Array.isArray(res.data?.notifications) ? res.data.notifications : [];
      // Filter only unread notifications
      const unreadNotifications = notificationsArr.filter(n => !n.isRead);
      if (pageNum === 1) {
        setNotifications(unreadNotifications);
      } else {
        setNotifications((prev) => [...prev, ...unreadNotifications]);
      }
      setHasMore(pageNum < (res.data?.pages ?? 1));
      setPage(pageNum);
    } catch (err: any) {
      if (err?.response?.status === 401) setAuthError(true);
      else setError('שגיאה בטעינת התראות');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore) loadNotifications(page + 1);
  };

  return (
    <div className="relative">
      <button
        className="relative"
        onClick={async () => {
          if (!isOpen) {
            // On open: load notifications
            await loadNotifications(1);
          }
          setIsOpen((prev) => !prev);
        }}
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {count > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md z-50">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setIsOpen(false)}
            aria-label="Close notifications"
          >
            ×
          </button>
          {authError ? (
            <div className="p-4 text-center text-red-500 text-sm">יש להתחבר כדי לראות התראות</div>
          ) : loading ? (
            <div className="p-4 text-center text-gray-500 text-sm">טוען התראות...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500 text-sm">{error}</div>
          ) : (
            <>
              <ListBox
                value={null}
                options={deduplicateNotifications(notifications)}
                optionLabel="title"
                style={{ maxHeight: '16rem', overflowY: 'auto', marginTop: '1.5rem' }}
                onChange={async (e) => {
                  const n = e.value;
                  setNotifications((prev) => prev.filter(item => item && item._id && item._id !== n._id));
                  try {
                    await markAsRead(n._id);
                    // Update bell counter after marking as read
                    getUnreadCount()
                      .then((res) => setCount(res.data.count))
                      .catch(() => {});
                  } catch (err) {
                    toast.error('Failed to mark notification as read');
                  }
                }}
                itemTemplate={(n) => (
                  <div className="p-2 border-b text-sm cursor-pointer">
                    <span className={n.isRead ? '' : 'font-bold'}>{n.title}</span>
                  </div>
                )}
              />
              {hasMore && (
                <button
                  className="w-full py-2 text-center text-blue-600 hover:underline bg-gray-50 border-t"
                  style={{ border: 'none', cursor: 'pointer' }}
                  onClick={loadMore}
                >
                  טען עוד
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
