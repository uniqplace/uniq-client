
import { useEffect, useState, useCallback, useRef } from 'react';
import { getUnreadCount, getNotifications } from '../services/notificationApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { Notification } from '../types/notification';
import { socket_events } from '../constants/socketEvents';
import { initializeSocket } from '../services/socket';

type UnreadCountRes = { data: { count: number } };

const INCREMENT_EVENTS = new Set<string>([
  socket_events.general_notification,
  socket_events.new_bid,
  socket_events.new_bid_offer,
  socket_events.new_order,
  socket_events.chat_new_thread,
  socket_events.bid_sent_confirmation,
]);

export const useNotifications = () => {
  const [count, setCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [authError, setAuthError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const userId = useSelector((state: RootState) => state.user.id);

  // --- NEW: Fuse against double subscription in StrictMode, and deduplication by _id
  const subscribedRef = useRef(false);
  const seenIdsRef = useRef<Set<string>>(new Set());

  const refreshUnreadCount = useCallback(async () => {
    if (!userId) return;
    try {
      const res: UnreadCountRes = await getUnreadCount(userId);
      setCount(res.data.count);
    } catch (err: any) {
      if (err?.response?.status === 401) setAuthError(true);
    }
  }, [userId]);

  const loadNotifications = useCallback(
    async (pageNum: number) => {
      if (!userId) {
        setAuthError(true);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await getNotifications(userId, pageNum);
        const arr = Array.isArray(res.data?.notifications)
          ? (res.data.notifications as Notification[])
          : [];
        const unread = arr.filter((n) => !n.isRead);

        // --- NEW: Deduplication also when loading from server
        const next = (prev: Notification[]) => {
          const byId = new Set(prev.map((n: any) => n?._id).filter(Boolean));
          const merged = [
            ...prev,
            ...unread.filter((n: any) => (n?._id ? !byId.has(n._id) : true)),
          ];
          return merged;
        };

        if (pageNum === 1) {
          setNotifications(unread);
        } else {
          setNotifications(next);
        }

        setHasMore(pageNum < (res.data?.pages ?? 1));
        setPage(pageNum);
      } catch (err: any) {
        if (err?.response?.status === 401) setAuthError(true);
        else setError('Error loading notifications');
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const loadMore = useCallback(() => {
    if (hasMore && !loading) loadNotifications(page + 1);
  }, [hasMore, loading, loadNotifications, page]);

  useEffect(() => {
    if (!userId) return;
    if (subscribedRef.current) return;      // ← מונע רישום כפול
    subscribedRef.current = true;

    const socket = initializeSocket();

    // נבנה once את ההנדלרים (נשתמש באותם רפרנסים ב-off)
    const makeHandler = (eventName: string) => (data: any) => {
      const notificationData = data?.payload
        ? { ...data.payload }
        : { ...data, title: eventName };

      const normalized: any = {
        ...notificationData,
        type: data?.type || eventName,
      };

  // --- NEW: Deduplication by identifier (if exists) or by fallback combination
      const id = normalized?._id ?? normalized?.id ?? `${eventName}:${normalized?.createdAt ?? ''}:${normalized?.title ?? ''}`;
      if (seenIdsRef.current.has(id)) return;
      seenIdsRef.current.add(id);

      if (INCREMENT_EVENTS.has(eventName)) {
        setNotifications((prev) => [normalized, ...prev]);
        setCount((prev) => prev + 1);
      }
    };

    const handlers = {
      general: makeHandler(socket_events.general_notification),
      newBid: makeHandler(socket_events.new_bid),
      newOffer: makeHandler(socket_events.new_bid_offer),
      newOrder: makeHandler(socket_events.new_order),
      chatThread: makeHandler(socket_events.chat_new_thread),
      bidConfirm: makeHandler(socket_events.bid_sent_confirmation),
    };

    socket.on(socket_events.general_notification, handlers.general);
    socket.on(socket_events.new_bid, handlers.newBid);
    socket.on(socket_events.new_bid_offer, handlers.newOffer);
    socket.on(socket_events.new_order, handlers.newOrder);
    socket.on(socket_events.chat_new_thread, handlers.chatThread);
    socket.on(socket_events.bid_sent_confirmation, handlers.bidConfirm);

    // initial
    refreshUnreadCount();
    loadNotifications(1);

    return () => {
      socket.off(socket_events.general_notification, handlers.general);
      socket.off(socket_events.new_bid, handlers.newBid);
      socket.off(socket_events.new_bid_offer, handlers.newOffer);
      socket.off(socket_events.new_order, handlers.newOrder);
      socket.off(socket_events.chat_new_thread, handlers.chatThread);
      socket.off(socket_events.bid_sent_confirmation, handlers.bidConfirm);
      subscribedRef.current = false;
  // Do not reset seenIdsRef to allow deduplication even after short unmount in Dev
    };
  }, [userId, refreshUnreadCount, loadNotifications]);

  return {
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
  };
};
