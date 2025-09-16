import React, { useState, useEffect, useCallback } from 'react';
import { Rating } from 'primereact/rating';
import { Tag } from 'primereact/tag';

// Custom debounce function
function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

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

  const handleRating = useCallback(
    debounce(async (newRating: number) => {
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
    }, 300),
    [itemId, itemType, onRatingChange]
  );

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900 flex items-center">
          <i className="pi pi-star mr-2 text-yellow-500"></i>
          Rating
        </h4>
        <div className="flex space-x-2">
          <Tag
            value={`Rating: ${(averageRating || 0).toFixed(1)}`}
            className="text-xs font-medium text-blue-900 bg-blue-100 border border-blue-300 rounded-full shadow-sm px-3 py-1 hover:bg-blue-200 hover:shadow-md hover:scale-105 transition-all"
          />
          <Tag
            value={`${totalRaters || 0} Reviews`}
            className="text-xs font-medium text-green-900 bg-green-100 border border-green-300 rounded-full shadow-sm px-3 py-1 hover:bg-green-200 hover:shadow-md hover:scale-105 transition-all"
          />
        </div>
      </div>
      <div className='text-xs font-medium text-gray-900 text-center mb-2 flex items-center justify-center'>
        <i className="pi pi-pencil mr-2 text-gray-600"></i>
        Your Rating
      </div>
      <div className="flex justify-center">
        <Rating
          value={rating}
          cancel={false}
          onChange={(e) => handleRating(e.value || 0)}
          className="text-sm"
        />
      </div>
      {error && (
        <p className="text-red-600 mt-2 text-xs font-medium text-center">
          {error}
        </p>
      )}
    </div>
  );
};

export default RatingComponent;
