import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

interface FilterFieldsProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedStatus: string | null;
  setSelectedStatus: (value: string | null) => void;
  statusOptions: { label: string; value: string }[];
}

const BidRequestsFilterFields: React.FC<FilterFieldsProps> = ({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  statusOptions,
}) => {
  return (
    <div className="flex flex-wrap gap-4 mb-4 border p-4 rounded-md bg-white">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by product name"
        />
      </span>

      <Dropdown
        value={selectedStatus}
        options={statusOptions}
        onChange={(e) => setSelectedStatus(e.value ?? null)}
        placeholder="Filter by status"
        className="w-60"
        showClear
      />

      <Button
        label="Reset"
        icon="pi pi-times"
        className="p-button-secondary"
        onClick={() => {
          setSearchTerm('');
          setSelectedStatus(null);
        }}
      />
    </div>
  );
};

export default BidRequestsFilterFields;
