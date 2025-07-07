import React from 'react';
import { Card as PrimeCard } from 'primereact/card';

interface SharedCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const Card: React.FC<SharedCardProps> = ({ 
  title, 
  subtitle, 
  children, 
  className = '',
  header,
  footer 
}) => {
  return (
    <PrimeCard
      title={title}
      subTitle={subtitle}
      className={className}
      header={header}
      footer={footer}
    >
      {children}
    </PrimeCard>
  );
};

export default Card; 