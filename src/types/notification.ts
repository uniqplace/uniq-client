// Shared types for notifications

export interface Notification {
  _id: string;
  title: string;
  message: string;
  bidRequestId?: string;
  link?: string; // Optional link for the notification
  isRead: boolean;
  createdAt: string;
  [key: string]: any;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pages: number;
}
