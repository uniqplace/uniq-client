import { useEffect, useState } from 'react';
import { Avatar } from 'primereact/avatar';
import { Tooltip } from 'primereact/tooltip';

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
    <>
      {/* Tooltip Component */}
      <Tooltip target=".avatar-hover" content="My Account" position="bottom" />

      <div
        className="avatar-hover flex items-center justify-center cursor-pointer"
        style={{ display: 'inline-block' }}
        onClick={() => console.log('Open dropdown menu')}
      >
        <Avatar
          image={avatarUrl || ''}
          label={!avatarUrl ? userName.charAt(0).toUpperCase() : ''}
          shape="circle"
          size="large"
          style={{
            backgroundColor: !avatarUrl ? '#1d4ed8' : undefined,
            color: '#fff',
            fontSize: 18,
          }}
        />
      </div>
    </>
  );
};

export default UserGreeting;

