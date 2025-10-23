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

  const { loading, initializedProductId } = useInitProduct(productIdFromUrl || undefined);

  useEffect(() => {
    if (productIdFromUrl) {
      dispatch(setCurrentProductId(productIdFromUrl));
    }
  }, [productIdFromUrl, dispatch]);

  useEffect(() => {
    if (userId && (loading || !initializedProductId)) {
    }
  }, [userId, loading, initializedProductId]);

  if (loading || !initializedProductId) {
    return <div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ProgressSpinner /></div>;
  }

  if (!productIdFromUrl && initializedProductId) {
    return <Navigate to={`/create-your-own-product/${initializedProductId}/product-definition`} replace />;
  }

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
