import { Link } from 'react-router-dom';
import { Building } from 'lucide-react';

const FlatCard = ({ flat }) => {
  const isOccupied = flat.status === 'rented';
  const baseUrl = import.meta.env.VITE_BASE_URL; 

  const imageUrl = flat.images && flat.images[0] 
    ? `${baseUrl}/uploads/${flat.images[0]}` 
    : null;

  return (
    <Link
      to={`/flats/${flat._id}`}
      className={`block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 ${isOccupied ? 'opacity-50 filter grayscale' : ''}`}
    >
      {imageUrl ? (
        <div className="relative">
          <img
            src={imageUrl}
            alt={flat.apartmentName}
            className="w-full h-48 object-cover"
            onError={(e) => { e.target.src = 'data:image/png;base64,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'; }}
          />
          <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-white bg-opacity-80 rounded-md text-xs font-medium text-gray-700">
            {flat.status === 'available' ? 
              <span className="text-green-600">Available</span> : 
              <span className="text-red-600">Rented</span>
            }
          </div>
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
          <Building size={36} className="text-gray-400" />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          {flat.apartmentName} - {flat.bhkType}
        </h3>
        <p className="mt-1 text-sm font-medium text-gray-800">
          ₹{flat.rentPrice} / month
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            {flat.furnishing}
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
            {flat.location.locality}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {flat.location.city}, {flat.location.locality}
        </p>
        {flat.distance !== undefined && (
          <p className="mt-1 text-sm text-gray-600 flex items-center">
            <span className="text-blue-600 font-medium">{(flat.distance * 1000).toFixed(0)} meters</span> from center
          </p>
        )}
      </div>
    </Link>
  );
};

export default FlatCard;