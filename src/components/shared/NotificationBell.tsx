import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Bell } from 'lucide-react';
import { ListBox } from 'primereact/listbox';
import socket from '../../services/socket';
import { getUnreadCount, getNotifications, markAsRead } from '../../services/notificationApi';
import { toast } from 'react-toastify';
import getUserIdFromToken from '../../utils/getUserIdFromToken';
import { getCookie } from '../../utils/cookies';
import { deduplicateNotifications } from '../../utils/notificationHelpers';
import { useNavigate } from 'react-router-dom';

interface Notification {
  _id: string;
  title: string;
  isRead: boolean;
  [key: string]: any;
}



const NotificationBell = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [authError, setAuthError] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const toastRef = useRef<Toast>(null);

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
        .catch(() => { });
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
      else setError('Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore) loadNotifications(page + 1);
  };

  return (
    <>
      {/* PrimeReact Toast for errors */}
      <Toast ref={toastRef} />
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
          <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md z-50 border border-gray-200 flex flex-col" style={{ minHeight: '350px' }}>
            <Button
              icon="pi pi-times"
              className="p-button-rounded p-button-text absolute top-2 right-2"
              style={{ zIndex: 10 }}
              onClick={() => setIsOpen(false)}
              aria-label="Close notifications"
            />
            <div className="px-4 pt-6 pb-2 flex-1 flex flex-col">
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Notifications</h3>
              {authError ? (
                <div className="p-4 text-center text-red-500 text-sm">Please login to view notifications</div>
              ) : loading ? (
                <div className="p-4 text-center text-gray-500 text-sm">Loading notifications...</div>
              ) : error ? (
                <div className="p-4 text-center text-red-500 text-sm">{error}</div>
              ) : (
                <div className="flex flex-col flex-1">
                  <ListBox
                    value={null}
                    options={deduplicateNotifications(notifications)}
                    optionLabel="title"
                    style={{ maxHeight: '16rem', overflowY: 'auto', marginTop: '1.5rem', flex: '1 1 auto' }}
                    onChange={async (e) => {
                      const n = e.value;
                      setNotifications((prev) => prev.filter(item => item && item._id && item._id !== n._id));
                      try {
                        await markAsRead(n._id);
                        // Update bell counter after marking as read
                        getUnreadCount()
                          .then((res) => setCount(res.data.count))
                          .catch(() => { });
                      } catch (err) {
                        if (toastRef.current) {
                          toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to mark notification as read', life: 3000 });
                        } else {
                          toast.error('Failed to mark notification as read');
                        }
                      }
                    }}
                    itemTemplate={(n) => (
                      <div className="p-2 border-b text-sm cursor-pointer">
                        <span className={n.isRead ? '' : 'font-bold'}>{n.title}</span>
                      </div>
                    )}
                  />
                  {hasMore && (
                    <div className="mt-2 flex-shrink-0">
                      <Button
                        label="Load more"
                        className="w-full p-button-text p-button-sm"
                        style={{ borderTop: '1px solid #eee' }}
                        onClick={loadMore}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="px-4 pb-4 pt-2 border-t border-gray-200">
              <Button
                label="Show all bid request notifications"
                className="w-full p-button-sm p-button-info"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/my-bid-requests-notifications');
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationBell;
