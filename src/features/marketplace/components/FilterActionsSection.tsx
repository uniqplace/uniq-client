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
      className="rounded-full border-2 border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-200 font-semibold shadow-sm hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800 dark:hover:to-purple-800 hover:text-blue-700 transition-all duration-200 px-4 py-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={!hasActiveFilters}
      onClick={handleReset}
    />
  </>
);

export default FilterActionsSection;
