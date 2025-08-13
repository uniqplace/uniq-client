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
      <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-600 backdrop-blur-lg shadow-xl border-b border-emerald-400/20 z-50 flex items-center justify-between px-6">
        {/* Left side - Hamburger and Logo */}
        <div className="flex items-center space-x-4">
          {/* Hamburger Menu (Mobile) */}
          {isMobile && (
            <Button
              id="hamburger"
              icon="pi pi-bars"
              className="p-button-text p-button-rounded text-white hover:bg-white/10 transition-all duration-200"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
              style={{ color: 'white', border: 'none' }}
            />
          )}

          {/* Logo */}
          <div
            className="flex items-center cursor-pointer font-bold text-2xl bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200"
            onClick={() => navigate('/')}
            style={{ userSelect: 'none' }}
          >
            <i className="pi pi-star-fill mr-2 text-yellow-300 text-xl"></i>
            <span style={{ fontWeight: 800, letterSpacing: 1.2 }}>UniqPlace</span>
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