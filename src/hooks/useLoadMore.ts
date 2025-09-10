import { useCallback } from 'react';

/**
 * Hook for handling "Load more" logic for paginated lists.
 * @param hasMore Indicates if there are more pages to load
 * @param loading Indicates if a loading operation is in progress
 * @param loadMore Function to load the next page
 * @returns handleLoadMore - function to call from the component
 */
export function useLoadMore(hasMore: boolean, loading: boolean, loadMore: () => void) {
  // Prevents duplicate loads or loading when there are no more pages
  const handleLoadMore = useCallback(() => {
    if (!hasMore || loading) return;
    loadMore();
  }, [hasMore, loading, loadMore]);

  return { handleLoadMore };
}
