import React from 'react';
import { AutoComplete } from 'primereact/autocomplete';

interface Creator {
  label: string;
  value: string;
  avatar?: string;
}

interface Props {
  creator: Creator | null;
  searchValue: string | null;
  filteredCreators: Creator[];
  searchCreator: (event: { query: string }) => void;
  setCreator: (creator: Creator | null) => void;
  setSearchValue: (value: string | null) => void;
}

const CreatorFilterSection: React.FC<Props> = ({ creator, searchValue, filteredCreators, searchCreator, setCreator, setSearchValue }) => (
  <span className="p-float-label w-full">
    <AutoComplete
      id="creator"
      value={searchValue !== null ? searchValue : (creator ? creator.label : '')}
      suggestions={filteredCreators || []}
      completeMethod={searchCreator}
      onChange={e => {
        setCreator(e.value);
        setTimeout(() => setSearchValue(null), 0);
      }}
      onFocus={() => setSearchValue('')}
      onBlur={() => setSearchValue(null)}
      field="label"
      itemTemplate={option => option ? (
        <div className="flex items-center gap-2">
          {option.avatar && (
            <img src={option.avatar} alt={option.label} className="w-6 h-6 rounded-full object-cover" />
          )}
          <span>{option.label}</span>
        </div>
      ) : null}
      dropdown
      forceSelection
      placeholder="Select Creator"
      className="w-full"
    />
    <label htmlFor="creator">Creator</label>
  </span>
);

export default CreatorFilterSection;
