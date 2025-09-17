import { useState, useEffect, useCallback } from 'react';
import debounce from '../utils/debounce';

export const useRatingData = (
  itemId: string,
  itemType: string,
  initialRating: number = 0,
  onRatingChange?: (rating: number) => void
) => {
  const [rating, setRating] = useState(initialRating);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRaters, setTotalRaters] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/rating?itemId=${encodeURIComponent(
            itemId
          )}&itemType=${encodeURIComponent(itemType)}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch initial rating data');
        }

        const data = await response.json();

        if (data.success) {
          setAverageRating(data.data.rating || 0);
          setTotalRaters(data.data.ratingCount || 0);
        } else {
          throw new Error(data.message || 'Failed to fetch initial rating data');
        }
      } catch (err) {
        setError('Failed to load initial rating data. Please try again.');
        console.error('Error fetching initial data:', err);
      }
    };

    fetchInitialData();
  }, [itemId, itemType]);

  const handleRating = useCallback(
    debounce(async (newRating: number) => {
      setRating(newRating);
      setError(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/rating/update`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              itemId,
              itemType,
              rating: newRating,
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to update rating');
        }

        const data = await response.json();

        if (data.success) {
          const updatedAverageRating = data.data.rating;
          const updatedTotalRaters = data.data.ratingCount;

          if (
            typeof updatedAverageRating === 'number' &&
            typeof updatedTotalRaters === 'number'
          ) {
            setAverageRating(updatedAverageRating);
            setTotalRaters(updatedTotalRaters);
          } else {
            throw new Error('Invalid data received from server');
          }

          if (onRatingChange) {
            onRatingChange(newRating);
          }
        } else {
          throw new Error(data.message || 'Failed to update rating');
        }
      } catch (err) {
        setError('Failed to update rating. Please try again.');
        console.error('Error during rating update:', err);
      }
    }, 300),
    [itemId, itemType, onRatingChange]
  );

  return {
    rating,
    averageRating,
    totalRaters,
    error,
    handleRating,
  };
};
