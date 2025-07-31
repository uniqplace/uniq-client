import React from 'react';
import type { Product } from '../../slices/stepperSlice';
import FinishStepButton from './finishStepButton';
import ManufacturerPreferencesStep from '../ManufacturerPreferencesStep';
import ProductUploadForm from '../../../../features/marketplace/components/ProductUploadForm';
export interface StepProps {
  onComplete: (data?: any) => void;
  product?: Product | null;
}
export interface StepDefinition {
  key: string;
  title: string;
  component: React.FC<any>;
}
/* --- Step components --- */
// export const DefineProductStep: React.FC<StepProps> = ({ onComplete }) => {
//   return (
//     <ProductUploadForm  onClose={onComplete} />
//   );
// };
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
export const steps: StepDefinition[] = [
  { key: 'defineProduct', title: 'Define Product', component: ProductUploadForm},
  { key: 'manufacturerPreferences', title: 'Manufacturer Preferences', component: ManufacturerPreferencesStep },
  { key: 'sendToMarketplace', title: 'Send to Marketplace', component: OpenBidConfirmationStep },
  { key: 'viewLiveBids', title: 'View Live Bids', component: LiveBidsViewerStep },
  { key: 'chooseManufacturer', title: 'Choose Manufacturer', component: SelectManufacturerStep },
  { key: 'agreement', title: 'Agree to Terms', component: AgreementAndSummaryStep },
  { key: 'payment', title: 'Make Payment', component: PaymentAndOrderStep },
  { key: 'tracking', title: 'Track Delivery', component: TrackingAndDeliveryStep },
  { key: 'delivery', title: 'Complete Delivery', component: DeliveryStep },
];


