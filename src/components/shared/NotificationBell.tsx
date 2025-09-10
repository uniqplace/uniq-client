import { useEffect, useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Bell } from 'lucide-react';
import { ListBox } from 'primereact/listbox';
import { Tag } from 'primereact/tag';
import { deduplicateNotifications } from '../../utils/notificationHelpers';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
  import { useLoadMore } from '../../hooks/useLoadMore';

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


const NotificationBell = () => {

  // Handler for notification click (must be before return)
  const handleNotificationClick = async (e: any) => {
    if (!e.value || !isObject(e.value)) return;
    const notification = e.value;
    await markNotificationAsRead(notification._id);
    setIsOpen(false);
    if (notification.type === 'NEW_BID' && notification.bidRequestId) {
      navigate(`/MyBidRequests/${notification.bidRequestId}`);
    } else if (notification.link) {
      navigate(notification.link);
    }
  };

  const navigate = useNavigate();
  const {
    count,
    notifications,
    hasMore,
    authError,
    loading,
    error,
    toastRef,
    loadMore,
    markNotificationAsRead,
  } = useNotifications();
  const { handleLoadMore } = useLoadMore(hasMore, loading, loadMore);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const listRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll using Intersection Observer
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

  const bellRef = useRef<HTMLDivElement>(null);

  const handleBellClick = () => {
    setIsOpen((prev) => !prev);
  };

  // Close notifications when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isOpen]);

  return (
    <>
      <Toast ref={toastRef} />
      <div className="relative" ref={bellRef}>
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
                    key={isOpen ? 'open' : 'closed'}
                    options={deduplicateNotifications(notifications)}
                    optionLabel="title"
                    onChange={handleNotificationClick}
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
                  {/* Show spinner only once: center if empty, bottom if not */}
                  {loading && (
                    deduplicateNotifications(notifications).length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem', color: '#6366f1' }} />
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.5rem', color: '#6366f1' }} />
                      </div>
                    )
                  )}
                </div>
              )}
              <div className="p-0 border-t border-gray-200">
                {/* Removed auto-triggered loadMore to prevent multiple API calls */}
                <div style={{ padding: 0, margin: 0 }}>
                  <Button
                    label="Load more notifications"
                    icon="pi pi-chevron-down"
                    onClick={handleLoadMore}
                    className="p-button-sm w-full flex items-center justify-center px-4 pb-4 pt-2"
                    style={{ borderRadius: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, width: '100%' }}
                    disabled={!hasMore || loading}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationBell;
