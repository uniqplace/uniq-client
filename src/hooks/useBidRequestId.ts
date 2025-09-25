import { useAppSelector, useAppDispatch } from '../hooks/hooks';
import type { RootState } from '../store';
import { useEffect, useState } from 'react';
import { fetchOpenBidRequestsByProductId } from '../features/deployProcess/slices/stepperSlice';

export function useBidRequestId() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.user);

  // קבלת productId מה-localStorage או מה-Redux
  const [productId, setProductId] = useState<string>(() => {
    const keys = Object.keys(localStorage);
    const productKey = keys.find(k => k.startsWith('productId_'));
    if (productKey) {
      return localStorage.getItem(productKey) || '';
    }
    return '';
  });

  // קבלת bidRequest ו-product מה-Redux לפי productId
  const bidRequest = useAppSelector((state: RootState) => productId ? state.stepper.productsInProgress[productId]?.bidRequest : undefined);
  const reduxProduct = useAppSelector((state: RootState) => productId ? state.stepper.productsInProgress[productId]?.product : undefined);
  const bidRequestId = bidRequest?._id || '';

  useEffect(() => {
    // עדכון productId אם יש שינוי ב-localStorage
    const keys = Object.keys(localStorage);
    const productKey = keys.find(k => k.startsWith('productId_'));
    if (productKey) {
      const localProductId = localStorage.getItem(productKey) || '';
      if (localProductId && localProductId !== productId) {
        setProductId(localProductId);
      }
    }
  }, [user.id]);

  useEffect(() => {
    if (!bidRequestId && productId) {
      dispatch(fetchOpenBidRequestsByProductId(productId));
    }
  }, [bidRequestId, dispatch, productId]);

  return { bidRequestId, productId, reduxProduct, bidRequest };
}
