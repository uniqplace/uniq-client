import React from 'react';
import { Button as PrimeButton } from 'primereact/button';
import type { ButtonProps } from 'primereact/button';

interface SharedButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'small' | 'medium' | 'large';
}

const Button: React.FC<SharedButtonProps> = ({ 
  variant = 'primary', 
  size = 'medium',
  className = '',
  ...props 
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'secondary': return 'p-button-secondary';
      case 'success': return 'p-button-success';
      case 'danger': return 'p-button-danger';
      case 'warning': return 'p-button-warning';
      default: return '';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'p-button-sm';
      case 'large': return 'p-button-lg';
      default: return '';
    }
  };

  return (
    <PrimeButton
      className={`${getVariantClass()} ${getSizeClass()} ${className}`}
      {...props}
    />
  );
};

export default Button; 