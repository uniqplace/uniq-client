import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import UserGreeting from './UserGreeting';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store'; // עדכן נתיב אם צריך


const Header: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);

  const navItems = [
    { label: 'Home', icon: 'pi pi-home', command: () => navigate('/') },
    { label: 'Marketplace', icon: 'pi pi-star', command: () => navigate('/marketplace') },
    { label: 'Orders', icon: 'pi pi-shopping-cart', command: () => navigate('/orders') },
    { label: 'About', icon: 'pi pi-info-circle', command: () => navigate('/about') },
    // הצג Register ו-Login רק אם אין משתמש מחובר
    ...(!user?.id ? [
      { label: 'Register', icon: 'pi pi-user-plus', command: () => navigate('/register') },
      { label: 'Login', icon: 'pi pi-sign-in', command: () => navigate('/login') },
    ] : []),
    { label: 'Upload Product', icon: 'pi pi-upload', command: () => navigate('/uploadProduct') },
  ];

  const start = (
    <div
      className="flex items-center cursor-pointer font-bold text-xl text-blue-700"
      onClick={() => navigate('/')}
      style={{ userSelect: 'none' }}
    >
      <span style={{ fontWeight: 700, letterSpacing: 1 }}>UniqPlace</span>
    </div>
  );

  const end = (
    <div className="flex items-center h-full pr-4">
      <UserGreeting />
    </div>
  );

  return (
    <Menubar
      model={navItems}
      start={start}
      end={end}
      className="w-full fixed top-0 left-0 z-50 bg-white shadow-md border-none rounded-none"
      style={{ height: 56, alignItems: 'center' }}
    />
  );
};

export default Header;
