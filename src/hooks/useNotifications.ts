import { useEffect, useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { getUnreadCount, getNotifications } from '../services/notificationApi';
import socket from '../services/socket';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
// import { getCookie } from '../utils/cookies';
import type { Notification } from '../types/notification';
import {socket_events } from '../constants/socketEvents';
import useSocketListeners from './useSocketListeners';

export const useNotifications = () => {
  const [count, setCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [authError, setAuthError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const toastRef = useRef<Toast>(null);
  useSocketListeners();

  const userId = useSelector((state: RootState) => state.user.id);

  useEffect(() => {
    // const token = getCookie('token');
    if (!userId) {
      return;
    }

    socket.on(socket_events.general_notification, (data: any) => {
      setCount((prev) => prev + 1);
      setNotifications((prev) => [data.payload, ...prev]);
    });

    getUnreadCount(userId)
      .then((res: { data: { count: number } }) => setCount(res.data.count))
      .catch((err: any) => {
        if (err?.response?.status === 401) setAuthError(true);
      });
    loadNotifications(1);

    return () => {
      socket.off(socket_events.general_notification);
    };
  }, [userId]);

  const loadNotifications = async (pageNum: number) => {
    if (!userId) {
      setAuthError(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await getNotifications(userId, pageNum); // Non-null assertion operator
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
