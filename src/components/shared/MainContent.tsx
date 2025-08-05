// MainContent Component - Wrapper for main content area
// Features: responsive layout, sidebar integration, consistent spacing
import React from 'react';

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const MainContent: React.FC<MainContentProps> = ({ 
  children, 
  className = '', 
  fullWidth = false 
}) => {
  return (
    <main className={`
      min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50
      pt-16 lg:pt-20
      transition-all duration-300 ease-in-out
      ${fullWidth ? '' : 'md:ml-64'}
      ${className}
    `}>
      {fullWidth ? (
        children
      ) : (
        <div className="container-responsive">
          {children}
        </div>
      )}
    </main>
  );
};

export default MainContent; 