// src/features/stepper/GenericStepper.tsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type{ RootState } from '../../../../store';
import {
  createProduct,
  fetchProductStatus,
  completeStep,
  goToNextStep,
  goToPrevStep,
  updateProductStatus,
} from '../../slices/stepperSlice';
import { steps } from './steps';

export default function GenericStepper() {
  const dispatch = useDispatch<any>();
  const { currentStepIndex, product, loading } = useSelector((state: RootState) => state.stepper);
  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    const productId = localStorage.getItem('productId');
    if (productId) {
      dispatch(fetchProductStatus(productId));
    } else {
      dispatch(createProduct());
    }
  }, [dispatch]);

  const handleComplete = async (data: any) => {
    dispatch(completeStep(currentStep.id));
    await dispatch(updateProductStatus(currentStep.id));
    dispatch(goToNextStep());
  };

  if (loading) return <p>Loading...</p>;

  const StepComponent = currentStep.component;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Create Your Own Product</h1>
      {/* שלב נוכחי */}
      <StepComponent onComplete={handleComplete} product={product} />
      {/* כפתורי ניווט */}
      <div className="flex justify-between mt-4">
        <button disabled={currentStepIndex === 0} onClick={() => dispatch(goToPrevStep())}>
          Back
        </button>
        {/* Next אוטומטי דרך handleComplete */}
      </div>
    </div>
  );
}
