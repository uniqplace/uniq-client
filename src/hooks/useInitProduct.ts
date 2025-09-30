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

const useInitProduct = (productIdFromProps?: string): {
  loading: boolean;
  createNewProduct: () => Promise<string | undefined>;
  initializedProductId: string | undefined;
  clearProductId: () => void;
} => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.user?.id);
  const [initializedProductId, setInitializedProductId] = useState<string | undefined>(productIdFromProps);
  const [loading, setLoading] = useState(false);
  const isManualCreateInProgress = useRef(false);

  const createNewProduct = async () => {
    if (!userId) { console.warn('[useInitProduct] No userId, cannot create product'); return undefined; }
    setLoading(true);
    isManualCreateInProgress.current = true;
    try {
      if (initializedProductId) {
        dispatch(clearStepper({ productId: initializedProductId }));
      }
      dispatch({ type: 'stepper/setCompletedSteps', payload: Array(stepsConfig.length).fill(false) });
      const hardcodedProduct = { ...defaultProductTemplate };
      const newProduct = await dispatch(createProduct(hardcodedProduct)).unwrap();
      setInitializedProductId(newProduct._id);
      localStorage.setItem('currentProductId', newProduct._id); 
      const index = stepsConfig.findIndex((s) => s.title === newProduct.CreationStatus);
      dispatch(setCurrentStepIndex({ productId: newProduct._id, stepIndex: index !== -1 ? index : 0 }));
      return newProduct._id;
    } catch (err) {
      console.error('[useInitProduct] Error creating new product:', err);
      return undefined;
    } finally {
      setLoading(false);
      setTimeout(() => { isManualCreateInProgress.current = false; }, 500);
    }
  };

  const clearProductId = () => {
    localStorage.removeItem('currentProductId');
    setInitializedProductId(undefined);
  };

  useEffect(() => {
    if (!userId) {
      setLoading(true);
      return;
    }
    if (isManualCreateInProgress.current) return; 
    let isMounted = true;
    const initializeProduct = async () => {
      setLoading(true);
      try {
        let id = productIdFromProps;
        let product: { CreationStatus?: string; _id?: string } | null = null;
        if (id) {
          try {
            product = await dispatch(fetchProductStatus(id)).unwrap();
            console.log('[useInitProduct] fetched product:', product);
          } catch (err: any) {
            if (
              err?.status === 404 ||
              (typeof err?.message === 'string' && err.message.includes('Product not found'))
            ) {
              id = undefined;
              console.warn('[useInitProduct] Product not found, לא ניצור מוצר חדש כי productId הגיע מה-URL');
              setInitializedProductId(undefined);
              return;
            } else {
              throw err;
            }
          }
        }
        if (!id && !isManualCreateInProgress.current && !productIdFromProps) {
          const hardcodedProduct = { ...defaultProductTemplate };
          const newProduct = await dispatch(createProduct(hardcodedProduct)).unwrap();
          id = newProduct._id;
          product = newProduct;
          setInitializedProductId(id);
          localStorage.setItem('currentProductId', id); 
          console.log('[useInitProduct] Created new product (init):', newProduct);
        }
        if (product && id) {
          if (!isMounted) {
            setLoading(false);
            return;
          }
          setInitializedProductId(id);
          localStorage.setItem('currentProductId', id); 
          dispatch(setCurrentProductId(id)); 
          dispatch({
            type: 'stepper/createProduct/fulfilled',
            payload: product
          });
          const index = stepsConfig.findIndex((s) => s.title === product!.CreationStatus);
          if (id) {
            dispatch(setCurrentStepIndex({ productId: id, stepIndex: index !== -1 ? index : 0 }));
          }
        }
      } catch (err) {
        console.error('[useInitProduct] Error initializing product:', err);
      } finally {
        setLoading(false);
      }
    };
    initializeProduct();
    return () => {
      isMounted = false;
    };
  }, [dispatch, userId, productIdFromProps]);

  return { loading, createNewProduct, initializedProductId, clearProductId };
};

export default useInitProduct;
