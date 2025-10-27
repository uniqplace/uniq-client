// hooks/useSocketListeners.ts
import React, { useEffect } from 'react';
import { disconnectSocket, getSocket, initializeSocket } from '../services/socket';
import { socket_events } from '../constants/socketEvents';
import { toast } from 'react-toastify';
import CustomToast from '../components/shared/CustomToast';
import { useAppSelector } from './hooks';
import type { RootState } from '../store';
import type { Notification } from '../types/notification';

const useSocketListeners = () => {
  const user = useAppSelector((state: RootState) => state.user);

  useEffect(() => {
    if (user?.id && user?.email) {
      const socket = initializeSocket();

      const notify = (icon: string, message: string, color: string, background: string) => {
        toast(React.createElement(CustomToast, { icon, message, color, background }), {
          style: { background, color },
        });
      };

      const handleBidSentConfirmation = (data: Notification) => {
        if (data.error) {
          notify('❌', data.message, '#721c24', '#f8d7da');
        } else {
          notify('✅', data.message, '#155724', '#d4edda');
        }
      };
      const handleNewBid = (bidData: Notification) => {
        notify('📨', `New bid received: ${bidData.payload?.message || 'No title'}`, '#0c5460', '#d1ecf1');
      };
      const handleNewBidOffer = (offerData: Notification) => {
        notify('💼', `New bid offer: ${offerData.payload?.message || 'No title'}`, '#0c5460', '#d1ecf1');
      };
      const handleNewOrder = (orderData: Notification) => {
        notify('🛒', `New order placed: ${orderData.payload?.message || 'No title'}`, '#155724', '#d4edda');
      };
      const handleGeneralNotification = (data: Notification) => {
        if (data.error) {
          notify('⚠️', data.message, '#856404', '#fff3cd');
        } else {
          notify('🔔', data.payload?.message || 'Notification received', '#004085', '#cce5ff');
        }
      };
      const handleChatMessage = (chatData: any) => {
        notify('💬', `New chat thread: ${chatData?.payload?.message || 'No message'}`, '#383d41', '#e2e3e5');
      };

      const handleCONNECT = () => {
        if (user?.id) {
          socket.emit(socket_events.register_user, { userId: user.id, role: user.role });
        }
      };

      socket.on(socket_events.new_bid, handleNewBid);
      socket.on(socket_events.new_bid_offer, handleNewBidOffer);
      socket.on(socket_events.general_notification, handleGeneralNotification);
      socket.on(socket_events.bid_sent_confirmation, handleBidSentConfirmation);
      socket.on(socket_events.new_order, handleNewOrder);
      socket.on(socket_events.chat_new_thread, handleChatMessage);
      socket.on(socket_events.connect, handleCONNECT);

      return () => {
        socket.off(socket_events.new_bid, handleNewBid);
        socket.off(socket_events.new_bid_offer, handleNewBidOffer);
        socket.off(socket_events.general_notification, handleGeneralNotification);
        socket.off(socket_events.bid_sent_confirmation, handleBidSentConfirmation);
        socket.off(socket_events.new_order, handleNewOrder);
        socket.off(socket_events.chat_new_thread, handleChatMessage);
        socket.off(socket_events.connect, handleCONNECT);
      };
    } else {
      disconnectSocket();
    }
  }, [user?.id, user?.email]);

  // רישום משתמש ב־mount שניוני (אם צריך)
  useEffect(() => {
    if (user?.id) {
      const socket = getSocket() ?? initializeSocket();
      socket.emit(socket_events.register_user, { userId: user.id, role: user.role });
    }
  }, [user?.id, user?.role]);
};

export default useSocketListeners;
