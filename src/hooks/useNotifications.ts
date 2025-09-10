import { useState, useRef } from 'react';
import { useDebouncedEffect } from './useDebouncedEffect';
import { Toast } from 'primereact/toast';
import { getUnreadCount, getUnreadNotifications, markAsRead } from '../services/notificationApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { Notification } from '../types/notification';


export const useNotifications = () => {
  const [count, setCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [authError, setAuthError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const toastRef = useRef<Toast>(null);
  const userId = useSelector((state: RootState) => state.user.id);
  const isUserLoggedIn = useSelector((state: RootState) => state.auth.isUserLoggedIn);

  // Debounced notification fetch using custom hook
  useDebouncedEffect(() => {
    let ignore = false;
    if (!isUserLoggedIn || !userId) {
      setNotifications([]);
      setCount(0);
      setPage(1);
      setHasMore(true);
      setAuthError(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      getUnreadCount(userId),
      getUnreadNotifications(userId, 1)
    ])
      .then(([countRes, notifRes]) => {
        if (ignore) return;
        setCount(countRes.data.count);
        const notificationsArr = Array.isArray(notifRes.data?.notifications) ? notifRes.data.notifications : [];
        setNotifications(notificationsArr);
        const totalPages = notifRes.data?.pages ?? 1;
        setHasMore(1 < totalPages);
        setPage(1);
      })
      .catch((err: any) => {
        if (err?.response?.status === 401) setAuthError(true);
        else setError('Error loading notifications');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [userId, isUserLoggedIn], 300);


  const loadNotifications = async (pageNum: number) => {
    if (!userId || loading || !hasMore) {
      if (!userId) setAuthError(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getUnreadNotifications(userId, pageNum);
      const notificationsArr = Array.isArray(res.data?.notifications) ? res.data.notifications : [];
      if (pageNum === 1) {
        setNotifications(notificationsArr);
      } else {
        setNotifications((prev: Notification[]) => [...prev, ...notificationsArr]);
      }
      const totalPages = res.data?.pages ?? 1;
      setHasMore(pageNum < totalPages);
      setPage(pageNum);
    } catch (err: any) {
      if (err?.response?.status === 401) setAuthError(true);
      else setError('Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!hasMore || loading) return;
    loadNotifications(page + 1);
  };

  // Mark notification as read and update count
  const markNotificationAsRead = async (notificationId: string) => {
    if (!userId) return;
    try {
      await markAsRead(notificationId);
      const res = await getUnreadCount(userId);
      setNotifications((prev) => prev.filter((item) => item && item._id && item._id !== notificationId));
      setCount(res.data.count);
    } catch (err) {
      // Optionally handle error
    }
  };

  return {
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
    markNotificationAsRead,
  };
};
