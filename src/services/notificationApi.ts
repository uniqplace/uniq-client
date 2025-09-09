import axios from 'axios';
import type { NotificationsResponse } from '../types/notification';
// import getUserIdFromToken from '../utils/getUserIdFromToken';
// import { useSelector } from 'react-redux';
// Remove incorrect RootState import

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


export const getNotifications = async (userId: string, page = 1, limit = 10): Promise<{ data: NotificationsResponse }> => {
  return safeFetch<NotificationsResponse>(
    async () => {
      if (!userId) {
        console.error('getNotifications error: User ID is undefined. Ensure the user is authenticated.');
        throw new Error('User not authenticated');
      }
      const res = await api.get<NotificationsResponse>(`/notifications/unread`, {
        params: { userId, page, limit },
        withCredentials: true,
      });
      return { data: res.data };
    },
    { notifications: [], pages: 1 },
    'getNotifications error:'
  );
};


export const getUnreadCount = async (userId: string | undefined): Promise<{ data: { count: number } }> => {
  return safeFetch<{ count: number }>(
    async () => {
   
      if (!userId) {
        console.error('getUnreadCount error: User ID is undefined. Ensure the user is authenticated.');
        throw new Error('User not authenticated');
      }
      const res = await api.get<{ count: number }>(`/notifications/unread-count/user/${userId}`, {
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

// Fetch notifications using fetch API (for use in React components)
export async function getNotificationsFetch(userId: string, page: number = 1, limit: number = 10): Promise<{ notifications: any[]; pages: number }> {
  const url = `${import.meta.env.VITE_API_BASE_URL}/notifications/${userId}?page=${page}&limit=${limit}`;
  const response = await fetch(url, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Error loading notifications');
  const data = await response.json();
  return {
    notifications: Array.isArray(data.notifications) ? data.notifications : [],
    pages: data.pages || 1,
  };
}
