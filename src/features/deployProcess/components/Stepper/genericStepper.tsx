// import React, { useEffect, useCallback, useState, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { Steps } from 'primereact/steps';
// import { Button } from 'primereact/button';
// import { Dialog } from 'primereact/dialog';
// import { useAppDispatch, useAppSelector } from '../../../../hooks/hooks';
// import {
//   goToPrevStep,
//   goToNextStep,
//   markStepCompleted,
//   updateProductStep,
//   setCurrentStepIndex,
//   restoreStepperState,
// } from '../../slices/stepperSlice';
// import { stepsConfig, productFormRef } from './steps'; // ייבוא ה-ref מהקובץ של השלבים
// import useInitProduct from '../../../../hooks/useInitProduct';
// import { ProgressSpinner } from 'primereact/progressspinner';
// import '../../../../styles/genericStepper.css';

// const GenericStepper: React.FC = () => {
//   console.log('StepsConfig:', stepsConfig.map(s => s.key));

//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();
//   const { stepKey } = useParams<{ stepKey: string }>();

//   // Get stepper state from Redux
//   const { currentStepIndex, completedSteps, product, loading, error } = useAppSelector(
//     (state) => state.stepper
//   );

//   // Restore stepper state (completed steps + current step) from localStorage on mount
//   useEffect(() => {
//     dispatch(restoreStepperState());
//   }, [dispatch]);

//   // On mount or when product changes, update completedSteps and currentStepIndex from server status if needed
//   // ...existing code...
//   // Auto-navigate to last completed step only on initial mount or when product._id changes
//   useEffect(() => {
//     if (!product || !product.CreationStatus) return;
//     // Debug: print CreationStatus and all step titles
//     console.log('[Stepper] CreationStatus from server:', product.CreationStatus);
//     console.log('[Stepper] stepsConfig titles:', stepsConfig.map(s => s.title));
//     const idx = stepsConfig.findIndex(s => s.title === product.CreationStatus);
//     console.log('[Stepper] Index found for CreationStatus:', idx);
//     if (idx >= 0) {
//       // Mark all steps up to and including idx as completed
//       const completedArr = stepsConfig.map((_, i) => i <= idx);
//       dispatch({ type: 'stepper/setCompletedSteps', payload: completedArr });
//       dispatch(setCurrentStepIndex(idx));
//       // Only auto-navigate if this is the first load or product._id changed
//       if (stepKey !== stepsConfig[idx].key) {
//         console.log('[Stepper] Auto-navigating to correct step:', stepsConfig[idx].key);
//         navigate(`/create-your-own-product/${stepsConfig[idx].key}`, { replace: true });
//       }
//     } else {
//       console.warn('[Stepper] No matching step title found for CreationStatus:', product.CreationStatus);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [product?._id]);

//   // ...existing code...

//   const [showFinalPopup, setShowFinalPopup] = useState(false);

//   // קריאה ל-hook שאחראי על יצירת מוצר וטעינת סטטוס
//   useInitProduct();

//   // Debug: Log state on every render
//   useEffect(() => {
//     console.log('[Stepper] Render', {
//       stepKey,
//       currentStepIndex,
//       completedSteps,
//       product,
//       loading,
//       error,
//     });
//   });

//   useEffect(() => {
//     if (!stepKey || loading) return;
//     const index = stepsConfig.findIndex((s) => s.key === stepKey);
//     if (index !== -1) {
//       dispatch(setCurrentStepIndex(index));
//     }
//   }, [dispatch, stepKey, loading]);

//   useEffect(() => {
//     console.log('[Stepper] useEffect currentStepIndex', { currentStepIndex, product });
//     if (currentStepIndex === null) return;

//     const productId = localStorage.getItem('productId');
//     if (!productId || !product) {
//       console.log('[Stepper] No productId or product, skipping updateProductStep');
//       return;
//     }

