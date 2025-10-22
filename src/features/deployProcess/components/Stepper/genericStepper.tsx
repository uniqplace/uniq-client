import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Steps } from 'primereact/steps';
import { Button } from 'primereact/button';
import { useAppDispatch, useAppSelector } from '../../../../hooks/hooks';
import {
  markStepCompleted,
  updateProductStep,
  setCurrentStepIndex,
} from '../../slices/stepperSlice';
import { ProgressSpinner } from 'primereact/progressspinner';
import '../../../../styles/genericStepper.css';
import 'primeicons/primeicons.css';
import useStepperValidation from '../../../../hooks/useStepperValidation';
import ProductCompletedDialog from './ProductCompletedDialog';

import { stepsConfig } from './steps';

interface GenericStepperProps {
  productId: string;
  steps?: Array<{
    key: string;
    title: string;
    component: React.ComponentType<any>;
    validateStep?: () => Promise<boolean> | boolean;
  }>;
  createNewProduct?: () => Promise<string | undefined>;
}

const GenericStepper: React.FC<GenericStepperProps> = ({ productId, steps = stepsConfig, createNewProduct }) => {
  const stepperState = useAppSelector(state => {
    const products = state.stepper.productsInProgress;
    return productId ? products[productId] : undefined;
  });
  const currentStepIndex = stepperState?.currentStepIndex;
  const completedSteps = stepperState?.completedSteps;
  const product = stepperState?.product;
  const loading = stepperState?.loading;
  const error = stepperState?.error;
  const safeStepIndex = typeof currentStepIndex === 'number' ? currentStepIndex : undefined;
  const CurrentStepComponent = safeStepIndex !== undefined ? steps[safeStepIndex]?.component : null;
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const [canGoNext, setCanGoNext] = useState(false);
  const { isValid, error: stepperError } = useStepperValidation(steps);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { stepKey } = useParams<{ stepKey: string }>();

 


  useEffect(() => {
    if (!productId || !product || !product.CreationStatus || loading) return;
    const idx = steps.findIndex(s => s.title === product.CreationStatus);
    if (idx >= 0) {
      const completedArr = steps.map((_, i) => i < idx);
      dispatch({ type: 'stepper/setCompletedSteps', payload: { productId, completed: completedArr } });
      dispatch(setCurrentStepIndex({ productId, stepIndex: idx }));
      if (stepKey !== steps[idx].key) {
        navigate(`/create-your-own-product/${productId}/${steps[idx].key}`, { replace: true });
      }
    } else {
      console.warn('[Stepper] No matching step title found for CreationStatus:', product.CreationStatus);
    }
  }, [productId, product?._id, loading]);

  useEffect(() => {
    if (!productId || !stepKey || loading) return;
    const index = steps.findIndex((s) => s.key === stepKey);
    if (index !== -1) {
      dispatch(setCurrentStepIndex({ productId, stepIndex: index }));
    }
  }, [dispatch, stepKey, loading, productId]);

  useEffect(() => {
    if (safeStepIndex === undefined || !productId || !product) return;
    const serverStepIndex = steps.findIndex((s) => s.title === product.CreationStatus);
    if (safeStepIndex > serverStepIndex) {
      dispatch(updateProductStep({ productId, stepNumber: safeStepIndex + 1 }));
    }
  }, [safeStepIndex, dispatch, product, productId]);

  useEffect(() => {
    setCanGoNext(false);
  }, [currentStepIndex]);

  // טעינה ראשונית/שגיאת ולידציה - רק אחרי שכל ה-hooks נקראו
  if (!isValid) {
    console.error(stepperError, { steps });
    return (
      <div style={{ color: 'red', padding: '1em', background: '#ffe6e6', border: '1px solid #ffcccc', borderRadius: '4px' }}>
        {stepperError}
      </div>
    );
  }
  if (!productId || loading || !product) {
    return <ProgressSpinner />;
  }

  const navigateToNextStep = () => {
    if (safeStepIndex === undefined) return;
    if (safeStepIndex === steps.length - 1) {
      setShowFinalPopup(true);
    } else {
      const nextKey = steps[safeStepIndex + 1]?.key;
      if (nextKey) {
        navigate(`/create-your-own-product/${productId}/${nextKey}`);
      } else {
        console.warn('[Stepper] No nextKey found, not navigating');
      }
    }
  };

  const updateStepOnServer = (stepIndex: number) => {
    if (typeof stepIndex === 'number' && stepIndex > 0 && productId) {
      dispatch(markStepCompleted({ productId, stepIndex: stepIndex - 1 }));
    }
  };

  const handleBack = () => {
    if (safeStepIndex !== undefined && safeStepIndex > 0) {
      const prevKey = steps[safeStepIndex - 1]?.key;
      if (prevKey) {
        navigate(`/create-your-own-product/${productId}/${prevKey}`);
      }
    }
  };

  // handleCompleteStep - פונקציה ללחיצה על Next/Finish
  const handleCompleteStep = async () => {
    if (safeStepIndex === undefined) return;
    // כאן אפשר להוסיף לוגיקת ולידציה אם צריך
    if (!productId) {
      console.warn('[Stepper] No productId, cannot complete step');
      return;
    }
    updateStepOnServer(safeStepIndex);
    navigateToNextStep();
  };

  const stepsModel = steps.map((step, index) => ({
    label: step.title,
    icon: completedSteps && completedSteps[index] ? 'pi pi-check' : undefined,
  }));
  const isStepCompleted = safeStepIndex !== undefined ? completedSteps?.[safeStepIndex] : false;

  const currentStepKey = safeStepIndex !== undefined ? steps[safeStepIndex]?.key : undefined;


  const baseStepProps = {
    product,
    productId,
    onComplete: () => setCanGoNext(true),
    setCanGoNext,
    currentStepIndex: safeStepIndex, 
    onNextStep: handleCompleteStep, 
  };

  let renderedStep = null;
  if (CurrentStepComponent && currentStepKey === 'viewLiveBids') {
    renderedStep = <CurrentStepComponent {...baseStepProps} bidRequestId={product?._id} />;
  } else if (CurrentStepComponent) {
    renderedStep = <CurrentStepComponent {...baseStepProps} />;
  }

  return (
    <div className="uniq-gradient-steps card max-w-5xl mx-auto p-8 shadow-2xl rounded-2xl bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200">
      <h2 className="text-3xl font-bold text-center mb-8 text-primary drop-shadow-sm tracking-tight">
        Create Your Own Product
      </h2>

      <Steps
        model={stepsModel}
        activeIndex={safeStepIndex}
        readOnly
        className="custom-steps mb-8 px-2"
        style={{ background: 'transparent', borderRadius: '1rem', boxShadow: 'none' }}
      />

      {error ? (
        <div className="text-center text-red-500 mb-6 text-lg font-semibold">{error}</div>
      ) : (
        <div
          className="step-content text-center p-6 border rounded-xl bg-white/80 shadow-md transition-all duration-300"
          style={{
            opacity: isStepCompleted ? 0.5 : 1,
            pointerEvents: isStepCompleted ? 'none' : 'auto',
          }}
        >
          {renderedStep}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
        <Button
          label="Back"
          onClick={handleBack}
          disabled={safeStepIndex === undefined || safeStepIndex === 0}
          className="p-button-secondary px-6 py-2 rounded-lg text-base shadow-sm"
        />
        <Button
          label={safeStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
          onClick={handleCompleteStep}
          disabled={loading || !product || !product._id || !canGoNext}
          className="p-button-primary px-8 py-2 rounded-lg text-base font-semibold shadow-md bg-gradient-to-r from-primary to-blue-500 border-0"
        />
      </div>

      <ProductCompletedDialog
        visible={showFinalPopup}
        onHide={() => setShowFinalPopup(false)}
        onCreateNewProduct={async () => {
          setShowFinalPopup(false);
          if (createNewProduct) {
            await createNewProduct();
          }
        }}
        loading={false}
      />
    </div>
  );
};

export default GenericStepper;







