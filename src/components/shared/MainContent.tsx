import React from 'react';
import type { ReactNode } from 'react';

interface MainContentProps {
  children: ReactNode;
  className?: string;
}

const MainContent: React.FC<MainContentProps> = ({ children, className = '' }) => {
  return (
    <main className={`
      min-h-screen bg-gray-50 dark:bg-gray-900
      pt-14 md:ml-64
      transition-all duration-300 ease-in-out
      ${className}
    `}>
      <div className="p-4 md:p-6">
        {children}
      </div>
    </main>
  );
};

export default MainContent; 