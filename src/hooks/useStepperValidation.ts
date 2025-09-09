import React from 'react';

export interface Step {
  key: string;
  title: string;
  component: React.ComponentType<any>;
  validateStep?: () => Promise<boolean> | boolean;
}

interface StepperValidationResult {
  isValid: boolean;
  error: string | null;
}

function useStepperValidation(steps?: Step[]): StepperValidationResult {
  if (!steps || !Array.isArray(steps) || steps.length === 0) {
    return {
      isValid: false,
      error: 'Stepper configuration error: steps prop is missing or empty.',
    };
  }
  return { isValid: true, error: null };
}

export default useStepperValidation;