import { useAppSelector, useAppDispatch } from '../hooks/hooks';
import type { RootState } from '../store';
import { useEffect, useState } from 'react';
import { fetchOpenBidRequestsByProductId } from '../features/deployProcess/slices/stepperSlice';

export function useBidRequestId() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.user);
  const bidRequest = useAppSelector((state: RootState) => state.stepper.bidRequest);
  const bidRequestId = bidRequest?._id || '';
  const reduxProductId = useAppSelector((state: RootState) => state.stepper.product)?._id || '';
  const [productId, setProductId] = useState<string>(reduxProductId);

  useEffect(() => {
    if (!reduxProductId) {
      const localProductId = localStorage.getItem(`productId_${user.id}`) || '';
      setProductId(localProductId);
    } else {
      setProductId(reduxProductId);
    }
  }, [user.id, reduxProductId]);

  useEffect(() => {
    if (!bidRequestId && productId) {
      dispatch(fetchOpenBidRequestsByProductId(productId));
    }
  }, [bidRequestId, dispatch, productId]);

  return { bidRequestId, productId };
}
