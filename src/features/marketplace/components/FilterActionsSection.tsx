import React from 'react';
import { Button } from 'primereact/button';

interface Props {
  handleReset: () => void;
  hasActiveFilters: boolean;
}

const FilterActionsSection: React.FC<Props> = ({ handleReset, hasActiveFilters }) => (
  <>
    <Button
      label="Reset"
      icon="pi pi-refresh"
      className="mb-2 p-button-text p-button-sm w-full"
      disabled={!hasActiveFilters}
      onClick={handleReset}
    />
  </>
);

export default FilterActionsSection;
