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

  // Get stepper state from Redux
  const { currentStepIndex, completedSteps, product, loading, error } = useAppSelector(
    (state) => state.stepper
  );
  const userId = useAppSelector((state) => state.user?.id);


  // On mount or when product changes, update completedSteps and currentStepIndex from server status if needed
  // Auto-navigate to last completed step only on initial mount or when product._id changes
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

  // Debug: Log state on every render
  useEffect(() => {
    console.log('', {
      stepKey,
      currentStepIndex,
      completedSteps,
      product,
      loading,
      error,
    });
  });

  // Synchronizes between the current step in the URL and the currentStepIndex
  useEffect(() => {
    if (!stepKey || loading) return;
    const index = stepsConfig.findIndex((s) => s.key === stepKey);
    if (index !== -1) {
      dispatch(setCurrentStepIndex(index));
    }
  }, [dispatch, stepKey, loading]);

  // Sync the server's product step with the current step in the stepper.
  // If the user has advanced further in the stepper than the server's recorded step (CreationStatus),
  // update the server to reflect the new
  useEffect(() => {
    if (currentStepIndex === null) return;

    // Ensure there is a product and ID before proceeding
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
      // Update server with new step index
      dispatch(updateProductStep({
        productId,
        stepNumber: currentStepIndex + 1
      }));
    } else {
    }
  }, [currentStepIndex, dispatch, product]);


  const [canGoNext, setCanGoNext] = useState(false);

  // Reset canGoNext on every new step
  useEffect(() => {
    setCanGoNext(false);
  }, [currentStepIndex]);

  // Render the current step component based on currentStepIndex  
  const CurrentStepComponent = currentStepIndex !== null ? stepsConfig[currentStepIndex]?.component : null;

  const handleCompleteStep = useCallback(async () => {
    if (currentStepIndex === null) {
      return;
    }

    const validateStepFn = stepsConfig[currentStepIndex]?.validateStep;

    if (validateStepFn) {
      try {
        const valid = await validateStepFn();
        if (!valid) {
          return;
        }
      } catch (err) {
        return;
      }
    }

    
// Retrieve the latest productId for the current user from localStorage.
// This ensures that all step actions are associated with the correct, up-to-date product instance.
// If no productId is found, prevent step completion and log a warning.
    let productId: string | undefined = product?._id;
    const key = getUserProductKey(userId);
    const storedId = localStorage.getItem(key);
    productId = storedId !== null ? storedId : undefined;
    if (!productId) {
      console.warn('[Stepper] No productId in localStorage, cannot complete step');
      return;
    }

    if (!productId) {
      console.error('[Stepper] No productId, cannot complete step');
      return;
    }
    // Mark the previous step as complete (if not on the first step)
    if (currentStepIndex > 0) {
      dispatch(markStepCompleted(currentStepIndex - 1));
    }
    dispatch(updateProductStep({ productId, stepNumber: currentStepIndex + 1 }));

    if (currentStepIndex === stepsConfig.length - 1) {
      setShowFinalPopup(true)
    } else {
      const nextKey = stepsConfig[currentStepIndex + 1]?.key;
      if (nextKey) {
        navigate(`/create-your-own-product/${nextKey}`);
      } else {
        console.warn('[Stepper] No nextKey found, not navigating');
      }
    }
  }, [currentStepIndex, dispatch, navigate, product?._id]);


  // Go back without updating server or completedSteps (do not regress status)
  const handleBack = () => {
    if (currentStepIndex !== null && currentStepIndex > 0) {
      const prevKey = stepsConfig[currentStepIndex - 1]?.key;
      if (prevKey) {
        navigate(`/create-your-own-product/${prevKey}`);
      }
    }
  };

  // Always use completedSteps from Redux (restored from localStorage) for V icons
  const stepsModel = stepsConfig.map((step, index) => ({
    label: step.title,
    icon: completedSteps && completedSteps[index] ? 'pi pi-check' : undefined,
  })
  );
  // Check if the current step is completed for styling and interaction
  const isStepCompleted = currentStepIndex !== null ? completedSteps[currentStepIndex] : false;

  if (loading || currentStepIndex === null) {
    return <ProgressSpinner />;
  }


  // Pass bidRequestId only to BidOffersList, all other steps get only the base props
  const bidRequestId = product?._id;
  const baseStepProps = {
    product,
    onComplete: () => setCanGoNext(true),
    setCanGoNext,
  };

  let renderedStep = null;
  if (CurrentStepComponent && CurrentStepComponent.displayName === 'BidOffersList') {
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
       // closeIcon={
       //   <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
       //     <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
       //       <line x1="5" y1="5" x2="15" y2="15" stroke="#e53935" strokeWidth="2" strokeLinecap="round" />
       //       <line x1="15" y1="5" x2="5" y2="15" stroke="#e53935" strokeWidth="2" strokeLinecap="round" />
       //     </svg>
       //   </span>
       // }

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







