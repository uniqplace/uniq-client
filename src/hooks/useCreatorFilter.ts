import { useState } from 'react';
import type { Creator } from '../features/marketplace/components/CreatorFilterSection';

export function useCreatorFilter(initialCreator: Creator | null) {
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(initialCreator);

  const clearCreator = () => {
    setSelectedCreator(null);
    setInputValue('');
  };

  return {
    inputValue,
    setInputValue,
    selectedCreator,
    setSelectedCreator,
    clearCreator,
  };
}