//     const serverStepIndex = stepsConfig.findIndex(
//       (s) => s.title === product.CreationStatus
//     );
//     console.log('[Stepper] serverStepIndex:', serverStepIndex);

//     if (currentStepIndex > serverStepIndex) {
//       console.log('[Stepper] Advancing product step on server', {
//         productId,
//         from: serverStepIndex,
//         to: currentStepIndex,
//       });
//       dispatch(updateProductStep({
//         productId,
//         stepNumber: currentStepIndex + 1
//       }));
//     } else {
//       console.log('[Stepper] No need to update server step');
//     }
//   }, [currentStepIndex, dispatch, product]);

//   const CurrentStepComponent = currentStepIndex !== null ? stepsConfig[currentStepIndex]?.component : null;
//   const handleCompleteStep = useCallback(async () => {
//     console.log('✅ handleCompleteStep called', { currentStepIndex });
//     if (currentStepIndex === null) {
//       console.warn('[Stepper] handleCompleteStep: currentStepIndex is null');
//       return;
//     }

//     const validateStepFn = stepsConfig[currentStepIndex]?.validateStep;
//     console.log('[Stepper] CurrentStepIndex before validation:', currentStepIndex);
//     if (validateStepFn) {
//       try {
//         const valid = await validateStepFn();
//         console.log('[Stepper] Validation result:', valid);
//         if (!valid) {
//           console.warn('[Stepper] Validation failed, not advancing');
//           return;
//         }
//       } catch (err) {
//         console.error('[Stepper] Validation threw error:', err);
//         return;
//       }
//     }

//     // DEMO/REAL: צור מוצר אמיתי ב-DB בשלב הראשון
//     let productId: string | undefined = product?._id;
//     if (currentStepIndex === 0) {
//       // אם כבר יש productId ב-localStorage, השתמש בו
//       const storedId = localStorage.getItem('productId');
//       if (storedId) {
//         productId = storedId;
//       } else {
//         // קריאה ל-API ליצירת מוצר אמיתי
//         try {
//           const res = await fetch('http://localhost:5002/api/create-product', {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             credentials: 'include', // שלח קוקיז (כולל טוקן) לשרת
//             body: JSON.stringify({
//               title: 'Demo Product',
//               // אפשר להוסיף כאן שדות נוספים בעתיד
//             }),
//           });
//           if (!res.ok) {
//             throw new Error('Failed to create product');
//           }
//           const data = await res.json();
//           productId = data._id;
//           if (typeof productId === 'string') {
//             localStorage.setItem('productId', productId);
//           } else {
//             console.error('[Stepper] Invalid productId from API:', productId);
//             return;
//           }
//         } catch (err) {
//           console.error('[Stepper] Failed to create product:', err);
//           return;
//         }
//       }
//     } else {
//       const storedId = localStorage.getItem('productId');
//       productId = storedId !== null ? storedId : undefined;
//       if (!productId) {
//         console.warn('[Stepper] No productId in localStorage, cannot complete step');
//         return;
//       }
//     }

//     console.log('[Stepper] Completing step', { currentStepIndex, productId });

//     if (!productId) {
//       console.error('[Stepper] No productId, cannot complete step');
//       return;
//     }
//     dispatch(markStepCompleted(currentStepIndex));
//     dispatch(updateProductStep({ productId, stepNumber: currentStepIndex + 1 }));

//     if (currentStepIndex === stepsConfig.length - 1) {
//       setShowFinalPopup(true);
//       console.log('[Stepper] Last step reached, showing final popup');
//     } else {
//       const nextKey = stepsConfig[currentStepIndex + 1]?.key;
//       console.log('[Stepper] nextKey:', nextKey);
//       if (nextKey) {
//         console.log('[Stepper] Navigating to next step:', nextKey);
//         navigate(`/create-your-own-product/${nextKey}`);
//         // אל תקרא ל-goToNextStep(), הuseEffect של stepKey יעשה את זה
//       } else {
//         console.warn('[Stepper] No nextKey found, not navigating');
//       }
//     }
//   }, [currentStepIndex, dispatch, navigate, product?._id]);


