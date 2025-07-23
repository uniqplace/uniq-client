import React from 'react';
import { Button } from 'primereact/button';
import { useDispatch, useSelector } from 'react-redux';
import { goToNextStep, goToPrevStep } from '../../slices/stepperSlice';
import { steps } from './steps';
import type { RootState } from '../../../../store';

interface Props {
  stepperRef?: React.RefObject<any>;
  index: number;
}

export default function StepperNavigation({ stepperRef, index }: Props) {
  const dispatch = useDispatch();
  const stepsCount = steps.length;
  const { loading } = useSelector((state: RootState) => state.stepper);

  const handleNext = () => {
    dispatch(goToNextStep());
    stepperRef?.current?.nextCallback?.();
  };

  const handleBack = () => {
    dispatch(goToPrevStep());
    stepperRef?.current?.prevCallback?.();
  };

  return (
    <div className="flex pt-4 justify-content-between">
      {index > 0 && (
        <Button
          label="Back"
          severity="secondary"
          icon="pi pi-arrow-left"
          onClick={handleBack}
          disabled={loading}
        />
      )}
      {index < stepsCount - 1 && (
        <Button
          label="Next"
          icon="pi pi-arrow-right"
          iconPos="right"
          onClick={handleNext}
          disabled={loading}
        />
      )}
    </div>
  );
}
