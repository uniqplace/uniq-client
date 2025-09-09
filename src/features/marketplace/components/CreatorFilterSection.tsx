import React from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { useCreatorFilter } from '../../../hooks/useCreatorFilter';

export interface Creator {
  label: string;
  value: string;
  avatar?: string;
}

interface Props {
  creator: Creator | null;
  filteredCreators: Creator[];
  searchCreator: (event: { query: string }) => void;
  setCreator: (creator: Creator | null) => void;
}

const CreatorFilterSection: React.FC<Props> = ({ creator, filteredCreators, searchCreator, setCreator }) => {
  const {
    inputValue,
    setInputValue,
    selectedCreator,
    setSelectedCreator,
    clearCreator,
  } = useCreatorFilter(creator);

  return (
    <span id="creator-filter" className="relative p-float-label w-full" style={{ minWidth: '100%', width: '108%' }}>
      <AutoComplete
        id="creator"
        value={inputValue !== '' ? inputValue : selectedCreator}
        suggestions={filteredCreators || []}
        completeMethod={searchCreator}
        onChange={e => {
          if (typeof e.value === 'string') {
            setInputValue(e.value);
          } else {
            setInputValue('');
            setSelectedCreator(e.value);
            setCreator(e.value);
          }
        }}
        onSelect={e => {
          setSelectedCreator(e.value);
          setInputValue('');
          setCreator(e.value);
        }}
        field="label"
        itemTemplate={option => option ? (
          <div className="flex items-center gap-2">
            <Avatar
              image={option.avatar || undefined}
              label={!option.avatar && option.label ? option.label.charAt(0).toUpperCase() : undefined}
              shape="circle"
              className="w-6 h-6 rounded-full object-cover cursor-pointer transition-all duration-300"
              style={{
                backgroundColor: !option.avatar ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined,
                color: '#fff'
              }}
            />
            <span>{option.label}</span>
          </div>
        ) : null}
        dropdown
        forceSelection
        placeholder="Select Creator"
        className="w-full"
      />
      {(inputValue !== '' || selectedCreator) && (
        <span title="Clear search">
          <Button
            type="button"
            icon="pi pi-times"
            className="p-button-text p-button-sm absolute"
            style={{
              right: 44,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              padding: 0,
              minWidth: 0,
              width: 24,
              height: 24,
              zIndex: 10,
            }}
            onClick={() => {
              clearCreator();
              setCreator(null);
            }}
            aria-label="Clear search"
          />
        </span>
      )}
    </span>
  );
};


export default CreatorFilterSection;
