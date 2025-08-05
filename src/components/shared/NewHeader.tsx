// Header Component - Top navigation bar
// Features: logo, navigation links, user profile, notifications, responsive design
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '../shared';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import { useRef } from 'react';
import type { RootState } from '../../store';

const NewHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);
  const menuRef = useRef<Menu>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/about', label: 'About' },
  ];

  const userMenuItems = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => navigate('/profile')
    },
    {
      label: 'My Orders',
      icon: 'pi pi-shopping-cart',
      command: () => navigate('/orders')
    },
    {
      separator: true
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => {
        // Handle logout
        console.log('Logout clicked');
      }
    }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass shadow-medium backdrop-blur-md' : 'bg-white/95 backdrop-blur-sm shadow-soft'
    }`}>
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-medium group-hover:shadow-large transition-all duration-300 group-hover:scale-110 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <span className="text-2xl font-bold text-gradient tracking-tight hidden sm:block">
              UniqPlace
            </span>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={`nav-link ${isActive(item.href) ? 'nav-link-active' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="flex items-center justify-center h-10 w-10 rounded-full bg-navy-900 text-white hover:bg-navy-800 transition-colors duration-200 shadow-medium hover:shadow-large">
              <i className="pi pi-bell text-lg"></i>
            </button>

            {/* User Profile */}
            {user ? (
              <div className="flex items-center space-x-3">
                <Avatar
                  image={user.avatarUrl}
                  label={!user.avatarUrl && user.name ? user.name.charAt(0).toUpperCase() : undefined}
                  shape="circle"
                  size="normal"
                  className="cursor-pointer hover:scale-105 transition-transform duration-200"
                  style={{ 
                    backgroundColor: !user.avatarUrl ? '#c8941c' : undefined, 
                    color: '#fff', 
                    fontSize: 18 
                  }}
                  onClick={(e) => menuRef.current?.toggle(e)}
                />
                <Menu model={userMenuItems} popup ref={menuRef} />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => navigate('/login')}
                  className="hidden sm:inline-flex"
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <button className="flex items-center justify-center h-10 w-10 rounded-full bg-navy-900 text-white hover:bg-navy-800 transition-colors duration-200 shadow-medium hover:shadow-large">
                <i className="pi pi-bars text-lg"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NewHeader; 