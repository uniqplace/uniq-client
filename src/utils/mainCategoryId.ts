import { useMemo } from 'react';

export function useMainCategoryId(selected: string[]): string {
  return useMemo(() => (selected.length > 0 ? selected[0] : ''), [selected]);
}

// For non-hook usage:
export function getMainCategoryId(selected: string[]): string {
  return selected.length > 0 ? selected[0] : '';
}
