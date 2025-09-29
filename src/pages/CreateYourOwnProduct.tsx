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
  // נטען productId מה-URL אם קיים
  const productIdFromUrl = params.productId;
  const storedProductId = typeof window !== 'undefined' ? localStorage.getItem('currentProductId') : undefined;
  // עדיפות ל-productId מה-URL
  const { loading, initializedProductId, createNewProduct } = useInitProduct(productIdFromUrl || storedProductId || undefined);
  useEffect(() => {
    if (userId && (loading || !initializedProductId)) {
      console.log('userId נטען, אפשר להמשיך לטעון מוצר או להציג ספינר');
      // כאן אפשר להפעיל לוגיקה נוספת אם תרצה
    }
  }, [userId, loading, initializedProductId]);

  useEffect(() => {
    // אם יש productId ב-URL והוא שונה מה-currentProductId, הפוך אותו לנוכחי
    if (productIdFromUrl && initializedProductId && productIdFromUrl !== initializedProductId) {
      dispatch(setCurrentProductId(productIdFromUrl));
    } else if (initializedProductId) {
      dispatch(setCurrentProductId(initializedProductId));
    }
  }, [productIdFromUrl, initializedProductId, dispatch]);

  if (loading || !initializedProductId) {
    return <div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ProgressSpinner /></div>;
  }
  // ניווט אוטומטי לסטפר של מוצר חדש אם אין productId ב-URL
  if (!productIdFromUrl && initializedProductId) {
    console.log("🫥🫥נכנסתי לכאן!!!");
    
    return <Navigate to={`/create-your-own-product/${initializedProductId}/product-definition`} replace />;
  }
  
  return (
    <Routes>
      <Route path="*" element={<GenericStepper productId={initializedProductId} createNewProduct={createNewProduct} />} />
    </Routes>
  );
}

export default CreateYourOwnProduct;
