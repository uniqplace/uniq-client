import React from 'react';
import { Rating } from 'primereact/rating';

type RatingFilterProps = {
    rating: number | null;
    setRating: (rating: number | null) => void;
};

const RatingFilter: React.FC<RatingFilterProps> = ({ rating, setRating }) => {
    return (
        <div className="filter-section flex flex-col items-center">
            <Rating
                value={rating ?? undefined}
                cancel={false}
                className="rating-filter"
                onChange={(e) => {                   
                    e.preventDefault();
                    if (e.value === rating) {
                        setRating(null);
                    } else {
                        setRating(e.value ?? null);
                    }
                }}
            />
        </div>
    );
};

export default RatingFilter;
