import React, { createRef } from 'react';
import FinishStepButton from './finishStepButton';
import ManufacturerPreferencesStep from '../ManufacturerPreferencesStep';
import type { ProductUploadFormHandle } from '../../../../features/marketplace/components/ProductUploadForm';
import FakeUploadStep from '../FakeUploadStep';

export interface StepProps {
  onComplete: (data?: any) => void;
  setCanGoNext?: (val: boolean) => void;
}

export interface StepDefinition {
  key: string;
  title: string;
  component: React.FC<any>;
  validateStep?: () => Promise<boolean>;
}

export const productFormRef = createRef<ProductUploadFormHandle>();

export const OpenBidConfirmationStep: React.FC<StepProps> = ({ onComplete, setCanGoNext }) => (
  <div className="p-4 text-center">
    <h2 className="text-xl font-semibold mb-3 flex justify-center items-center gap-2">
      <span role="img" aria-label="send">📤</span>
      Send to Marketplace
    </h2>
    <p className="text-gray-700 text-base mb-4">We'll send your product to the marketplace so manufacturers can place bids.</p>
    <FinishStepButton onClick={() => {
      onComplete();
      setCanGoNext && setCanGoNext(true);
    }} />
  </div>
);

export const LiveBidsViewerStep: React.FC<StepProps> = ({ onComplete, setCanGoNext }) => (
  <div className="p-4 text-center">
    <h2 className="text-xl font-semibold mb-3 flex justify-center items-center gap-2">
      <span role="img" aria-label="bids">📈</span>
      View Live Bids
    </h2>
    <p className="text-gray-700 text-base mb-4">Track who’s bidding to manufacture your product.</p>
    <FinishStepButton onClick={() => {
      onComplete();
      setCanGoNext && setCanGoNext(true);
    }} />
  </div>
);

export const SelectManufacturerStep: React.FC<StepProps> = ({ onComplete, setCanGoNext }) => (
  <div className="p-4 text-center">
    <h2 className="text-xl font-semibold mb-3 flex justify-center items-center gap-2">
      <span role="img" aria-label="factory">🏭</span>
      Choose Manufacturer
    </h2>
    <p className="text-gray-700 text-base mb-4">Pick the manufacturer that best fits your needs.</p>
    <FinishStepButton onClick={() => {
      onComplete();
      setCanGoNext && setCanGoNext(true);
    }} />
  </div>
);

export const AgreementAndSummaryStep: React.FC<StepProps> = ({ onComplete, setCanGoNext }) => (
  <div className="p-4 text-center">
    <h2 className="text-xl font-semibold mb-3 flex justify-center items-center gap-2">
      <span role="img" aria-label="contract">📝</span>
      Agreement & Summary
    </h2>
    <p className="text-gray-700 text-base mb-4">Review and approve the final production terms.</p>
    <FinishStepButton onClick={() => {
      onComplete();
      setCanGoNext && setCanGoNext(true);
    }} />
  </div>
);

export const PaymentAndOrderStep: React.FC<StepProps> = ({ onComplete, setCanGoNext }) => (
  <div className="p-4 text-center">
    <h2 className="text-xl font-semibold mb-3 flex justify-center items-center gap-2">
      <span role="img" aria-label="payment">💳</span>
      Make Payment
    </h2>
    <p className="text-gray-700 text-base mb-4">Secure your order by completing the payment.</p>
    <FinishStepButton onClick={() => {
      onComplete();
      setCanGoNext && setCanGoNext(true);
    }} />
  </div>
);

export const TrackingAndDeliveryStep: React.FC<StepProps> = ({ onComplete, setCanGoNext }) => (
  <div className="p-4 text-center">
    <h2 className="text-xl font-semibold mb-3 flex justify-center items-center gap-2">
      <span role="img" aria-label="tracking">📦</span>
      Track Delivery
    </h2>
    <p className="text-gray-700 text-base mb-4">Stay updated on your product's delivery status.</p>
    <FinishStepButton onClick={() => {
      onComplete();
      setCanGoNext && setCanGoNext(true);
    }} />
  </div>
);

export const DeliveryStep: React.FC<StepProps> = ({ onComplete, setCanGoNext }) => (
  <div className="p-4 text-center">
    <h2 className="text-xl font-semibold mb-3 flex justify-center items-center gap-2">
      <span role="img" aria-label="done">✅</span>
      Complete Delivery
    </h2>
    <p className="text-gray-700 text-base mb-4">Your product has arrived. You're all set!</p>
    <FinishStepButton onClick={() => {
      onComplete();
      setCanGoNext && setCanGoNext(true);
    }} />
  </div>
);

export const stepsConfig: StepDefinition[] = [
  {
    key: 'product-definition',
    title: 'Define Your Product',
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
    title: 'View Live Bids',
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
