
import React from 'react';
import { useEffect } from 'react';
import { disconnectSocket, getSocket, initializeSocket } from '../services/socket';
import { socket_events } from '../constants/socketEvents';
import { toast } from 'react-toastify';
import CustomToast from '../components/shared/CustomToast';
import type { Notification } from '../types/notification';



type UseSocketListenersProps = {
  setNotifications: (cb: any) => void;
  setCount: (cb: any) => void;
  userId?: string;
  role?: string;
  toastRef?: React.RefObject<any>;
  debug?: boolean;
};


const useSocketListeners = ({ setNotifications, setCount, userId, role, debug }: UseSocketListenersProps) => {
  useEffect(() => {
    if (userId) {
      const socket = initializeSocket();

      const buildNotificationData = (data: any, eventName: string) => {
        if (data?.payload) {
          return { ...data.payload, type: data?.type || eventName };
        }
        return {
          ...data,
          title: data?.title || eventName,
          type: data?.type || eventName,
        };
      };

      const handleBidSentConfirmation = (data: Notification) => {
        if (debug) console.log('[useSocketListeners] Bid sent confirmation:', data);
        setCount((prev: number) => prev + 1);
        setNotifications((prev: any[]) => [buildNotificationData(data, socket_events.bid_sent_confirmation), ...prev]);
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
        if (debug) console.log('[useSocketListeners] New bid:', bidData);
        setCount((prev: number) => prev + 1);
        setNotifications((prev: any[]) => [buildNotificationData(bidData, socket_events.new_bid), ...prev]);
        toast(React.createElement(CustomToast, { icon: "📨", message: `New bid received: ${bidData.payload?.message || 'No title'}`, color: "#0c5460", background: "#d1ecf1" }), {
          style: { background: "#d1ecf1", color: "#0c5460" }
        });
      };

      const handleNewOrder = (orderData: Notification) => {
        if (debug) console.log('[useSocketListeners] New order:', orderData);
        setCount((prev: number) => prev + 1);
        setNotifications((prev: any[]) => [buildNotificationData(orderData, socket_events.new_order), ...prev]);
        toast(React.createElement(CustomToast, { icon: "🛒", message: `New order placed: ${orderData.payload?.message || 'No title'}`, color: "#155724", background: "#d4edda" }), {
          style: { background: "#d4edda", color: "#155724" }
        });
      };

      const handleGeneralNotification = (data: Notification) => {
        if (debug) console.log('[useSocketListeners] General notification:', data);
        setCount((prev: number) => prev + 1);
        setNotifications((prev: any[]) => [buildNotificationData(data, socket_events.general_notification), ...prev]);
        if (data.error) {
          toast(React.createElement(CustomToast, { icon: "⚠️", message: data.message, color: "#856404", background: "#fff3cd" }), {
            style: { background: "#fff3cd", color: "#856404" }
          });
        } else {
          toast(React.createElement(CustomToast, { icon: "🔔", message: data.payload?.message || 'Notification received', color: "#004085", background: "#cce5ff" }), {
            style: { background: "#cce5ff", color: "#004085" }
          });
        }
      };

      const handleCONNECT = () => {
        if (debug) console.log('[useSocketListeners] Socket connected with ID:', socket.id);
        socket.emit(socket_events.register_user, { userId, role });
        if (debug) console.log('[useSocketListeners] User registered to socket:', { userId, role });
      };

      socket.on(socket_events.new_bid, handleNewBid);
      socket.on(socket_events.general_notification, handleGeneralNotification);
      socket.on(socket_events.bid_sent_confirmation, handleBidSentConfirmation);
      socket.on(socket_events.new_order, handleNewOrder);
      socket.on(socket_events.connect, handleCONNECT);

      return () => {
        socket.off(socket_events.new_bid, handleNewBid);
        socket.off(socket_events.general_notification, handleGeneralNotification);
        socket.off(socket_events.bid_sent_confirmation, handleBidSentConfirmation);
        socket.off(socket_events.new_order, handleNewOrder);
        socket.off(socket_events.connect, handleCONNECT);
      };
    } else {
      disconnectSocket();
    }
  }, [userId, role]);

  // Register user on socket if userId changes
  useEffect(() => {
    if (userId) {
      const socket = getSocket();
      socket?.emit(socket_events.register_user, { userId, role });
      if (debug) console.log('[useSocketListeners] register_user emitted:', { userId, role });
    }
  }, [userId, role]);
};


  export default useSocketListeners;
