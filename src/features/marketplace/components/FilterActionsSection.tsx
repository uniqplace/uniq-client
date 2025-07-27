import React from 'react';
import { Button } from 'primereact/button';

interface Props {
  handleFilter: () => void;
  handleReset: () => void;
  hasActiveFilters: boolean;
}

const FilterActionsSection: React.FC<Props> = ({ handleFilter, handleReset, hasActiveFilters }) => (
  <>
    <Button label="Filter" icon="pi pi-filter" onClick={handleFilter} className="mb-4 p-button-outlined p-button-rounded filter-btn w-full" />
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
