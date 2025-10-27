
import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from 'primereact/button';
import { Bell } from 'lucide-react';
import { ListBox } from 'primereact/listbox';
import type { ListBoxChangeEvent } from 'primereact/listbox';
import { Tag } from 'primereact/tag';
import { getUnreadCount, markAsRead } from '../../services/notificationApi';
import { deduplicateNotifications } from '../../utils/notificationHelpers';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useNotifications } from '../../hooks/useNotifications';
import { useAppSelector } from '../../hooks/hooks';
import type { RootState } from '../../store';
import type { Notification } from '../../types/notification';

// Safe helper instead of calling toLowerCase when type is not a string
const lower = (v: unknown) => (typeof v === 'string' ? v.toLowerCase() : '');

const eventIcons: Record<string, string> = {
  'chat:new-thread': '💬',
  'chat:new-message': '📩',
  new_bid: '📨',
  new_order: '🛒',
  new_bid_offer: '💼',
  bid_sent_confirmation: '✅',
  general_notification: '🔔',
  // Note: No icon for register_user/connect since these are not user notifications
};

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object';

const NotificationBell = () => {
  const navigate = useNavigate();

  const {
    count,
    notifications,
    hasMore,
    authError,
    loading,
    error,
    setNotifications,
    setCount,
    loadNotifications,
    loadMore,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);

  const user = useAppSelector((state: RootState) => state.user);
  const listRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Infinity scroll: listens to scroll on the container
useEffect(() => {
  const onScroll = () => {
    if (!listRef.current || loading || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollTop + clientHeight >= scrollHeight * 0.9) {
      loadMore();
    }
  };

  const el = listRef.current;
  if (el) el.addEventListener('scroll', onScroll, { passive: true });

  return () => {
    if (el) el.removeEventListener('scroll', onScroll);
  };
}, [loading, hasMore, loadMore]);


  // Loading by IntersectionObserver when reaching the bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );
    const node = loaderRef.current;
    if (node) observer.observe(node);
    return () => {
      if (node) observer.unobserve(node);
    };
  }, [hasMore, loadMore]);

  // Lazy loading when opening the bell
  const handleBellClick = useCallback(async () => {
    if (!isOpen && !notificationsLoaded) {
      await loadNotifications(1);
      setNotificationsLoaded(true);
    }
    setIsOpen((prev) => !prev);
  }, [isOpen, notificationsLoaded, loadNotifications]);

  // Template for ListBox item — explicit type to avoid any
  const renderItem = (notification: Notification) => {
    const iconKey = lower(notification.type);
    return (
      <div className="p-2 border-b text-sm cursor-pointer flex items-center gap-2">
        <Tag
          value={eventIcons[iconKey] || '🔔'}
          style={{
            marginRight: '8px',
            fontSize: '1.2em',
            background: '#E0E7FF',
            color: '#3730A3',
            borderRadius: '50%',
            padding: '0.5em',
          }}
        />
        <span className={notification.isRead ? '' : 'font-bold'}>
          {notification.title ?? 'Notification'}
        </span>
      </div>
    );
  };

  // onChange with PrimeReact type to avoid compilation errors
  const handleChange = async (e: ListBoxChangeEvent) => {
    const value = e.value;
    if (!isObject(value)) return;

    const notification = value as unknown as Notification;

  // Remove from local list
    setNotifications((prev) =>
      prev.filter((item) => item && item._id && item._id !== notification._id)
    );

    try {
      await markAsRead(notification._id);
  // Refresh accurate count from server
      if (user?.id) {
        const res = await getUnreadCount(user.id);
        setCount(res.data.count);
      }
      setIsOpen(false);

  // Custom navigation
      if (notification.type === 'NEW_BID' && (notification as any).bidRequestId) {
        navigate(`/MyBidRequests/${(notification as any).bidRequestId}`);
      } else if ((notification as any).link) {
        navigate((notification as any).link);
      }
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  // Notification list after deduplication; keeps Notification[] type
  const options: Notification[] = deduplicateNotifications(
    notifications
  ) as Notification[];

  return (
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
        <div
          className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md z-50 border border-gray-200 flex flex-col"
          style={{ minHeight: '350px' }}
        >
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
              <div className="p-4 text-center text-red-500 text-sm">
                Please login to view notifications
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500 text-sm">{error}</div>
            ) : (
              <div
                className="flex flex-col flex-1"
                style={{
                  maxHeight: '16rem',
                  overflowY: 'auto',
                  marginTop: '1.5rem',
                  flex: '1 1 auto',
                }}
                ref={listRef}
              >
                <ListBox
                  value={null}
                  options={options}
                  optionLabel="title" // PrimeReact will display by title
                  onChange={handleChange}
                  itemTemplate={renderItem}
                />
                {hasMore && (
                  <div ref={loaderRef} style={{ textAlign: 'center', padding: '1rem' }} />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

