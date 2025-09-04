import { useEffect, useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Bell } from 'lucide-react';
import { ListBox } from 'primereact/listbox';
import { Tag } from 'primereact/tag';
import socket from '../../services/socket';
import { getUnreadCount, markAsRead } from '../../services/notificationApi';
import { deduplicateNotifications } from '../../utils/notificationHelpers';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useNotifications } from '../../hooks/useNotifications';
import { socket_events } from '../../constants/socketEvents';

import { useAppSelector } from '../../hooks/hooks';
import type { RootState } from '../../store';

// Utility function to check if a value is an object
const isObject = (value: any): boolean => {
  return value !== null && typeof value === 'object';
};

const eventIcons: Record<string, string> = {
  new_bid: '📨',
  new_order: '🛒',
  bid_sent_confirmation: '✅',
  general_notification: '🔔',
  register_user: '👤',
  connect: '🔗',
};

// Helper function to standardize notification data
function buildNotificationData(data: any, eventName: string): any {
  if (data?.payload) {
    return { ...data.payload, type: data?.type || eventName };
  }
  return {
    ...data,
    title: data?.title || eventName,
    type: data?.type || eventName,
  };
}

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
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);
  const user = useAppSelector((state: RootState) => state.user);

  const listRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchCount = async () => {
      try {
        const res = await getUnreadCount(user?.id ?? '');
        setCount(res.data.count);
      } catch (err) {
        if (toastRef.current) {
          toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch unread count', life: 3000 });
        } else {
          toast.error('Failed to fetch unread count');
        }
      }
    };

    fetchCount();

    const eventNames = Object.values(socket_events);
    eventNames.forEach((eventName) => {
      socket.on(eventName, (data: any) => {
        setCount((prev) => prev + 1);
        const notificationData = buildNotificationData(data, eventName);
        setNotifications((prev) => [notificationData, ...prev]);
      });
    });

    return () => {
      eventNames.forEach((eventName) => {
        socket.off(eventName);
      });
    };
  }, [user, setCount, setNotifications, toastRef]);

  
  useEffect(() => {
    const onScroll = () => {
      if (!listRef.current || !loading || !hasMore) return; // Stop if no more notifications

      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      // Check if scrolled to the bottom (90% of scroll height)
      if (scrollTop + clientHeight >= scrollHeight * 0.9) {
        loadMore();
      }
    };

    const el = listRef.current;
    if (el) {
      el.addEventListener('scroll', onScroll);
    }

    return () => {
      if (el) {
        el.removeEventListener('scroll', onScroll);
      }
    };
  }, [loading, hasMore, loadMore]);

  // Intersection observer to auto-load more
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loaderRef, hasMore, loadMore]);

  const handleBellClick = async () => {
    if (!isOpen && !notificationsLoaded) {
      await loadNotifications(1); // Load notifications only if not already loaded
      setNotificationsLoaded(true);
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <Toast ref={toastRef} />
      <div className="relative">
        <button
          className="relative"
          onClick={handleBellClick}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          aria-label="Toggle notifications"
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
              ) : error ? (
                <div className="p-4 text-center text-red-500 text-sm">{error}</div>
              ) : (
                <div className="flex flex-col flex-1" style={{ maxHeight: '16rem', overflowY: 'auto', marginTop: '1.5rem', flex: '1 1 auto' }} ref={listRef}>
                  <ListBox
                    value={null}
                    options={deduplicateNotifications(notifications)}
                    optionLabel="title"
                    onChange={async (e) => {
                      if (!e.value || !isObject(e.value)) return;
                      const notification = e.value;
                      setNotifications((prev) => prev.filter((item) => item && item._id && item._id !== notification._id));
                      try {
                        await markAsRead(notification._id);
                        const res = await getUnreadCount(user?.id ?? '');
                        setCount(res.data.count);
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
                      <div className="p-2 border-b text-sm cursor-pointer flex items-center gap-2">
                        <Tag
                          value={eventIcons[notification.type?.toLowerCase()] || '🔔'}
                          style={{ marginRight: '8px', fontSize: '1.2em', background: '#e0e7ff', color: '#3730a3', borderRadius: '50%', padding: '0.5em' }}
                        />
                        <span className={notification.isRead ? '' : 'font-bold'}>{notification.title}</span>
                      </div>
                    )}
                  />
                  {!hasMore && (
                    <div ref={loaderRef} style={{ textAlign: 'center', padding: '1rem', display: 'none' }}></div>
                  )}
                </div>
              )}
              <div className="px-4 pb-4 pt-2 border-t border-gray-200">
                {(user.role === 'admin' || user.role === 'manufacturer') && (
                  <Button
                    label="Show all bid request notifications"
                    className="w-full p-button-sm p-button-info"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/myBidRequestsNotifications');
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationBell;
