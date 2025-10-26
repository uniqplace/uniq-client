import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import { useRef } from 'react';
import { clearUser } from '../../features/user/slices/userSlice';
import { api } from '../../services/api';
import { resetProductState } from '../../features/product Idea & AI/slices/aiProductSlice';
import { clearProductsInProgress } from '../../utils/productUtils';
import type { RootState } from '../../store';
import type { User } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user) as User;
  const menuRef = useRef<Menu>(null);

  const menuItems = [
    // { icon: 'pi pi-home', label: 'Home', href: '/' },
    { icon: 'pi pi-star', label: 'Marketplace', href: '/marketplace' },
    { icon: 'pi pi-shopping-cart', label: 'Orders', href: '/account/orders' },
    // { icon: 'pi pi-plus', label: 'Create Product', href: '/create-your-own-product' },
    { icon: 'pi pi-info-circle', label: 'About', href: '/about' },
    { icon: 'pi pi-briefcase', label: 'My Bid Requests', href: '/MyBidRequest' },
    { icon: 'pi pi-users', label: 'Creator Marketplace', href: '/CreatorProductPage' },
    { icon: 'pi pi-cog', label: 'AI Product Debug', href: '/ai-product-debug' },
  ];

  // Add auth items if user is not logged in
  const authItems = !user?.id ? [
    { icon: 'pi pi-user-plus', label: 'Register', href: '/register' },
    { icon: 'pi pi-sign-in', label: 'Login', href: '/login' },
    { icon: 'pi pi-comments', label: 'Chats', href: '/chat' },
  ] : [];

  const allMenuItems = [...menuItems, ...authItems];

  const handleLogout = async () => {
    await api.logoutApi();
    dispatch(clearUser());
    handleClearProducts();
    dispatch(resetProductState());
    localStorage.removeItem('aiProductState');
    localStorage.clear();
    navigate('/login');
  };

  const handleClearProducts = () => {
    clearProductsInProgress(dispatch);
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
              className='w-12 h-12 [&>img]:w-full [&>img]:h-full [&>img]:object-cover'
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
    fixed top-0 left-0 h-full bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 shadow-2xl border-r border-gradient-to-b from-purple-200/30 to-blue-200/30 dark:border-purple-700/30 z-40 backdrop-blur-sm
    transform transition-all duration-300 ease-out
    ${isMobile
      ? `w-72 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
      : 'w-72 translate-x-0'
    }
  `;

  const overlayClasses = `
    fixed inset-0 bg-gradient-to-br from-black/60 via-purple-900/30 to-black/60 backdrop-blur-sm z-30 transition-opacity duration-300
    ${isMobile && isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
  `;

  return (
    <>
      {/* Mobile overlay */}
      <div className={overlayClasses} onClick={onToggle} />

      {/* Sidebar */}
      <div id="sidebar" className={sidebarClasses}>
        {/* Logo */}
        <div className="flex justify-center items-center h-16 border-b border-gradient-to-r from-purple-200/40 to-blue-200/40 dark:border-purple-700/40 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-purple-900/20 dark:to-blue-900/20">
          <div
            className="flex items-center cursor-pointer font-bold text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:scale-105 transition-all duration-300"
            onClick={() => navigate('/')}
          >
            <i className="pi pi-star-fill mr-2 text-yellow-500 text-lg animate-pulse"></i>
            <span style={{ fontWeight: 800, letterSpacing: 1.2 }}>UniqPlace</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {allMenuItems.map((item) => (
              <li key={item.href || item.href}>
                <button
                  onClick={() => {
                    navigate(item.href);
                    if (isMobile) onToggle();
                  }}
                  className={`
                    group w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-300 transform hover:scale-[1.01] hover:shadow-md
                    ${isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 hover:border hover:border-blue-200/50 dark:hover:border-purple-700/50'
                    }
                  `}
                >
                  <div className={`
                    flex items-center justify-center w-9 h-9 rounded-lg mr-3 transition-all duration-300
                    ${isActive(item.href)
                      ? 'bg-white/20 text-white'
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-400 group-hover:from-blue-100 group-hover:to-purple-100 dark:group-hover:from-blue-800 dark:group-hover:to-purple-800 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }
                  `}>
                    <i className={`${item.icon} text-base`}></i>
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                  <div className={`
                    ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    ${!isActive(item.href) ? 'text-blue-500 dark:text-blue-400' : 'text-white/70'}
                  `}>
                    <i className="pi pi-chevron-right text-xs"></i>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Avatar Section */}
        {user?.id && (
          <div className="p-4 border-t border-gradient-to-r from-purple-200/40 to-blue-200/40 dark:border-purple-700/40 bg-gradient-to-r from-blue-50/20 to-purple-50/20 dark:from-purple-900/10 dark:to-blue-900/10">
            <div className="flex items-center space-x-4 p-3 rounded-xl bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={(e) => menuRef.current?.toggle(e)}>
              <Menu model={avatarMenuItems} popup ref={menuRef} />
              <div className="relative">
                <Avatar
                  image={user.avatarUrl || undefined}
                  label={!user.avatarUrl && user.name ? user.name.charAt(0).toUpperCase() : undefined}
                  shape="circle"
                  size="large"
                  className="cursor-pointer ring-2 ring-blue-300 dark:ring-purple-500 group-hover:ring-4 transition-all duration-300
                    w-12 h-12 [&>img]:w-full [&>img]:h-full [&>img]:object-cover"
                  style={{
                    backgroundColor: !user.avatarUrl ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined,
                    color: '#fff',
                    fontSize: 20
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate uppercase tracking-wider font-medium">
                  {user.role}
                </p>
              </div>
              <div className="text-gray-400 group-hover:text-blue-500 transition-colors duration-300">
                <i className="pi pi-chevron-up text-sm group-hover:transform group-hover:rotate-180 transition-transform duration-300"></i>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;