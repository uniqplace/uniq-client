import { useEffect } from 'react';
import socket from '../services/socket';
import { SOCKET_EVENTS } from '../constants/socketEvents';
import { toast } from 'react-toastify';

interface UseSocketListenersOptions {
  userId?: string;
  role?: string;
}

const useSocketListeners = ({ userId, role }: UseSocketListenersOptions) => {
  useEffect(() => {
    // רישום המשתמש ב-rooms
    if (userId && role) {
      socket.emit(SOCKET_EVENTS.REGISTER_USER, { userId, role });
    }

    // האזנה לאירועים
    const handleNewBid = (bidData: any) => {
      toast.info(`New bid received: ${bidData.title || 'No title'}`);
    };
    const handleBidResponse = (response: any) => {
      toast.success(`Bid response: ${response.status}`);
    };
    const handleGeneralNotification = (message: any) => {
      toast.warning(`Notification: ${message.text}`);
    };

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