//   // Go back without updating server or completedSteps (do not regress status)
//   const handleBack = () => {
//     if (currentStepIndex !== null && currentStepIndex > 0) {
//       const prevKey = stepsConfig[currentStepIndex - 1]?.key;
//       if (prevKey) {
//         navigate(`/create-your-own-product/${prevKey}`);
//         // לא לעדכן currentStepIndex ב-Redux, רק ניווט ב-URL
//       }
//     }
//   };

//   // Always use completedSteps from Redux (restored from localStorage) for V icons
//   const stepsModel = stepsConfig.map((step, index) => ({
//     label: step.title,
//     icon: completedSteps && completedSteps[index] ? 'pi pi-check' : undefined,
//   }));

//   const isStepCompleted = currentStepIndex !== null ? completedSteps[currentStepIndex] : false;

//   if (loading || currentStepIndex === null) {
//     return <ProgressSpinner />;
//   }

//   const stepProps = {
//     product,
//     onComplete: handleCompleteStep,
//     ...(CurrentStepComponent === stepsConfig[0].component ? { ref: productFormRef } : {}), // אם זה השלב הראשון, מעבירים ref
//   };

//   return (
//     <div className="card max-w-5xl mx-auto p-6 shadow-lg rounded-xl bg-white">
//       <h2 className="text-2xl font-semibold text-center mb-6">
//         Create Your Own Product
//       </h2>

//       <Steps
//         model={stepsModel}
//         activeIndex={currentStepIndex}
//         readOnly
//         className="custom-steps mb-6"
//       />

//       {error ? (
//         <div className="text-center text-red-500 mb-4">{error}</div>
//       ) : (
//         <div
//           className="step-content text-center p-4 border rounded-lg bg-gray-50"
//           style={{
//             opacity: isStepCompleted ? 0.5 : 1,
//             pointerEvents: isStepCompleted ? 'none' : 'auto',
//           }}
//         >
//           {CurrentStepComponent && React.createElement(CurrentStepComponent, stepProps)}
//         </div>
//       )}

//       <div className="flex justify-between mt-6">
//         <Button
//           label="Back"
//           onClick={handleBack}
//           disabled={currentStepIndex === 0 || currentStepIndex === null}
//           className="p-button-secondary"
//         />
//         <Button
//           label={currentStepIndex === stepsConfig.length - 1 ? 'Finish' : 'Next'}
//           onClick={handleCompleteStep} 
//           disabled={false} // אפשר לשפר לוגיקה כאן אם תרצי לחסום לפי מצב כלשהו
//           className="p-button-primary"
//         />
//       </div>

//       <Dialog
//         header="Product Completed!"
//         visible={showFinalPopup}
//         style={{ width: '350px' }}
//         onHide={() => setShowFinalPopup(false)}
//       >
//         <div className="text-center">
//           <p>Your product is completed and is on its way to you!</p>
//           <Button
//             label="Close"
//             onClick={() => setShowFinalPopup(false)}
//             className="p-button-success mt-3"
//           />
//         </div>
//       </Dialog>
//     </div>
//   );
// };

// export default GenericStepper;



import React, { useEffect, useCallback, useState, useRef } from 'react';
import { getUserProductKey } from '../../../../utils/productStorageKey';
import { useParams, useNavigate } from 'react-router-dom';
import { Steps } from 'primereact/steps';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { useAppDispatch, useAppSelector } from '../../../../hooks/hooks';
import {
  // goToPrevStep,
  // goToNextStep,
  markStepCompleted,
  updateProductStep,
  setCurrentStepIndex,
  restoreStepperState,
} from '../../slices/stepperSlice';
import { stepsConfig, productFormRef } from './steps'; // ייבוא ה-ref מהקובץ של השלבים
import useInitProduct from '../../../../hooks/useInitProduct';
import { ProgressSpinner } from 'primereact/progressspinner';
import '../../../../styles/genericStepper.css';

