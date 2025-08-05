import React from 'react';
import { Button as PrimeButton } from 'primereact/button';
import type { ButtonProps } from 'primereact/button';

interface SharedButtonProps extends Omit<ButtonProps, 'size'> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'accent' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Button: React.FC<SharedButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  className = '',
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary': return 'btn-primary';
      case 'secondary': return 'btn-secondary';
      case 'success': return 'bg-success-500 hover:bg-success-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-medium hover:scale-105';
      case 'danger': return 'bg-error-500 hover:bg-error-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-medium hover:scale-105';
      case 'warning': return 'bg-warning-500 hover:bg-warning-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-medium hover:scale-105';
      case 'accent': return 'btn-accent';
      case 'outline': return 'btn-outline';
      case 'ghost': return 'btn-ghost';
      default: return 'btn-primary';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'py-2 px-4 text-sm';
      case 'large': return 'py-4 px-8 text-lg';
      default: return 'py-3 px-6 text-base';
    }
  };

  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-100 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none';

  return (
    <PrimeButton
      className={`${baseClasses} ${getVariantClass()} ${getSizeClass()} ${className}`}
      {...props}
    />
  );
};

export default Button;
