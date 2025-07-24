
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.defaults.withCredentials = true;

export interface Notification {
  _id: string;
  title: string;
  isRead: boolean;
  createdAt: string;
  [key: string]: any;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pages: number;
}

export const getNotifications = async (userId: string, page = 1, limit = 10): Promise<{ data: NotificationsResponse }> => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications?userId=${userId}&page=${page}&limit=${limit}`,
      { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    const data = await res.json();
    return { data };
  } catch (err) {
    console.error('getNotifications error:', err);
    return { data: { notifications: [], pages: 1 } };
  }
};

export const getUnreadCount = async (userId: string): Promise<{ data: { count: number } }> => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications/unread-count?userId=${userId}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch unread count');
    const data = await res.json();
    return { data };
  } catch (err) {
    console.error('getUnreadCount error:', err);
    return { data: { count: 0 } };
  }
};

export const markAsRead = async (id: string): Promise<{ data: any }> => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to mark as read');
    const data = await res.json();
    return { data };
  } catch (err) {
    console.error('markAsRead error:', err);
    return { data: {} };
  }
};


