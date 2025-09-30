import React from 'react';
import { useSelector } from 'react-redux';
import { Rating } from 'primereact/rating';
import { Tag } from 'primereact/tag';
import { useRatingData } from '../../hooks/useRatingData';

type RatingComponentProps = {
  itemId: string;
  itemType: string;
  initialRating?: number;
  onRatingChange?: (rating: number) => void;
  ownerId?: string;
};

const RatingComponent: React.FC<RatingComponentProps> = ({
  itemId,
  itemType,
  initialRating = 0,
  onRatingChange,
  ownerId,
}) => {
  const user = useSelector((state: any) => state.user);
  const isSelf = ownerId && user?.id && ownerId === user.id;
  const {
    rating,
    averageRating,
    totalRaters,
    error,
    handleRating,
  } = useRatingData(itemId, itemType, initialRating, onRatingChange);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 shadow-md">
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
        {isSelf ? (
          <span className="text-gray-400 text-xs italic">You cannot rate yourself</span>
        ) : (
          <Rating
            value={rating}
            cancel={false}
            onChange={(e) => handleRating(e.value || 0)}
            className="text-sm"
          />
        )}
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
