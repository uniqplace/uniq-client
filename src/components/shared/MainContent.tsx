import React from 'react';
import type { ReactNode } from 'react';

interface MainContentProps {
  children: ReactNode;
  className?: string;
}

const MainContent: React.FC<MainContentProps> = ({ children, className = '' }) => {
  return (
    <main className={`
      min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10
      pt-16 md:ml-72
      transition-all duration-300 ease-in-out
      ${className}
    `}>
      <div className="p-6 md:p-8">
        {children}
      </div>
    </main>
  );
};

export default MainContent; 