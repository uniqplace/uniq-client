import { useEffect, useState } from 'react';
import { Avatar } from 'primereact/avatar';

const UserGreeting = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.fullName || user.name || '');
        setAvatarUrl(user.avatar || null);
      } catch {
        setUserName('');
        setAvatarUrl(null);
      }
    }
  }, []);

  if (!userName) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', position: 'absolute', top: 10, right: 10, gap: 8 }}>
      <h2 style={{ margin: 0 }}>Hi {userName}!</h2>
      <Avatar
        label={userName.charAt(0).toUpperCase()}
        size="large"
        style={{ backgroundColor: '#2196F3', color: '#ffffff', marginLeft: 8 }}
        shape="circle"
      />
    </div>
  );
};

export default UserGreeting;