// Shared types for notifications

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
