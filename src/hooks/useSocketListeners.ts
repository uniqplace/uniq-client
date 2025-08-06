import { useEffect } from 'react';
import { disconnectSocket, getSocket, initializeSocket } from '../services/socket';
import { SOCKET_EVENTS } from '../constants/socketEvents';
import { toast } from 'react-toastify';
import { useAppSelector } from './hooks';
import type { RootState } from '../store'; // Adjust the path if your store file is elsewhere
import type { Notification } from '../types/notification';




const useSocketListeners = () => {

  const user= useAppSelector((state: RootState) => state.user);
 useEffect(() => {
    if (user?.id && user?.email) {
      const socket = initializeSocket();
      
      const handleBidSentConfirmation = (data: Notification) => {
        console.log('Bid sent confirmation:', data);
        if (data.error) toast.error(data.message);
        else toast.success(data.message);
      };
      const handleNewBid = (bidData: Notification) => {
        toast.info(`New bid received: ${bidData.title || 'No title'}`);
      };
      const handleGeneralNotification = (data: Notification) => {
        console.log('General notification:', data);
        if (data.error) toast.error(data.message);
        else toast.success(data.message);
      };

      const handleCONNECT =  () => {

        console.log('Socket connected with ID:', socket.id);
        if (user?.id) {
          socket.emit(SOCKET_EVENTS.REGISTER_USER, { userId: user.id, role: user.role });
          console.log('User registered to socket:', { userId: user.id, role: user.role });
        }
      };

      socket.on(SOCKET_EVENTS.NEW_BID, handleNewBid);
      socket.on(SOCKET_EVENTS.GENERAL_NOTIFICATION, handleGeneralNotification);
      socket.on(SOCKET_EVENTS.BID_SENT_CONFIRMATION, handleBidSentConfirmation);
      socket.on(SOCKET_EVENTS.CONNECT, handleCONNECT);

      return () => {
        socket.off(SOCKET_EVENTS.NEW_BID, handleNewBid);
        socket.off(SOCKET_EVENTS.GENERAL_NOTIFICATION, handleGeneralNotification);
        socket.off(SOCKET_EVENTS.BID_SENT_CONFIRMATION, handleBidSentConfirmation);
        socket.off(SOCKET_EVENTS.CONNECT, handleCONNECT);
      };
    } else {
      disconnectSocket();
    }
  }, [user?.id, user?.email]);

    useEffect(() => {
    if (user?.id) {
      const socket = getSocket();
      socket?.emit(SOCKET_EVENTS.REGISTER_USER, user.id);
    }
  }, [user?.id]);
}

  export default useSocketListeners;
