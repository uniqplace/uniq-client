import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, duration = 3000, onClose }) => {
  useEffect(() => {
    if (!onClose) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#323232',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 9999,
        fontSize: '1rem',
      }}
    >
      {message}
    </div>
  );
};

export default Toast;
