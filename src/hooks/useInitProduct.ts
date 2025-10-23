import { useEffect, useRef, useState } from 'react';
import {
  createProduct,
  fetchProductStatus,
  setCurrentStepIndex,
  setCurrentProductId,
} from '../features/deployProcess/slices/stepperSlice';
import { stepsConfig } from '../features/deployProcess/components/Stepper/steps';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { defaultProductTemplate } from '../utils/defaultProductTemplate';

let globalCreationLock: Promise<any> | null = null; 

const useInitProduct = (productIdFromProps?: string) => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.user?.id);
  const [initializedProductId, setInitializedProductId] = useState<string | undefined>(productIdFromProps);
  const [loading, setLoading] = useState(false);
  const unmountedRef = useRef(false);

  const createNewProduct = async () => {
    if (!userId) {
      return undefined;
    }
    if (globalCreationLock) {
      await globalCreationLock;
      return initializedProductId;
    }

    setLoading(true);

    const creationPromise = (async () => {
      try {
        const newProduct = await dispatch(createProduct({ ...defaultProductTemplate })).unwrap();
        if (unmountedRef.current) return;
        setInitializedProductId(newProduct._id);
        localStorage.setItem('currentProductId', newProduct._id);
        const index = stepsConfig.findIndex((s) => s.title === newProduct.CreationStatus);
        dispatch(setCurrentStepIndex({
          productId: newProduct._id,
          stepIndex: index !== -1 ? index : 0,
        }));
        return newProduct._id;
      } finally {
        globalCreationLock = null;
        setLoading(false);
      }
    })();

    globalCreationLock = creationPromise;
    return creationPromise;
  };

  useEffect(() => {
    unmountedRef.current = false;
    if (!userId) return;

    const initialize = async () => {
      try {
        if (productIdFromProps) {
          const product = await dispatch(fetchProductStatus(productIdFromProps)).unwrap();
          if (unmountedRef.current) return;
          setInitializedProductId(product._id);
          dispatch(setCurrentProductId(product._id));
          return;
        }

        if (!globalCreationLock) {
          await createNewProduct();
        } else {
          await globalCreationLock;
        }
      } catch (err) {
        console.error('[useInitProduct] ❌ Init error:', err);
      }
    };

    initialize();

    return () => {
      unmountedRef.current = true;
    };
  }, [userId, productIdFromProps]);

  const clearProductId = () => {
    localStorage.removeItem('currentProductId');
    setInitializedProductId(undefined);
  };

  return { loading, createNewProduct, initializedProductId, clearProductId };
};

export default useInitProduct;
