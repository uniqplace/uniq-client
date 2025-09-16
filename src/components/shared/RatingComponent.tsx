import React, { useState, useEffect } from 'react';
import { Rating } from 'primereact/rating';
import { Tag } from 'primereact/tag';

type RatingComponentProps = {
  itemId: string;
  itemType: string;
  initialRating?: number;
  onRatingChange?: (rating: number) => void;
};

const RatingComponent: React.FC<RatingComponentProps> = ({
  itemId,
  itemType,
  initialRating = 0,
  onRatingChange,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRaters, setTotalRaters] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/rating?itemId=${itemId}&itemType=${itemType}`
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

  const handleRating = async (newRating: number) => {
    setRating(newRating);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/rating/update`,
        {
          method: 'POST',
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
          setRating(0); // Clear the rating selection after server response
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
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Tag value={`Average: ${(averageRating || 0).toFixed(1)}`} severity="info" />
        <Tag value={`${totalRaters || 0} Ratings`} severity="success" />
      </div>
      <Rating
        value={rating}
        cancel={false}
        onChange={(e) => handleRating(e.value || 0)}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default RatingComponent;
