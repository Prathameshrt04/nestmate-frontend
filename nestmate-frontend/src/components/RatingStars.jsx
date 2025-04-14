import { useState } from 'react';

const RatingStars = ({ rating: initialRating = 0, maxRating = 5, onRatingChange, editable = false }) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (newRating) => {
    if (!editable) return;
    setRating(newRating);
    if (onRatingChange) onRatingChange(newRating);
  };

  return (
    <div className="flex items-center space-x-1">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= (hoverRating || rating);
        return (
          <svg
            key={index}
            className={`w-6 h-6 cursor-pointer transition-transform duration-200 ${
              isFilled ? 'text-yellow-400 scale-110' : 'text-gray-300'
            } ${editable ? 'hover:scale-125' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => editable && setHoverRating(starValue)}
            onMouseLeave={() => editable && setHoverRating(0)}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}
      {rating > 0 && <span className="ml-2 text-sm text-gray-600">({rating})</span>}
    </div>
  );
};

export default RatingStars;