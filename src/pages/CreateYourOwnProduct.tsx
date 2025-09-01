import { Routes, Route, Navigate } from 'react-router-dom';
import GenericStepper from '../features/deployProcess/components/Stepper/genericStepper';
// import useInitProduct from '../hooks/useInitProduct';
function CreateYourOwnProduct() {
  // useInitProduct();
  return (
    <Routes>
      <Route path="" element={<Navigate to="product-definition" />} />
      <Route path=":stepKey" element={<GenericStepper />} />
    </Routes>

  );
}

export default CreateYourOwnProduct;
