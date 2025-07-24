import React, { useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Steps } from 'primereact/steps';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { stepsConfig } from '../../../../config/stepsConfig';
import {
  goToPrevStep,
  goToNextStep,
  setCurrentStepIndex,
  markStepCompleted,
  createProduct,
  fetchProductStatus,
  updateProductStep,
} from '../../slices/stepperSlice';
import type { RootState, AppDispatch } from '../../../../store';
import '../../../../styles/genericStepper.css';
import { steps } from './steps';

const GenericStepper: React.FC = () => {
  const { stepKey } = useParams<{ stepKey: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const [forceCreate, setForceCreate] = useState(false);

  const { currentStepIndex, completedSteps, product, loading, error } = useSelector(
    (state: RootState) => state.stepper
  );

  const CurrentStepComponent = steps[currentStepIndex]?.component;

  /** טוען מוצר מהשרת או יוצר חדש אם אין productId */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userProductKey = user?.id ? `productId_${user.id}` : 'productId_guest';
    const productId = localStorage.getItem(userProductKey);

    if (!productId || forceCreate) {
      dispatch(createProduct())
        .unwrap()
        .then((created) => {
          if (created?._id) {
            localStorage.setItem(userProductKey, created._id);
            dispatch(fetchProductStatus(created._id));
            setForceCreate(false);
          }
        })
        .catch((err) => console.error('Create product error:', err));
    } else {
      dispatch(fetchProductStatus(productId))
        .unwrap()
        .catch((err) => {
          if (err?.status === 404) {
            localStorage.removeItem(userProductKey);
            setForceCreate(true);
          }
        });
    }
  }, [dispatch, forceCreate]);

  /** מסנכרן את ה-stepIndex לפי ה-URL */
  useEffect(() => {
    const index = stepsConfig.findIndex((s) => s.key === stepKey);
    if (index !== -1) {
      dispatch(setCurrentStepIndex(index));
    }
  }, [dispatch, stepKey]);

  /** עדכון סטטוס מוצר בכל כניסה לשלב */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userProductKey = user?.id ? `productId_${user.id}` : 'productId_guest';
    const productId = localStorage.getItem(userProductKey);

    // מצא את האינדקס של הסטטוס הנוכחי בשרת
    const serverStepIndex = stepsConfig.findIndex(
      (s) => s.label === product?.CreationStatus
    );

    // עדכן סטטוס רק אם עברנו לשלב מתקדם יותר
    if (
      productId &&
      product &&
      currentStepIndex > serverStepIndex
    ) {
      dispatch(updateProductStep({
        productId,
        stepNumber: currentStepIndex + 1
      }));
    }
  }, [currentStepIndex, dispatch, product]);

  /** סימון שלב כהושלם ועדכון השרת */
  const handleCompleteStep = useCallback(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userProductKey = user?.id ? `productId_${user.id}` : 'productId_guest';
    const productId = localStorage.getItem(userProductKey);
    if (!productId) return;

    dispatch(markStepCompleted(currentStepIndex));
    dispatch(updateProductStep({ productId, stepNumber: currentStepIndex + 1 }));

    // אם זה השלב האחרון - הצגת פופאפ
    if (currentStepIndex === stepsConfig.length - 1) {
      setShowFinalPopup(true);
    }
  }, [dispatch, currentStepIndex]);

  /** ניווט לשלב הבא */
  const handleNext = () => {
    if (completedSteps[currentStepIndex] && currentStepIndex < stepsConfig.length - 1) {
      const nextKey = stepsConfig[currentStepIndex + 1].key;
      navigate(`/create-your-own-product/${nextKey}`);
      dispatch(goToNextStep());
    }
  };

  /** ניווט לשלב הקודם */
  const handleBack = () => {
    if (currentStepIndex > 0) {
      const prevKey = stepsConfig[currentStepIndex - 1].key;
      navigate(`/create-your-own-product/${prevKey}`);
      dispatch(goToPrevStep());
    }
  };

  /** דגם הסטפר עם סימון V לשלבים שהושלמו */
  const stepsModel = stepsConfig.map((step, index) => ({
    label: step.label,
    icon: completedSteps[index] ? 'pi pi-check' : undefined,
  }));

  const isStepCompleted = completedSteps[currentStepIndex];

  return (
    <div className="card max-w-5xl mx-auto p-6 shadow-lg rounded-xl bg-white">
      <h2 className="text-2xl font-semibold text-center mb-6">
        Create Your Own Product
      </h2>

      {/* סטפר */}
      <Steps
        model={stepsModel}
        activeIndex={currentStepIndex}
        readOnly
        className="custom-steps mb-6"
      />

      {/* תוכן */}
      {loading ? (
        <div className="text-center text-gray-600">Loading product status...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <>
          <div
            className="step-content text-center p-4 border rounded-lg bg-gray-50"
            style={{
              opacity: isStepCompleted ? 0.5 : 1,
              pointerEvents: isStepCompleted ? 'none' : 'auto',
            }}
          >
            {CurrentStepComponent && (
              <CurrentStepComponent product={product} onComplete={handleCompleteStep} />
            )}
          </div>
        </>
      )}

      <div className="flex justify-between mt-6">
        <Button
          label="Back"
          onClick={handleBack}
          disabled={currentStepIndex === 0}
          className="p-button-secondary"
        />
        <Button
          label="Next"
          onClick={handleNext}
          disabled={
            !completedSteps[currentStepIndex] ||
            currentStepIndex === stepsConfig.length - 1
          }
          className="p-button-primary"
        />
      </div>

      {/* פופאפ סיום תהליך */}
      <Dialog
        header="Product Completed!"
        visible={showFinalPopup}
        style={{ width: '350px' }}
        onHide={() => setShowFinalPopup(false)}
      >
        <div className="text-center">
          <p>Your product is completed and is on its way to you!</p>
          <Button
            label="Close"
            onClick={() => setShowFinalPopup(false)}
            className="p-button-success mt-3"
          />
        </div>
      </Dialog>
    </div>
  );
};

export default GenericStepper;
