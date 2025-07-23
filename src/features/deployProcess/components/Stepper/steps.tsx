// src/features/stepper/steps.tsx
import React from 'react';
import type { Product } from '../../../../types'; 

interface StepProps {
  onComplete: (data: any) => void;
  product?: Product | null;
}

export const DefineProductStep: React.FC<StepProps> = ({ onComplete, product }) => (
  <div>
    <h2>Define Your Product</h2>
    <p>Product ID: {product?._id ?? 'Not created yet'}</p>
    <button onClick={() => onComplete({ productId: '123' })}>Finish Step</button>
  </div>
);

export const ManufacturerBiddingStep: React.FC<StepProps> = ({ onComplete, product }) => (
  <div>
    <h2>Manufacturer Bidding</h2>
    <p>Product ID: {product?._id ?? 'Not created yet'}</p>
    <button onClick={() => onComplete({})}>Finish Step</button>
  </div>
);

// ... steps array
export const steps = [
  { id: 'defineProduct', title: 'Define Your Product', component: DefineProductStep },
  { id: 'bidding', title: 'Manufacturer Bidding', component: ManufacturerBiddingStep },
  // ... עוד שלבים
];
