import { useEffect } from 'react';
import { disconnectSocket, getSocket, initializeSocket } from '../services/socket';
import { SOCKET_EVENTS } from '../constants/socketEvents';

import { toast } from 'react-toastify';
//import type { BidRequest, BidResponse, SocketNotification } from '../types/socket';
import { useAppSelector } from './hooks';
import type { RootState } from '../store'; // Adjust the path if your store file is elsewhere


// interface UseSocketListenersOptions {
//   userId?: string;
//   role?: string;
// }



const useSocketListeners = () => {

  const user= useAppSelector((state: RootState) => state.user);
 useEffect(() => {
    if (user?.id && user?.email) {
      const socket = initializeSocket();
      
      const handleBidSentConfirmation = (data: any) => {
        console.log('Bid sent confirmation:', data);
        if (data.error) toast.error(data.message);
        else toast.success(data.message);
      };
      const handleGENERAL_NOTIFICATION = (data: any) => {
        console.log('General notification:', data);
        if (data.error) toast.error(data.message);
        else toast.success(data.message);
      };

      socket.on(SOCKET_EVENTS.GENERAL_NOTIFICATION, handleGENERAL_NOTIFICATION);
      socket.on(SOCKET_EVENTS.BID_SENT_CONFIRMATION, handleBidSentConfirmation);
      socket.on(SOCKET_EVENTS.CONNECT, () => {
        console.log('Socket connected with ID:', socket.id);
        if (user?.id) {
          socket.emit(SOCKET_EVENTS.REGISTER_USER, { userId: user.id, role: user.role });
          console.log('User registered to socket:', { userId: user.id, role: user.role });
        }
      });

      return () => {
        socket.off(SOCKET_EVENTS.GENERAL_NOTIFICATION, handleGENERAL_NOTIFICATION);
    //    socket.off(SOCKET_EVENTS.BID_SENT_CONFIRMATION, handleBidSentConfirmation);
        socket.off(SOCKET_EVENTS.CONNECT);
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

//   useEffect(() => {
//     const socket = getSocket();

//     if (!socket) {
//       console.warn('Socket instance is null or undefined. Retrying...');
//       return;
//     }

//     if (!socket.connected) {
//       console.error('Socket is not connected. Waiting for connection...');
//       socket.on('connect', () => {
//         console.log('Socket connected with ID:', socket.id);
//         if (userId && role) {
//           socket.emit(SOCKET_EVENTS.REGISTER_USER, { userId, role });
//           console.log('User registered to socket:', { userId, role });
//         }
//       });
//     } else {
//       console.log('Socket already connected with ID:', socket.id);
//       if (userId && role) {
//         socket.emit(SOCKET_EVENTS.REGISTER_USER, { userId, role });
//         console.log('User registered to socket:', { userId, role });
//       }
//     }

//     // Only proceed if user is authenticated
//     if (!userId || !role) {
//       console.warn('User ID or role is missing. Skipping socket registration.');
//       return;
//     }

//     socket.emit('join_room', `user_${userId}`);

//     // Listen to socket events
//     const handleNewBid = (bidData: BidRequest) => {
//       toast.info(`New bid received: ${bidData.status || 'No title'}`);
//     };
//     const handleBidResponse = (response: BidResponse) => {
//       toast.success(`Bid response: ${response.status}`);
//     };
//     const handleGeneralNotification = (message: SocketNotification) => {
//       toast.warning(`Notification: ${message.text}`);
//     };
//     const handleBidSentConfirmation = (data: any) => {
//       console.log('Bid sent confirmation:', data);
//       if (data.error) toast.error(data.message);
//       else toast.success(data.message);
//     };

//     console.log('Listening to bid_sent_confirmation event');
//     socket.on('bid_sent_confirmation', handleBidSentConfirmation);
//     socket.on('new_bid', handleNewBid);
//     socket.on('bid_response', handleBidResponse);
//     socket.on('general_notification', handleGeneralNotification);

//     return () => {
//       socket.off('bid_sent_confirmation', handleBidSentConfirmation);
//       socket.off('new_bid', handleNewBid);
//       socket.off('bid_response', handleBidResponse);
//       socket.off('general_notification', handleGeneralNotification);
//     };
//   }, [userId, role]);

//   useEffect(() => {
//     if (userId && role) {
//       console.log('Re-running socket listeners due to user state update:', { userId, role });
//     }
//   }, [userId, role]);
// };

// export default useSocketListeners;
