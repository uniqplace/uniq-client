import React, {  useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import { useRef } from 'react';
import { clearUser } from '../../features/user/slices/userSlice';
import { api } from '../../services/api';
import type { RootState } from '../../store';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const menuRef = useRef<Menu>(null);

  const menuItems = [
    { icon: 'pi pi-home', label: 'Home', href: '/' },
    { icon: 'pi pi-star', label: 'Marketplace', href: '/marketplace' },
    { icon: 'pi pi-shopping-cart', label: 'Orders', href: '/orders' },
    { icon: 'pi pi-plus', label: 'Create Product', href: '/create-your-own-product' },
    { icon: 'pi pi-info-circle', label: 'About', href: '/about' },
    { icon: 'pi pi-users', label: 'Creator Marketplace', href: '/CreatorProductPage' },
    { icon: 'pi pi-list', label: 'My Bid Requests', href: '/MyBidRequest' },
  ];

  // Add auth items if user is not logged in
  const authItems = !user?.id ? [
    { icon: 'pi pi-user-plus', label: 'Register', href: '/register' },
    { icon: 'pi pi-sign-in', label: 'Login', href: '/login' },
  ] : [];

  const allMenuItems = [...menuItems, ...authItems];

  const handleLogout = async () => {
    await api.logoutApi();
    dispatch(clearUser());
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const avatarMenuItems = [
    {
      template: () => (
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Avatar
              image={user.avatarUrl || undefined}
              label={!user.avatarUrl && user.name ? user.name.charAt(0).toUpperCase() : undefined}
              shape="circle"
              size="large"
              style={{ 
                backgroundColor: !user.avatarUrl ? '#1d4ed8' : undefined, 
                color: '#fff', 
                fontSize: 20 
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )
    },
    { separator: true },
    { label: 'View Profile', icon: 'pi pi-user', command: () => navigate('/profile') },
    { label: 'Logout', icon: 'pi pi-sign-out', command: handleLogout }
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isOpen) {
        const sidebar = document.getElementById('sidebar');
        const hamburger = document.getElementById('hamburger');
        if (sidebar && !sidebar.contains(event.target as Node) && 
            hamburger && !hamburger.contains(event.target as Node)) {
          onToggle();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isOpen, onToggle]);

  const sidebarClasses = `
    fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-lg z-40
    transform transition-transform duration-300 ease-in-out
    ${isMobile 
      ? `w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
      : 'w-64 translate-x-0'
    }
  `;

  const overlayClasses = `
    fixed inset-0 bg-black bg-opacity-50 z-30
    ${isMobile && isOpen ? 'block' : 'hidden'}
  `;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div className={overlayClasses} onClick={onToggle} />
      )}

      {/* Sidebar */}
      <div id="sidebar" className={sidebarClasses}>
        {/* Logo */}
        <div className="flex justify-center items-center h-16 border-b border-gray-200 dark:border-gray-700">
          <div
            className="flex items-center cursor-pointer font-bold text-xl text-blue-700 dark:text-blue-400"
            onClick={() => navigate('/')}
          >
            <span style={{ fontWeight: 700, letterSpacing: 1 }}>UniqPlace</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {allMenuItems.map((item) => (
              <li key={item.href}>
                <button
                  onClick={() => {
                    navigate(item.href);
                    if (isMobile) onToggle();
                  }}
                  className={`
                    w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200
                    ${isActive(item.href)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <i className={`${item.icon} mr-3 text-lg`}></i>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Avatar Section */}
        {user?.id && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Menu model={avatarMenuItems} popup ref={menuRef} />
              <Avatar
                image={user.avatarUrl || undefined}
                label={!user.avatarUrl && user.name ? user.name.charAt(0).toUpperCase() : undefined}
                shape="circle"
                size="normal"
                className="cursor-pointer"
                style={{ 
                  backgroundColor: !user.avatarUrl ? '#1d4ed8' : undefined, 
                  color: '#fff', 
                  fontSize: 18 
                }}
                onClick={(e) => menuRef.current?.toggle(e)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;