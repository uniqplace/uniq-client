import { useEffect, useRef, useState } from 'react';
import {
    createProduct,
    fetchProductStatus,
    setCurrentStepIndex,
    clearStepper,
} from '../features/deployProcess/slices/stepperSlice';
import { stepsConfig } from '../features/deployProcess/components/Stepper/steps';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { defaultProductTemplate } from '../utils/defaultProductTemplate';

// קבלת productId (או undefined ליצירת חדש)
const useInitProduct = (productIdFromProps?: string): {
  loading: boolean;
  createNewProduct: () => Promise<string | undefined>;
  initializedProductId: string | undefined;
  clearProductId: () => void;
} => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.user?.id);
  // ניהול productId פנימי בלבד
  // נטעין productId מ-localStorage אם אין מה-props
  const [initializedProductId, setInitializedProductId] = useState<string | undefined>(() => {
    return productIdFromProps || localStorage.getItem('currentProductId') || undefined;
  });
  const [loading, setLoading] = useState(false);
  const hasInitialized = useRef(false);
  const isManualCreateInProgress = useRef(false);

  useEffect(() => {
    console.log('[useInitProduct] userId:', userId, 'initializedProductId:', initializedProductId, 'productIdFromProps:', productIdFromProps);
  }, [userId, initializedProductId, productIdFromProps]);

  // יצירת מוצר חדש
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
      console.log('[useInitProduct] Created new product:', newProduct);
      setInitializedProductId(newProduct._id);
      localStorage.setItem('currentProductId', newProduct._id); // שמירה ב-localStorage
      console.log('setInitializedProductId', newProduct._id);
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

  // פונקציה למחיקת productId מה-localStorage (לקרוא בסיום תהליך)
  const clearProductId = () => {
    localStorage.removeItem('currentProductId');
    setInitializedProductId(undefined);
  };

  useEffect(() => {
    if (!userId) { console.warn('[useInitProduct] No userId, abort init'); return; }
    if (hasInitialized.current) return;
    if (isManualCreateInProgress.current) return;
    let isMounted = true;
    const initializeProduct = async () => {
      hasInitialized.current = true;
      setLoading(true);
      try {
        let id = productIdFromProps || initializedProductId;
        let product: { CreationStatus: string; _id?: string } | null = null;
        if (id) {
          // נטען מוצר לפי productId
          try {
            product = await dispatch(fetchProductStatus(id)).unwrap();
            console.log('[useInitProduct] fetched product:', product);
          } catch (err: any) {
            if (
              err?.status === 404 ||
              (typeof err?.message === 'string' && err.message.includes('Product not found'))
            ) {
              id = undefined;
              console.warn('[useInitProduct] Product not found, will create new');
            } else {
              throw err;
            }
          }
        }
        // אם productId לא קיים או לא תקין, ניצור מוצר חדש
        if (!id) {
          const hardcodedProduct = { ...defaultProductTemplate };
          const newProduct = await dispatch(createProduct(hardcodedProduct)).unwrap();
          id = newProduct._id;
          product = newProduct;
          setInitializedProductId(id);
          localStorage.setItem('currentProductId', id); // שמירה ב-localStorage
          console.log('[useInitProduct] Created new product (init):', newProduct);
        }
        if (product && id) {
          if (!isMounted) {
            setLoading(false);
            return;
          }
          setInitializedProductId(id);
          localStorage.setItem('currentProductId', id); // שמירה ב-localStorage
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
