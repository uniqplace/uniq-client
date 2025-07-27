


import axios from 'axios';
import type { NotificationsResponse } from '../types/notification';
import getUserIdFromToken from '../utils/getUserIdFromToken';

// Generic safeFetch helper for API calls
async function safeFetch<T>(fn: () => Promise<{ data: T }>, fallback: T, errorMsg: string): Promise<{ data: T }> {
  try {
    return await fn();
  } catch (err) {
    console.error(errorMsg, err);
    return { data: fallback };
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.defaults.withCredentials = true;


export const getNotifications = async (page = 1, limit = 10): Promise<{ data: NotificationsResponse }> => {
  return safeFetch<NotificationsResponse>(
    async () => {
      const userId = getUserIdFromToken();
      if (!userId) throw new Error('User not authenticated');
      const res = await api.get<NotificationsResponse>(`/notifications`, {
        params: { userId, page, limit },
        withCredentials: true,
      });
      return { data: res.data };
    },
    { notifications: [], pages: 1 },
    'getNotifications error:'
  );
};


export const getUnreadCount = async (): Promise<{ data: { count: number } }> => {
  return safeFetch<{ count: number }>(
    async () => {
      const userId = getUserIdFromToken();
      if (!userId) throw new Error('User not authenticated');
      const res = await api.get<{ count: number }>(`/notifications/unread-count`, {
        params: { userId },
        withCredentials: true,
      });
      return { data: res.data };
    },
    { count: 0 },
    'getUnreadCount error:'
  );
};


export const markAsRead = async (id: string): Promise<{ data: any }> => {
  return safeFetch<any>(
    async () => {
      const res = await api.put<any>(`/notifications/${id}/read`, {}, {
        withCredentials: true,
      });
      return { data: res.data };
    },
    {},
    'markAsRead error:'
  );
};


