import { useEffect, useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { getUnreadCount, getNotifications } from '../services/notificationApi';
import socket from '../services/socket';
import getUserIdFromToken from '../utils/getUserIdFromToken';
import { getCookie } from '../utils/cookies';
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

  useEffect(() => {
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

    getUnreadCount()
      .then((res: { data: { count: number } }) => setCount(res.data.count))
      .catch((err: any) => {
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
      const unreadNotifications = notificationsArr.filter((n: Notification) => !n.isRead);
      if (pageNum === 1) {
        setNotifications(unreadNotifications);
      } else {
        setNotifications((prev: Notification[]) => [...prev, ...unreadNotifications]);
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
  };
};
