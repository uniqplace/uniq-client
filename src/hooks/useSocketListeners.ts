import React from 'react';
import { useEffect } from 'react';
import { disconnectSocket, getSocket, initializeSocket } from '../services/socket';
import { socket_events } from '../constants/socketEvents';
import { toast } from 'react-toastify';
import CustomToast from '../components/shared/CustomToast';
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
        if (data.error) {
          toast(React.createElement(CustomToast, { icon: "❌", message: data.message, color: "#721c24", background: "#f8d7da" }), {
            style: { background: "#f8d7da", color: "#721c24" }
          });
        } else {
          toast(React.createElement(CustomToast, { icon: "✅", message: data.message, color: "#155724", background: "#d4edda" }), {
            style: { background: "#d4edda", color: "#155724" }
          });
        }
      };
      const handleNewBid = (bidData: Notification) => {
        toast(React.createElement(CustomToast, { icon: "📨", message: `New bid received: ${bidData.payload.message || 'No title'}`, color: "#0c5460", background: "#d1ecf1" }), {
          style: { background: "#d1ecf1", color: "#0c5460" }
        });
      };
      const handleNewOrder = (orderData: Notification) => {
        console.log('New order😍😍:', orderData);
        toast(React.createElement(CustomToast, { icon: "🛒", message: `New order placed: ${orderData.payload.message || 'No title'}`, color: "#155724", background: "#d4edda" }), {
          style: { background: "#d4edda", color: "#155724" }
        });
      };
      const handleGeneralNotification = (data: Notification) => {
        console.log('General notification:', data);
        if (data.error) {
          toast(React.createElement(CustomToast, { icon: "⚠️", message: data.message, color: "#856404", background: "#fff3cd" }), {
            style: { background: "#fff3cd", color: "#856404" }
          });
        } else {
          toast(React.createElement(CustomToast, { icon: "🔔", message: data.payload.message || 'Notification received', color: "#004085", background: "#cce5ff" }), {
            style: { background: "#cce5ff", color: "#004085" }
          });
        }
      };
      const handleNewBidOffer = (offerData: Notification) => {
        toast(React.createElement(CustomToast, { icon: "💼", message: `New bid offer: ${offerData.payload.message || 'No title'}`, color: "#0c5460", background: "#d1ecf1" }), {
          style: { background: "#d1ecf1", color: "#0c5460" }
        });
      }
      const handleCONNECT =  () => {
        console.log('Socket connected with ID:', socket.id);
        if (user?.id) {
          socket.emit(socket_events.register_user, { userId: user.id, role: user.role });
          console.log('User registered to socket:', { userId: user.id, role: user.role });
        }
      };

      socket.on(socket_events.new_bid, handleNewBid);
      socket.on(socket_events.general_notification, handleGeneralNotification);
      socket.on(socket_events.bid_sent_confirmation, handleBidSentConfirmation);
      socket.on(socket_events.new_order, handleNewOrder);
      socket.on(socket_events.new_bid_offer, handleNewBidOffer);
      socket.on(socket_events.connect, handleCONNECT);

      return () => {
        socket.off(socket_events.new_bid, handleNewBid);
        socket.off(socket_events.general_notification, handleGeneralNotification);
        socket.off(socket_events.bid_sent_confirmation, handleBidSentConfirmation);
        socket.off(socket_events.new_order, handleNewOrder);
        socket.off(socket_events.new_bid_offer, handleNewBidOffer);
        socket.off(socket_events.connect, handleCONNECT);
      };
    } else {
      disconnectSocket();
    }
  }, [user?.id, user?.email]);

    useEffect(() => {
    if (user?.id) {
      const socket = getSocket();
      socket?.emit(socket_events.register_user, user.id);
    }
  }, [user?.id]);
}

  export default useSocketListeners;
