// src/features/stepper/StepperNavigation.tsx
import React from 'react';
import { Button } from 'primereact/button';
import { useDispatch } from 'react-redux';
import { goToNextStep, goToPrevStep } from '../../slices/stepperSlice';
import { steps } from './steps';

interface Props {
  stepperRef: React.RefObject<any>;
  index: number;
}

export default function StepperNavigation({ stepperRef, index }: Props) {
  const dispatch = useDispatch();
const stepsCount = steps.length;

  const handleNext = () => {
    dispatch(goToNextStep());
    stepperRef.current?.nextCallback();
  };

  const handleBack = () => {
    dispatch(goToPrevStep());
    stepperRef.current?.prevCallback();
  };

  return (
    <div className="flex pt-4 justify-content-between">
      {index > 0 && (
        <Button
          label="Back"
          severity="secondary"
          icon="pi pi-arrow-left"
          onClick={handleBack}
        />
      )}
      {index < stepsCount - 1 && (
        <Button
          label="Next"
          icon="pi pi-arrow-right"
          iconPos="right"
          onClick={handleNext}
        />
      )}
    </div>
  );
}
