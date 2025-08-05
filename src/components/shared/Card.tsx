import React from 'react';
import { Card as PrimeCard } from 'primereact/card';

interface SharedCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const Card: React.FC<SharedCardProps> = ({ 
  title, 
  subtitle, 
  children, 
  className = '',
  header,
  footer,
  variant = 'default',
  padding = 'medium'
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'elevated': return 'luxury-card shadow-large';
      case 'outlined': return 'bg-white border-2 border-neutral-200 rounded-2xl shadow-soft';
      case 'glass': return 'glass rounded-2xl shadow-medium';
      default: return 'luxury-card';
    }
  };

  const getPaddingClass = () => {
    switch (padding) {
      case 'none': return '';
      case 'small': return 'p-4';
      case 'large': return 'p-8';
      default: return 'p-6';
    }
  };

  const baseClasses = `${getVariantClass()} ${getPaddingClass()} ${className}`;

  return (
    <div className={baseClasses}>
      {/* Custom Header */}
      {header && (
        <div className="luxury-card-header">
          {header}
        </div>
      )}

      {/* Title and Subtitle */}
      {(title || subtitle) && !header && (
        <div className="luxury-card-header">
          {title && <h3 className="luxury-card-title">{title}</h3>}
          {subtitle && <p className="luxury-card-subtitle">{subtitle}</p>}
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="mt-6 pt-6 border-t border-neutral-100">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 