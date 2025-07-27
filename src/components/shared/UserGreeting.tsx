import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { Avatar } from 'primereact/avatar';
import { Tooltip } from 'primereact/tooltip';
import { Menu } from 'primereact/menu';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearUser } from '../../features/user/slice/userSlice';
import { api } from '../../services/api';

const UserGreeting = () => {
  const user = useSelector((state: RootState) => state.user);
  const menuRef = useRef<Menu>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  if (!user || !user.name) return null;

  const handleLogout = async () => {
    await api.logoutApi();
    dispatch(clearUser());
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { label: 'My Profile', icon: 'pi pi-user', command: () => navigate('/profile') },
    { label: 'Logout', icon: 'pi pi-sign-out', command: handleLogout }
  ];

  return (
    <>
      <Tooltip target=".avatar-hover" content="My Account" position="bottom" />
      <Menu model={menuItems} popup ref={menuRef} />
      <div
        className="avatar-hover flex flex-row-reverse items-center gap-2 cursor-pointer"
        onClick={(e) => menuRef.current?.toggle(e)}
      >
        <Avatar
          image={user.avatarUrl || undefined}
          label={!user.avatarUrl && user.name ? user.name.charAt(0).toUpperCase() : undefined}
          shape="circle"
          size="normal"
          style={{ backgroundColor: !user.avatarUrl ? '#1d4ed8' : undefined, color: '#fff', fontSize: 18 }}
        />
        <span className="text-base font-medium text-blue-700">Hi {user.name}!</span>
      </div>
    </>
  );
};

export default UserGreeting;
