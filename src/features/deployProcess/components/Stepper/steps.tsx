import React from 'react';
import type { Product } from '../../slices/stepperSlice';
import { Button } from 'primereact/button';
import ManufacturerPreferencesStep from '../ManufacturerPreferencesStep';

export interface StepProps {
  onComplete: (data?: any) => void;
  product?: Product | null;
}

/* --- Step 1: Define Product --- */
/* 
  Inline step components are fine for now, but consider splitting them into separate files 
  if their logic or UI grows in complexity.
*/
export const DefineProductStep: React.FC<StepProps> = ({ onComplete, product }) => {
  return (
    <div>
      <h2>Product Definition (Hardcoded)</h2>
      <p>Here you will define your product details (temporary content).</p>
      <p>Product ID: {product?._id ?? 'Not created yet'}</p>
      <Button label="Finish Step" onClick={() => onComplete()} className="p-button-success" />
    </div>
  );
};

/* --- Other steps --- */
export const OpenBidConfirmationStep: React.FC<StepProps> = ({ onComplete, product }) => (
  <div>
    <h2>Send to Marketplace</h2>
    <p>Product ID: {product?._id ?? 'Not created yet'}</p>
    <Button label="Finish Step" onClick={() => onComplete()} className="p-button-success" />
  </div>
);

export const LiveBidsViewerStep: React.FC<StepProps> = ({ onComplete }) => (
  <div>
    <h2>View Live Bids</h2>
    <Button label="Finish Step" onClick={() => onComplete()} className="p-button-success" />
  </div>
);

export const SelectManufacturerStep: React.FC<StepProps> = ({ onComplete }) => (
  <div>
    <h2>Choose Manufacturer</h2>
    <Button label="Finish Step" onClick={() => onComplete()} className="p-button-success" />
  </div>
);

export const AgreementAndSummaryStep: React.FC<StepProps> = ({ onComplete }) => (
  <div>
    <h2>Agreement</h2>
    <Button label="Finish Step" onClick={() => onComplete()} className="p-button-success" />
  </div>
);

export const PaymentAndOrderStep: React.FC<StepProps> = ({ onComplete }) => (
  <div>
    <h2>Payment & Order</h2>
    <Button label="Finish Step" onClick={() => onComplete()} className="p-button-success" />
  </div>
);

export const TrackingAndDeliveryStep: React.FC<StepProps> = ({ onComplete }) => (
  <div>
    <h2>Tracking & Delivery</h2>
    <Button label="Finish Step" onClick={() => onComplete()} className="p-button-success" />
  </div>
);

export const DeliveryStep: React.FC<StepProps> = ({ onComplete }) => (
  <div>
    <h2>Delivery</h2>
    <Button label="Finish Step" onClick={() => onComplete()} className="p-button-success" />
  </div>
);

/* --- Steps array --- */
/*
  Consider splitting these step components into separate files if their UI or logic grows.
  For now, inline components keep everything in one place for simplicity.
*/
export const steps = [
  { title: 'Define Your Product', component: DefineProductStep },
  { title: 'Manufacturer Preferences', component: ManufacturerPreferencesStep },
  { title: 'Send to Marketplace', component: OpenBidConfirmationStep },
  { title: 'View Live Bids', component: LiveBidsViewerStep },
  { title: 'Choose Manufacturer', component: SelectManufacturerStep },
  { title: 'Agreement', component: AgreementAndSummaryStep },
  { title: 'Payment', component: PaymentAndOrderStep },
  { title: 'Tracking', component: TrackingAndDeliveryStep },
  { title: 'Delivery', component: DeliveryStep },
];
