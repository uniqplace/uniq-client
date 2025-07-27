import React from 'react';
import { Button } from 'primereact/button';

interface finishStepButtonProps {
  onClick: () => void;
}

const finishStepButton: React.FC<finishStepButtonProps> = ({ onClick }) => (
  <Button label="Finish Step" onClick={onClick} className="p-button-success" />
);

export default finishStepButton;
