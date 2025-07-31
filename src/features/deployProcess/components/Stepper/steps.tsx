import React, { createRef } from 'react';
import type { Product } from '../../slices/stepperSlice';
import FinishStepButton from './finishStepButton';
import ManufacturerPreferencesStep from '../ManufacturerPreferencesStep';
import type { ProductUploadFormHandle } from '../../../../features/marketplace/components/ProductUploadForm';
import FakeUploadStep from '../FakeUploadStep';

export interface StepProps {
  onComplete: (data?: any) => void;
  product?: Product | null;
}
export interface StepDefinition {
  key: string;
  title: string;
  component: React.FC<any>;
  validateStep?: () => Promise<boolean>;
}

export const productFormRef = createRef<ProductUploadFormHandle>();

export const OpenBidConfirmationStep: React.FC<StepProps> = ({ onComplete, product }) => (
  <div>
    <h2>Send to Marketplace</h2>
    <p>Product ID: {product?._id ?? 'Not created yet'}</p>
    <FinishStepButton onClick={() => onComplete()} />
  </div>
);
export const LiveBidsViewerStep: React.FC<StepProps> = ({ onComplete }) => (
  <div>
    <h2>View Live Bids</h2>
    <FinishStepButton onClick={() => onComplete()} />
  </div>
);
export const SelectManufacturerStep: React.FC<StepProps> = ({ onComplete }) => (
  <div>
    <h2>Choose Manufacturer</h2>
    <FinishStepButton onClick={() => onComplete()} />
  </div>
);
export const AgreementAndSummaryStep: React.FC<StepProps> = ({ onComplete }) => (
  <div>
    <h2>Agree to Terms</h2>
    <FinishStepButton onClick={() => onComplete()} />
  </div>
);
export const PaymentAndOrderStep: React.FC<StepProps> = ({ onComplete }) => (
  <div>
    <h2>Make Payment</h2>
    <FinishStepButton onClick={() => onComplete()} />
  </div>
);
export const TrackingAndDeliveryStep: React.FC<StepProps> = ({ onComplete }) => (
  <div>
    <h2>Track Delivery</h2>
    <FinishStepButton onClick={() => onComplete()} />
  </div>
);
export const DeliveryStep: React.FC<StepProps> = ({ onComplete }) => (
  <div>
    <h2>Complete Delivery</h2>
    <FinishStepButton onClick={() => onComplete()} />
  </div>
);


/* --- Steps array --- */
export const stepsConfig: StepDefinition[] = [
  {
    key: 'product-definition',
    title: 'Define Product',
    component: FakeUploadStep,
    validateStep: async () => true,
  },
  {
    key: 'manufacturerPreferences',
    title: 'Manufacturer Preferences',
    component: ManufacturerPreferencesStep,
    validateStep: async () => true,
  },
  {
    key: 'sendToMarketplace',
    title: 'Send to Marketplace',
    component: OpenBidConfirmationStep,
    validateStep: () => Promise.resolve(true),
  },
  {
    key: 'viewLiveBids',
    title:'View Live Bids',
    component: LiveBidsViewerStep,
    validateStep: () => Promise.resolve(true),
  },
  {
    key: 'chooseManufacturer',
    title: 'Choose Manufacturer',
    component: SelectManufacturerStep,
    validateStep: () => Promise.resolve(true),
  },
  {
    key: 'agreement',
    title: 'Agree to Terms',
    component: AgreementAndSummaryStep,
    validateStep: () => Promise.resolve(true),
  },
  {
    key: 'payment',
    title: 'Make Payment',
    component: PaymentAndOrderStep,
    validateStep: () => Promise.resolve(true),
  },
  {
    key: 'tracking',
    title: 'Track Delivery',
    component: TrackingAndDeliveryStep,
    validateStep: () => Promise.resolve(true),
  },
  {
    key: 'delivery',
    title: 'Complete Delivery',
    component: DeliveryStep,
    validateStep: () => Promise.resolve(true),
  },
];


