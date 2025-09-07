import React, { useEffect, useCallback, useState } from 'react';
// ...existing imports...
import { getUserProductKey } from '../../../../utils/productStorageKey';
import { useParams, useNavigate } from 'react-router-dom';
import { Steps } from 'primereact/steps';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { useAppDispatch, useAppSelector } from '../../../../hooks/hooks';
import {
  markStepCompleted,
  updateProductStep,
  setCurrentStepIndex,
} from '../../slices/stepperSlice';
// stepsConfig יוסר מהייבוא
import useInitProduct from '../../../../hooks/useInitProduct';
import { ProgressSpinner } from 'primereact/progressspinner';
import '../../../../styles/genericStepper.css';
import 'primeicons/primeicons.css';

import { stepsConfig } from './steps';

interface GenericStepperProps {
  steps: Array<{
    key: string;
    title: string;
    component: React.ComponentType<any>;
    validateStep?: () => Promise<boolean> | boolean;
  }>;
}

// שימוש ב־stepsConfig כברירת מחדל אם לא מועבר steps
const GenericStepper: React.FC<Partial<GenericStepperProps>> = ({ steps = stepsConfig }) => {

  // Developer error: steps prop is missing or empty
  if (!steps || !Array.isArray(steps) || steps.length === 0) {
    console.error('Stepper configuration error: steps prop is missing or empty.', { steps });
    return (
      <div style={{ color: 'red', padding: '1em', background: '#ffe6e6', border: '1px solid #ffcccc', borderRadius: '4px' }}>
        Stepper configuration error: steps prop is missing or empty.
      </div>
    );
  }

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { stepKey } = useParams<{ stepKey: string }>();

  const { currentStepIndex, completedSteps, product, loading, error } = useAppSelector(
    (state) => state.stepper
  );
  const userId = useAppSelector((state) => state.user?.id);


  
  useEffect(() => {
    if (!product || !product.CreationStatus) return;
    const idx = steps.findIndex(s => s.title === product.CreationStatus);

    if (idx >= 0) {
      const completedArr = steps.map((_, i) => i < idx);

      dispatch({ type: 'stepper/setCompletedSteps', payload: completedArr });
      dispatch(setCurrentStepIndex(idx));

      if (stepKey !== steps[idx].key) {
        navigate(`/create-your-own-product/${steps[idx].key}`, { replace: true });
      }
    } else {
      console.warn('[Stepper] No matching step title found for CreationStatus:', product.CreationStatus);
    }
  }, [product?._id]);


  const [showFinalPopup, setShowFinalPopup] = useState(false);

  const { loading: initLoading, createNewProduct } = useInitProduct();



  useEffect(() => {
    if (!stepKey || loading) return;
    const index = steps.findIndex((s) => s.key === stepKey);
    if (index !== -1) {
      dispatch(setCurrentStepIndex(index));
    }
  }, [dispatch, stepKey, loading]);


  useEffect(() => {
    if (currentStepIndex === null) return;

    const key = getUserProductKey(userId);
    const productId = localStorage.getItem(key);
    if (!productId || !product) {
      return;
    }

    const serverStepIndex = steps.findIndex(
      (s) => s.title === product.CreationStatus
    );

    if (currentStepIndex > serverStepIndex) {
      console.log('[Stepper] Advancing product step on server', {
        productId,
        from: serverStepIndex,
        to: currentStepIndex,
      });
      dispatch(updateProductStep({
        productId,
        stepNumber: currentStepIndex + 1
      }));
    } else {
    }
  }, [currentStepIndex, dispatch, product]);


  const [canGoNext, setCanGoNext] = useState(false);

  useEffect(() => {
    setCanGoNext(false);
  }, [currentStepIndex]);

  const CurrentStepComponent = currentStepIndex !== null ? steps[currentStepIndex]?.component : null;

  const validateCurrentStep = async () => {
    if (currentStepIndex === null) return false;
    const validateStepFn = steps[currentStepIndex]?.validateStep;
    if (validateStepFn) {
      try {
        const valid = await validateStepFn();
        return !!valid;
      } catch {
        return false;
      }
    }
    return true;
  };

  const getCurrentProductId = () => {
    let productId: string | undefined;
    productId = product?._id;
    return productId;
  };


  const updateStepOnServer = () => {
    if (typeof currentStepIndex === 'number' && currentStepIndex > 0) {
      dispatch(markStepCompleted(currentStepIndex - 1));
    }
  };

  const navigateToNextStep = () => {
    if (typeof currentStepIndex !== 'number') return;
    if (currentStepIndex === steps.length - 1) {
      setShowFinalPopup(true);
    } else {
      const nextKey = steps[currentStepIndex + 1]?.key;
      if (nextKey) {
        navigate(`/create-your-own-product/${nextKey}`);
      } else {
        console.warn('[Stepper] No nextKey found, not navigating');
      }
    }
  };

  const handleCompleteStep = useCallback(async () => {
    if (typeof currentStepIndex !== 'number') return;
    const valid = await validateCurrentStep();
    if (!valid) {
      window.alert('Please complete all required fields before continuing.');
      return;
    }
    const productId = getCurrentProductId();
    if (!productId) {
      console.warn('[Stepper] No productId, cannot complete step');
      return;
    }
    updateStepOnServer();
    navigateToNextStep();
  }, [currentStepIndex, dispatch, navigate, product?._id, userId]);


  const handleBack = () => {
    if (currentStepIndex !== null && currentStepIndex > 0) {
      const prevKey = steps[currentStepIndex - 1]?.key;
      if (prevKey) {
        navigate(`/create-your-own-product/${prevKey}`);
      }
    }
  };

  const stepsModel = steps.map((step, index) => ({
    label: step.title,
    icon: completedSteps && completedSteps[index] ? 'pi pi-check' : undefined,
  }));
  const isStepCompleted = currentStepIndex !== null ? completedSteps[currentStepIndex] : false;

  if (loading && product && product._id) {
    return <ProgressSpinner />;
  }
  if (currentStepIndex === null) {
    return <ProgressSpinner />;
  }


  const bidRequestId = product?._id;
  const baseStepProps = {
    product,
    
    onComplete: () => setCanGoNext(true),
    setCanGoNext,
  };

let renderedStep = null;
const currentStepKey = currentStepIndex !== null ? steps[currentStepIndex]?.key : undefined;
if (CurrentStepComponent && currentStepKey === 'viewLiveBids') {
  renderedStep = <CurrentStepComponent {...baseStepProps} bidRequestId={bidRequestId} />;
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
        activeIndex={currentStepIndex}
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
          disabled={currentStepIndex === 0 || currentStepIndex === null}
          className="p-button-secondary px-6 py-2 rounded-lg text-base shadow-sm"
        />
        <Button
          label={currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
          onClick={handleCompleteStep}
          disabled={loading || !product || !product._id || !canGoNext}
          className="p-button-primary px-8 py-2 rounded-lg text-base font-semibold shadow-md bg-gradient-to-r from-primary to-blue-500 border-0"
        />
      </div>

      <Dialog
        header={<span className="text-xl font-bold text-primary">Product Completed!</span>}
        visible={showFinalPopup}
        style={{ width: '350px', borderRadius: '1rem' }}
        onHide={() => setShowFinalPopup(false)}
        closeIcon={<i className="pi pi-times" style={{ fontSize: '1.5rem' }} />}
        className="rounded-2xl shadow-xl"
      >
        <div className="text-center">
          <p className="mb-4 text-lg">
            <span role="img" aria-label="delivered" style={{ fontSize: '2em' }}>🎉</span><br />
            <span className="font-bold">Congratulations!</span> Your product has been successfully delivered.<br />
            <span className="text-gray-600">We hope you enjoy your unique creation.</span><br />
            <span className="text-gray-400 text-sm">Thank you for choosing us!</span>
          </p>
          <Button
            label={initLoading ? "create new product..." : "Create New Product"}
            onClick={async () => {
              setShowFinalPopup(false);
              await createNewProduct();
            }}
            className="p-button-success mt-3 px-6 py-2 rounded-lg text-base font-semibold shadow-md"
            disabled={initLoading}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default GenericStepper;







