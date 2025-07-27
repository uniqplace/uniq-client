import { useEffect } from 'react';
import socket from '../services/socket';
import { SOCKET_EVENTS } from '../constants/socketEvents';

import { toast } from 'react-toastify';
import type { BidRequest, BidResponse, SocketNotification } from '../types/socket';


interface UseSocketListenersOptions {
  userId?: string;
  role?: string;
}



const useSocketListeners = ({ userId, role }: UseSocketListenersOptions) => {
  useEffect(() => {
    // Register user in socket rooms
    if (userId && role) {
      socket.emit(SOCKET_EVENTS.REGISTER_USER, { userId, role });
    }

    // Listen to socket events
    const handleNewBid = (bidData: BidRequest) => {
      toast.info(`New bid received: ${bidData.status || 'No title'}`);
    };
    const handleBidResponse = (response: BidResponse) => {
      toast.success(`Bid response: ${response.status}`);
    };
    const handleGeneralNotification = (message: SocketNotification) => {
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
