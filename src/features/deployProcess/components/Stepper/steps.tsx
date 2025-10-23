// import React, { createRef } from 'react';
import React, { useEffect, useState } from 'react';
import FinishStepButton from './finishStepButton';
import ManufacturerPreferencesStep from '../ManufacturerPreferencesStep';
// import type { ProductUploadFormHandle } from '../../../../features/marketplace/components/ProductUploadForm';
import FakeUploadStep from '../FakeUploadStep';
import BidOffersList from '../BidOffersList';
import AuctionLoadingError from './AuctionLoadingError';
import { useAppSelector, useAppDispatch } from '../../../../hooks/hooks';
import type { RootState } from '../../../../store';
import { CheckoutPage } from '../../../order/components/Checkout/CheckoutPage';
import type { BidOffer, Product } from '../../../../types';
import { fetchBidRequestByProductId } from '../../slices/stepperSlice';
import { loadPersistedBidOffer } from '../../slices/BidOfferSlice';

export interface StepProps {
  onComplete: (data?: any) => void;
  setCanGoNext?: (val: boolean) => void;
  productId?: string;
}

export interface StepDefinition {
  key: string;
  title: string;
  component: React.FC<StepProps & any>;
  validateStep?: () => Promise<boolean>;
}

// export const productFormRef = createRef<ProductUploadFormHandle>();



export const PaymentAndOrderStep: React.FC<StepProps> = ({ setCanGoNext }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadPersistedBidOffer());
  }, [dispatch]);

  const stepper = useAppSelector((state: RootState) => state.stepper);
  const bidOffers = useAppSelector((state: RootState) => state.bidOffer.offers || []);
  const productId = stepper.currentProductId;
  const productStepper = productId ? stepper.productsInProgress[productId] : undefined;
  const bidRequest = productStepper?.bidRequest;
  const selectedManufacturer = bidRequest?.selectedManufacturer;
  const product: Product | undefined = productStepper?.product ?? undefined;
  const selectedBidOffer = bidOffers.find((offer: BidOffer) => selectedManufacturer && offer.manufacturerId?._id === selectedManufacturer._id) ||
    useAppSelector((state: RootState) => state.bidOffer.currentBidOffer) ||
    JSON.parse(localStorage.getItem('selectedBidOffer') || 'null');
  const [, setOrderSuccess] = useState(false);
  useEffect(() => {
    if (selectedBidOffer) {
      dispatch({ type: 'bidOffer/setCurrentBidOffer', payload: selectedBidOffer });
    }
  }, [selectedBidOffer, dispatch]);
  return (
    <div className="p-4">
      <CheckoutPage product={product} creator={{ _id: selectedManufacturer?._id || '', name: selectedManufacturer?.name || '' }} price={selectedBidOffer?.price} onOrderSuccess={() => {
        setOrderSuccess(true);
        setCanGoNext && setCanGoNext(true);
      }} />
    </div>
  );
};

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

const ViewLiveBidsStep: React.FC<StepProps> = ({ productId, ...props }) => {
  const dispatch = useAppDispatch();
  const bidRequestId = useAppSelector(
    (state: RootState) =>
      productId
        ? state.stepper.productsInProgress[productId]?.bidRequest?._id
        : undefined
  );

  useEffect(() => {
    if (productId && !bidRequestId) {
      dispatch(fetchBidRequestByProductId(productId));
    }
  }, [productId, bidRequestId, dispatch]);

  if (!bidRequestId) {
    return <AuctionLoadingError productId={productId || ''} />;
  }
  return <BidOffersList {...props} bidRequestId={bidRequestId} />;
};

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
    key: 'viewLiveBids',
    title: 'View Live Bids',
    component: ViewLiveBidsStep,
    validateStep: () => Promise.resolve(true),
  },
  {
    key: 'orderAndPayment',
    title: 'Order & Payment',
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
