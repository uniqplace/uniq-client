import { useEffect } from 'react';
import socket from '../services/socket';
import { SOCKET_EVENTS } from '../constants/socketEvents';
import { toast } from 'react-toastify';

interface UseSocketListenersOptions {
  userId?: string;
  role?: string;
}

interface NewBidPayload {
  title?: string;
  productId?: string;
  priceRange?: { min: number; max: number };
  status?: string;
}

interface BidResponsePayload {
  bidId: string;
  status: 'accepted' | 'rejected' | 'pending';
  message?: string;
  updatedAt?: string;
}

interface GeneralNotificationPayload {
  text: string;
  type: 'info' | 'warning' | 'success' | 'error';
  createdAt?: string;
}

// Handler functions moved outside useEffect for readability and performance
const handleNewBid = (bidData: NewBidPayload) => {
  toast.info(`New bid received: ${bidData.title || 'No title'}`);
};
const handleBidResponse = (response: BidResponsePayload) => {
  toast.success(`Bid response: ${response.status}`);
};
const handleGeneralNotification = (message: GeneralNotificationPayload) => {
  toast.warning(`Notification: ${message.text}`);
};

const useSocketListeners = ({ userId, role }: UseSocketListenersOptions) => {
  useEffect(() => {
    // Register user in socket rooms
    if (userId && role) {
      socket.emit(SOCKET_EVENTS.REGISTER_USER, { userId, role });
    }

    // Listen to socket events
    socket.on(SOCKET_EVENTS.NEW_BID, handleNewBid);
    socket.on(SOCKET_EVENTS.BID_RESPONSE, handleBidResponse);
    socket.on(SOCKET_EVENTS.GENERAL_NOTIFICATION, handleGeneralNotification);

    return () => {
      socket.off(SOCKET_EVENTS.NEW_BID, handleNewBid);
      socket.off(SOCKET_EVENTS.BID_RESPONSE, handleBidResponse);
      socket.off(SOCKET_EVENTS.GENERAL_NOTIFICATION, handleGeneralNotification);
    };
  }, [userId, role]);
};

export default useSocketListeners;
