import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
// import { saveBidRequest, fetchOpenBidRequestsByProductId } from '../features/deployProcess/slices/stepperSlice';
import type { Category } from '../types/index';

export function useManufacturerPreferencesForm(bidRequest: any, isReadOnly: boolean) {
  const dispatch = useDispatch();
  const [categoryId, setCategoryId] = useState<string | Category | null>(getCategoryIdValue(bidRequest?.categoryId ?? null));
  const [locationPreference, setLocationPreference] = useState<string | null>(bidRequest?.locationPreference ?? null);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>(bidRequest?.priceRange ?? { min: 0, max: 1000 });
  const [deliveryTimeframe, setDeliveryTimeframe] = useState<Date>(
    bidRequest?.deliveryTimeframe ? new Date(bidRequest.deliveryTimeframe) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'shipping'>(bidRequest?.deliveryMethod ?? 'pickup');
  const [rating, setRating] = useState<number>(bidRequest?.rating ?? 1);

  useEffect(() => {
    if (bidRequest) {
      setCategoryId(getCategoryIdValue(bidRequest.categoryId));
      if (bidRequest.locationPreference !== undefined) setLocationPreference(bidRequest.locationPreference);
      if (bidRequest.priceRange !== undefined) setPriceRange(bidRequest.priceRange);
      if (bidRequest.deliveryTimeframe !== undefined) setDeliveryTimeframe(new Date(bidRequest.deliveryTimeframe));
      if (bidRequest.deliveryMethod !== undefined) setDeliveryMethod(bidRequest.deliveryMethod);
      if (bidRequest.rating !== undefined) setRating(bidRequest.rating ?? 1);
    }
  }, [bidRequest]);

  useEffect(() => {
    if (!isReadOnly) {
      const localPayload = {
        categoryId: getCategoryIdValue(categoryId),
        locationPreference,
        priceRange,
        deliveryTimeframe: deliveryTimeframe.toISOString(),
        deliveryMethod,
        rating: rating,
      };
      const reduxPayload = {
        categoryId: bidRequest?.categoryId,
        locationPreference: bidRequest?.locationPreference,
        priceRange: bidRequest?.priceRange,
        deliveryTimeframe: bidRequest?.deliveryTimeframe,
        deliveryMethod: bidRequest?.deliveryMethod,
        rating: bidRequest?.rating,
      };
      const isEqual = JSON.stringify(localPayload) === JSON.stringify(reduxPayload);
      if (!isEqual) {
        dispatch({
          type: 'stepper/setBidRequest',
          payload: {
            ...bidRequest,
            ...localPayload,
          }
        });
      }
    }
  }, [categoryId, locationPreference, priceRange, deliveryTimeframe, deliveryMethod, rating, isReadOnly, dispatch, bidRequest]);

  return {
    categoryId, setCategoryId,
    locationPreference, setLocationPreference,
    priceRange, setPriceRange,
    deliveryTimeframe, setDeliveryTimeframe,
    deliveryMethod, setDeliveryMethod,
    rating, setRating,
  };
}

function getCategoryIdValue(categoryId: string | { _id: string } | null): string | null {
  if (typeof categoryId === 'object' && categoryId !== null && '_id' in categoryId) {
    return categoryId._id;
  }
  return categoryId ?? null;
}
