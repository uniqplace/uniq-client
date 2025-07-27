import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import NotificationBell from './NotificationBell';
import Sidebar from './Sidebar';

const NewHeader: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-800 shadow-md z-50 flex items-center justify-between px-4">
        {/* Left side - Hamburger and Logo */}
        <div className="flex items-center space-x-4">
          {/* Hamburger Menu (Mobile) */}
          {isMobile && (
            <Button
              id="hamburger"
              icon="pi pi-bars"
              className="p-button-text p-button-rounded"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            />
          )}

          {/* Logo */}
          <div
            className="flex items-center cursor-pointer font-bold text-xl text-blue-700 dark:text-blue-400"
            onClick={() => navigate('/')}
            style={{ userSelect: 'none' }}
          >
            <span style={{ fontWeight: 700, letterSpacing: 1 }}>UniqPlace</span>
          </div>
        </div>

        {/* Right side - Notification Bell */}
        <div className="flex items-center">
          <NotificationBell />
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar} 
        isMobile={isMobile} 
      />
    </>
  );
};

export default NewHeader; 