const GenericStepper: React.FC = () => {
  console.log('StepsConfig:', stepsConfig.map(s => s.key));

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { stepKey } = useParams<{ stepKey: string }>();

  // Get stepper state from Redux
  const { currentStepIndex, completedSteps, product, loading, error } = useAppSelector(
    (state) => state.stepper
  );
  const userId = useAppSelector((state) => state.user?.id);

  // Restore stepper state (completed steps + current step) from localStorage on mount
  useEffect(() => {
    dispatch(restoreStepperState());
  }, [dispatch]);

  // On mount or when product changes, update completedSteps and currentStepIndex from server status if needed
  // ...existing code...
  // Auto-navigate to last completed step only on initial mount or when product._id changes
  useEffect(() => {
    if (!product || !product.CreationStatus) return;
    // Debug: print CreationStatus and all step titles
    console.log('[Stepper] CreationStatus from server:', product.CreationStatus);
    console.log('[Stepper] stepsConfig titles:', stepsConfig.map(s => s.title));
    const idx = stepsConfig.findIndex(s => s.title === product.CreationStatus);
    console.log('[Stepper] Index found for CreationStatus:', idx);
    if (idx >= 0) {
      // Mark all steps BEFORE idx as completed (not including current step)
      const completedArr = stepsConfig.map((_, i) => i < idx);
      dispatch({ type: 'stepper/setCompletedSteps', payload: completedArr });
      dispatch(setCurrentStepIndex(idx));
      // Only auto-navigate if this is the first load or product._id changed
      if (stepKey !== stepsConfig[idx].key) {
        console.log('[Stepper] Auto-navigating to correct step:', stepsConfig[idx].key);
        navigate(`/create-your-own-product/${stepsConfig[idx].key}`, { replace: true });
      }
    } else {
      console.warn('[Stepper] No matching step title found for CreationStatus:', product.CreationStatus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id]);

  // ...existing code...

  const [showFinalPopup, setShowFinalPopup] = useState(false);

  // קריאה ל-hook שאחראי על יצירת מוצר וטעינת סטטוס
  useInitProduct();

  // Debug: Log state on every render
  useEffect(() => {
    console.log('[Stepper] Render', {
      stepKey,
      currentStepIndex,
      completedSteps,
      product,
      loading,
      error,
    });
  });

  useEffect(() => {
    if (!stepKey || loading) return;
    const index = stepsConfig.findIndex((s) => s.key === stepKey);
    if (index !== -1) {
      dispatch(setCurrentStepIndex(index));
    }
  }, [dispatch, stepKey, loading]);

  useEffect(() => {
    console.log('[Stepper] useEffect currentStepIndex', { currentStepIndex, product });
    if (currentStepIndex === null) return;

    const key = getUserProductKey(userId);
    const productId = localStorage.getItem(key);
    if (!productId || !product) {
      console.log('[Stepper] No productId or product, skipping updateProductStep');
      return;
    }

    const serverStepIndex = stepsConfig.findIndex(
      (s) => s.title === product.CreationStatus
    );
    console.log('[Stepper] serverStepIndex:', serverStepIndex);

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
      console.log('[Stepper] No need to update server step');
    }
  }, [currentStepIndex, dispatch, product]);

  const CurrentStepComponent = currentStepIndex !== null ? stepsConfig[currentStepIndex]?.component : null;
  const handleCompleteStep = useCallback(async () => {
    console.log('✅ handleCompleteStep called', { currentStepIndex });
    if (currentStepIndex === null) {
      console.warn('[Stepper] handleCompleteStep: currentStepIndex is null');
      return;
    }

    const validateStepFn = stepsConfig[currentStepIndex]?.validateStep;
    console.log('[Stepper] CurrentStepIndex before validation:', currentStepIndex);
    if (validateStepFn) {
      try {
        const valid = await validateStepFn();
        console.log('[Stepper] Validation result:', valid);
        if (!valid) {
          console.warn('[Stepper] Validation failed, not advancing');
          return;
        }
      } catch (err) {
        console.error('[Stepper] Validation threw error:', err);
        return;
      }
    }

    // DEMO/REAL: צור מוצר אמיתי ב-DB בשלב הראשון
    let productId: string | undefined = product?._id;
    const key = getUserProductKey(userId);
    // if (currentStepIndex === 0) {
    //   // אם כבר יש productId ב-localStorage, השתמש בו
    //   const storedId = localStorage.getItem(key);
    //   if (storedId) {
    //     productId = storedId;
    //   } else {
    //     // קריאה ל-API ליצירת מוצר אמיתי
    //     try {
    //       const res = await fetch('http://localhost:5002/api/create-product', {
    //         method: 'POST',
    //         headers: {
    //           'Content-Type': 'application/json',
    //         },
    //         credentials: 'include', // שלח קוקיז (כולל טוקן) לשרת
    //         body: JSON.stringify({
    //           title: 'Demo Product',
    //           // אפשר להוסיף כאן שדות נוספים בעתיד
    //         }),
    //       });
    //       if (!res.ok) {
    //         throw new Error('Failed to create product');
    //       }
    //       const data = await res.json();
    //       productId = data._id;
    //       if (typeof productId === 'string') {
    //         localStorage.setItem(key, productId);
    //       } else {
    //         console.error('[Stepper] Invalid productId from API:', productId);
    //         return;
    //       }
    //     } catch (err) {
    //       console.error('[Stepper] Failed to create product:', err);
    //       return;
    //     }
    //   }
    // } else {
      const storedId = localStorage.getItem(key);
      productId = storedId !== null ? storedId : undefined;
      if (!productId) {
        console.warn('[Stepper] No productId in localStorage, cannot complete step');
        return;
      }
    // }

    console.log('[Stepper] Completing step', { currentStepIndex, productId });

    if (!productId) {
      console.error('[Stepper] No productId, cannot complete step');
      return;
    }
    dispatch(markStepCompleted(currentStepIndex));
    dispatch(updateProductStep({ productId, stepNumber: currentStepIndex + 1 }));

    if (currentStepIndex === stepsConfig.length - 1) {
      setShowFinalPopup(true);
      console.log('[Stepper] Last step reached, showing final popup');
    } else {
      const nextKey = stepsConfig[currentStepIndex + 1]?.key;
      console.log('[Stepper] nextKey:', nextKey);
      if (nextKey) {
        console.log('[Stepper] Navigating to next step:', nextKey);
        navigate(`/create-your-own-product/${nextKey}`);
        // אל תקרא ל-goToNextStep(), הuseEffect של stepKey יעשה את זה
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
        // לא לעדכן currentStepIndex ב-Redux, רק ניווט ב-URL
      }
    }
  };

  // Always use completedSteps from Redux (restored from localStorage) for V icons
  const stepsModel = stepsConfig.map((step, index) => ({
    label: step.title,
    icon: completedSteps && completedSteps[index] ? 'pi pi-check' : undefined,
  }));

  const isStepCompleted = currentStepIndex !== null ? completedSteps[currentStepIndex] : false;

  if (loading || currentStepIndex === null) {
    return <ProgressSpinner />;
  }

  const stepProps = {
    product,
    onComplete: handleCompleteStep,
    ...(CurrentStepComponent === stepsConfig[0].component ? { ref: productFormRef } : {}), // אם זה השלב הראשון, מעבירים ref
  };

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
          {CurrentStepComponent && React.createElement(CurrentStepComponent, stepProps)}
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
          disabled={loading || !product || !product._id}
          className="p-button-primary"
        />
      </div>

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







