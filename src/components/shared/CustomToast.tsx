import React from 'react';

interface CustomToastProps {
  icon?: React.ReactNode;
  message: string;
  color?: string;
  background?: string;
}

const CustomToast: React.FC<CustomToastProps> = ({ icon, message, color = '#222', background = '#fff' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color, background, padding: '8px 16px', borderRadius: 8 }}>
    {icon && <span style={{ fontSize: 22 }}>{icon}</span>}
    <span>{message}</span>
  </div>
);

export default CustomToast;
