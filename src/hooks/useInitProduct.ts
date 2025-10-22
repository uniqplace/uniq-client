import { useEffect, useRef, useState } from 'react';
import {
  createProduct,
  fetchProductStatus,
  setCurrentStepIndex,
  clearStepper,
  setCurrentProductId,
} from '../features/deployProcess/slices/stepperSlice';
import { stepsConfig } from '../features/deployProcess/components/Stepper/steps';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { defaultProductTemplate } from '../utils/defaultProductTemplate';

let globalCreationLock: Promise<any> | null = null; // מונע יצירה כפולה

const useInitProduct = (productIdFromProps?: string) => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.user?.id);
  const [initializedProductId, setInitializedProductId] = useState<string | undefined>(productIdFromProps);
  const [loading, setLoading] = useState(false);
  const unmountedRef = useRef(false);

  const log = (...a: any[]) => console.log('[useInitProduct]', ...a);

  const createNewProduct = async () => {
    if (!userId) {
      log('No userId → cannot create product');
      return undefined;
    }
    if (globalCreationLock) {
      log('Creation lock active → waiting...');
      await globalCreationLock;
      return initializedProductId;
    }

    log('🟢 Manual product creation started');
    setLoading(true);

    const creationPromise = (async () => {
      try {
        const newProduct = await dispatch(createProduct({ ...defaultProductTemplate })).unwrap();
        if (unmountedRef.current) return;
        log('✅ Created product manually:', newProduct._id);
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
          log('Fetching product:', productIdFromProps);
          const product = await dispatch(fetchProductStatus(productIdFromProps)).unwrap();
          if (unmountedRef.current) return;
          setInitializedProductId(product._id);
          log('✅ Existing product loaded:', product._id);
          dispatch(setCurrentProductId(product._id));
          return;
        }

        // אם אין productId – ניצור רק אם אין יצירה קודמת בהמתנה
        if (!globalCreationLock) {
          log('🟡 Auto-create new product (init)');
          await createNewProduct();
        } else {
          log('⏸ Another creation in progress → waiting...');
          await globalCreationLock;
        }
      } catch (err) {
        if (!unmountedRef.current)
          console.error('[useInitProduct] ❌ Init error:', err);
      }
    };

    initialize();

    return () => {
      unmountedRef.current = true;
      log('🧩 Unmounted (cancel pending ops)');
    };
  }, [userId, productIdFromProps]);

  const clearProductId = () => {
    localStorage.removeItem('currentProductId');
    setInitializedProductId(undefined);
  };

  return { loading, createNewProduct, initializedProductId, clearProductId };
};

export default useInitProduct;
