import React from 'react';
import { Button } from 'primereact/button';

interface FinishStepButtonProps {
  onClick: () => void;
}

const FinishStepButton: React.FC<FinishStepButtonProps> = ({ onClick }) => (
  <Button label="Finish Step" onClick={onClick} className="p-button-success" />
);

export default FinishStepButton;
