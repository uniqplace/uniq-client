import React, { useEffect, useCallback, useState } from 'react';
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
import { stepsConfig } from './steps';
import useInitProduct from '../../../../hooks/useInitProduct';
import { ProgressSpinner } from 'primereact/progressspinner';
import '../../../../styles/genericStepper.css';
import 'primeicons/primeicons.css';

const GenericStepper: React.FC = () => {

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { stepKey } = useParams<{ stepKey: string }>();

  const { currentStepIndex, completedSteps, product, loading, error } = useAppSelector(
    (state) => state.stepper
  );
  const userId = useAppSelector((state) => state.user?.id);


  
  useEffect(() => {
    if (!product || !product.CreationStatus) return;
    const idx = stepsConfig.findIndex(s => s.title === product.CreationStatus);

    if (idx >= 0) {
      const completedArr = stepsConfig.map(
        (_, i) => {
          return i < idx
        }
      );

      dispatch({ type: 'stepper/setCompletedSteps', payload: completedArr });
      dispatch(setCurrentStepIndex(idx));

      if (stepKey !== stepsConfig[idx].key) {
        navigate(`/create-your-own-product/${stepsConfig[idx].key}`, { replace: true });
      }
    } else {
      console.warn('[Stepper] No matching step title found for CreationStatus:', product.CreationStatus);
    }
  }, [product?._id]);


  const [showFinalPopup, setShowFinalPopup] = useState(false);

  const { loading: initLoading, createNewProduct } = useInitProduct();



  useEffect(() => {
    if (!stepKey || loading) return;
    const index = stepsConfig.findIndex((s) => s.key === stepKey);
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

    const serverStepIndex = stepsConfig.findIndex(
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

  const CurrentStepComponent = currentStepIndex !== null ? stepsConfig[currentStepIndex]?.component : null;

  const validateCurrentStep = async () => {
    if (currentStepIndex === null) return false;
    const validateStepFn = stepsConfig[currentStepIndex]?.validateStep;
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
    if (currentStepIndex === stepsConfig.length - 1) {
      setShowFinalPopup(true);
    } else {
      const nextKey = stepsConfig[currentStepIndex + 1]?.key;
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
      const prevKey = stepsConfig[currentStepIndex - 1]?.key;
      if (prevKey) {
        navigate(`/create-your-own-product/${prevKey}`);
      }
    }
  };

  const stepsModel = stepsConfig.map((step, index) => ({
    label: step.title,
    icon: completedSteps && completedSteps[index] ? 'pi pi-check' : undefined,
  })
  );
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
const currentStepKey = currentStepIndex !== null ? stepsConfig[currentStepIndex]?.key : undefined;
if (CurrentStepComponent && currentStepKey === 'viewLiveBids') {
  renderedStep = <CurrentStepComponent {...baseStepProps} bidRequestId={bidRequestId} />;
} else if (CurrentStepComponent) {
  renderedStep = <CurrentStepComponent {...baseStepProps} />;
}

  return (
    <div className="card max-w-5xl mx-auto p-6 shadow-lg rounded-xl bg-white">
      <h2 className="text-2xl font-semibold text-center mb-6">
        Create Your Own Product
      </h2>

      <Steps
        model={stepsModel}
        activeIndex={currentStepIndex}
        readOnly
        className="custom-steps mb-6"
      />

      {error ? (
        <div className="text-center text-red-500 mb-4">{error}</div>
      ) : (
        <div
          className="step-content text-center p-4 border rounded-lg bg-gray-50"
          style={{
            opacity: isStepCompleted ? 0.5 : 1,
            pointerEvents: isStepCompleted ? 'none' : 'auto',
          }}
        >
          {renderedStep}
        </div>
      )}

      <div className="flex justify-between mt-6">
        <Button
          label="Back"
          onClick={handleBack}
          disabled={currentStepIndex === 0 || currentStepIndex === null}
          className="p-button-secondary"
        />
        <Button
          label={currentStepIndex === stepsConfig.length - 1 ? 'Finish' : 'Next'}
          onClick={handleCompleteStep}
          disabled={loading || !product || !product._id || !canGoNext}
          className="p-button-primary"
        />
      </div>

      <Dialog
        header="Product Completed!"
        visible={showFinalPopup}
        style={{ width: '350px' }}
        onHide={() => setShowFinalPopup(false)}


        closeIcon={<i className="pi pi-times" style={{ fontSize: '1.5rem' }} />}

      >
        <div className="text-center">
          <p>
            <span role="img" aria-label="delivered" style={{ fontSize: '1.5em' }}>🎉</span><br />
            Congratulations! Your product has been successfully delivered.<br />
            We hope you enjoy your unique creation.<br />
            <span className="text-gray-500 text-sm">Thank you for choosing us!</span>
          </p>
          <Button
            label={initLoading ? "create new product..." : " create new product"}
            onClick={async () => {
              setShowFinalPopup(false);
              await createNewProduct();
            }}
            className="p-button-success mt-3"
            disabled={initLoading}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default GenericStepper;







