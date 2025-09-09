import { useEffect, useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { getUnreadCount, getNotifications, markAsRead } from '../services/notificationApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { Notification } from '../types/notification';
// ...existing code...


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

  // Prevent duplicate fetches and only fetch when logged in and userId exists
  // Debounce notification fetch to prevent multiple API calls
  useEffect(() => {
    let ignore = false;
  let debounceTimeout: number;
    if (!isUserLoggedIn || !userId) {
      setNotifications([]);
      setCount(0);
      setPage(1);
      setHasMore(true);
      setAuthError(false);
      setError(null);
      return;
    }

    debounceTimeout = setTimeout(() => {
      setLoading(true);
      setError(null);
      Promise.all([
        getUnreadCount(userId),
        getNotifications(userId, 1)
      ])
        .then(async ([countRes, notifRes]) => {
          if (ignore) return;
          setCount(countRes.data.count);
          let notificationsArr = Array.isArray(notifRes.data?.notifications) ? notifRes.data.notifications : [];
          let unreadNotifications = notificationsArr.filter((n: Notification) => !n.isRead);
          let currentPage = 1;
          let totalPages = notifRes.data?.pages ?? 1;
          // Keep loading more pages until we find unread notifications or run out of pages
          while (unreadNotifications.length === 0 && currentPage < totalPages) {
            currentPage++;
            const nextRes = await getNotifications(userId, currentPage);
            notificationsArr = Array.isArray(nextRes.data?.notifications) ? nextRes.data.notifications : [];
            unreadNotifications = notificationsArr.filter((n: Notification) => !n.isRead);
          }
          setNotifications(unreadNotifications);
          setHasMore(currentPage < totalPages);
          setPage(currentPage);
        })
        .catch((err: any) => {
          if (err?.response?.status === 401) setAuthError(true);
          else setError('Error loading notifications');
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }, 300); // 300ms debounce

    return () => {
      ignore = true;
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
  }, [userId, isUserLoggedIn]);


  const loadNotifications = async (pageNum: number) => {
    if (!userId || loading || !hasMore) {
      if (!userId) setAuthError(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getNotifications(userId, pageNum);
      const notificationsArr = Array.isArray(res.data?.notifications) ? res.data.notifications : [];
      const unreadNotifications = notificationsArr.filter((n: Notification) => !n.isRead);
      if (pageNum === 1) {
        setNotifications(unreadNotifications);
      } else {
        setNotifications((prev: Notification[]) => [...prev, ...unreadNotifications]);
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
      setNotifications((prev) => prev.filter((item) => item && item._id && item._id !== notificationId));
      const res = await getUnreadCount(userId);
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
