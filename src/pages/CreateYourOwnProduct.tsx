import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/hooks';
import { ProgressSpinner } from 'primereact/progressspinner';
import GenericStepper from '../features/deployProcess/components/Stepper/genericStepper';
import useInitProduct from '../hooks/useInitProduct';

function CreateYourOwnProduct() {
  const userId = useAppSelector(state => state.user?.id);
  // נטען productId מ-localStorage אם קיים
  const storedProductId = typeof window !== 'undefined' ? localStorage.getItem('currentProductId') : undefined;
  const { loading, initializedProductId, createNewProduct } = useInitProduct(storedProductId || undefined);
  if (!userId || loading || !initializedProductId) {
    return <div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ProgressSpinner /></div>;
  }
  return (
    <Routes>
      <Route path="" element={<Navigate to="product-definition" />} />
      <Route path=":stepKey" element={<GenericStepper productId={initializedProductId} createNewProduct={createNewProduct} />} />
    </Routes>
  );
}

export default CreateYourOwnProduct;
