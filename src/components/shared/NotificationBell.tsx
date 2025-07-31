import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Bell } from 'lucide-react';
import { ListBox } from 'primereact/listbox';
import socket from '../../services/socket';
import  getUserIdFromToken from '../../utils/getUserIdFromToken';
import { getCookie } from '../../utils/cookies';
import { getUnreadCount, markAsRead } from '../../services/notificationApi';
import { deduplicateNotifications } from '../../utils/notificationHelpers';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useNotifications } from '../../hooks/useNotifications';

// Utility function to check if a value is an object
const isObject = (value: any): boolean => {
  return value !== null && typeof value === 'object';
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const {
    count,
    notifications,
    hasMore,
    authError,
    loading,
    error,
    toastRef,
    setNotifications,
    setCount,
    loadNotifications,
    loadMore,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    // Get token from cookies
    const token = getCookie('token');
    if (!token) {
      return;
    }

    const userId = getUserIdFromToken();
    if (!userId) {
      return;
    }

    socket.on('new_bid', (data: any) => {
      setCount((prev) => prev + 1);
      setNotifications((prev) => [data.payload, ...prev]);
    });

    return () => {
      socket.off('new_bid'); // Updated to match the listener event name
    };
  }, []);

  const fetchUnreadCount = async (setCount: (count: number) => void, toastRef: React.RefObject<Toast | null>) => {
    try {
      const res = await getUnreadCount();
      setCount(res.data.count);
    } catch (err) {
      if (toastRef.current) {
        toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch unread count', life: 3000 });
      } else {
        toast.error('Failed to fetch unread count');
      }
    }
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
                      if (!e.value || !isObject(e.value)) return; // Use the utility function
                      const notification = e.value;
                      setNotifications((prev) => prev.filter(item => item && item._id && item._id !== notification._id));
                      try {
                        await markAsRead(notification._id);
                        // Update bell counter after marking as read
                        await fetchUnreadCount(setCount, toastRef);
                        setIsOpen(false);
                        if (notification.type === 'NEW_BID' && notification.bidRequestId) {
                          navigate(`/MyBidRequests/${notification.bidRequestId}`);
                        } else if (notification.link) {
                          navigate(notification.link);
                        }
                      } catch (err) {
                        if (toastRef.current) {
                          toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to mark notification as read', life: 3000 });
                        } else {
                          toast.error('Failed to mark notification as read');
                        }
                      }
                    }}
                    itemTemplate={(notification) => (
                      <div className="p-2 border-b text-sm cursor-pointer">
                        <span className={notification.isRead ? '' : 'font-bold'}>{notification.title}</span>
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
            {/* <div className="px-4 pb-4 pt-2 border-t border-gray-200">
              <Button
                label="Show all bid request notifications"
                className="w-full p-button-sm p-button-info"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/myBidRequestsNotifications');
                }}
              />
            </div> */}
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationBell;
