import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/hooks';
import { ProgressSpinner } from 'primereact/progressspinner';
import GenericStepper from '../features/deployProcess/components/Stepper/genericStepper';
import useInitProduct from '../hooks/useInitProduct';
import { setCurrentProductId } from '../features/deployProcess/slices/stepperSlice';
import { useEffect } from 'react';

function CreateYourOwnProduct() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector(state => state.user?.id);
  const params = useParams();
  const productIdFromUrl = params.productId;

  // תמיד לקרוא את כל ה-hooks
  const { loading, initializedProductId, createNewProduct } = useInitProduct(productIdFromUrl || undefined);

  // אם יש productId ב-URL, לעדכן סטייט בלבד
  useEffect(() => {
    if (productIdFromUrl) {
      console.log('[CreateYourOwnProduct] רנדר עם productId מה-URL:', productIdFromUrl);
      dispatch(setCurrentProductId(productIdFromUrl));
    }
  }, [productIdFromUrl, dispatch]);

  useEffect(() => {
    if (userId && (loading || !initializedProductId)) {
      console.log('[CreateYourOwnProduct] טעינה/יצירת מוצר חדש ב-useInitProduct', { loading, initializedProductId });
    }
  }, [userId, loading, initializedProductId]);

  if (loading || !initializedProductId) {
    console.log('[CreateYourOwnProduct] מציג ספינר, loading:', loading, 'initializedProductId:', initializedProductId);
    return <div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ProgressSpinner /></div>;
  }

  // ניווט אוטומטי לסטפר של מוצר חדש אם אין productId ב-URL
  if (!productIdFromUrl && initializedProductId) {
    console.log('[CreateYourOwnProduct] ניווט אוטומטי לסטפר עם productId חדש:', initializedProductId);
    return <Navigate to={`/create-your-own-product/${initializedProductId}/product-definition`} replace />;
  }

  // אם יש productId ב-URL, מרנדרים את הסטפר
  if (productIdFromUrl && initializedProductId) {
    return (
      <Routes>
        <Route path="*" element={<GenericStepper productId={productIdFromUrl} />} />
      </Routes>
    );
  }

  return null;
}

export default CreateYourOwnProduct;
