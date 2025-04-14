import { Link } from 'react-router-dom';
import { Home, Utensils } from 'lucide-react'; // Import icons for mess types

const MessCard = ({ mess }) => {
  const baseUrl = import.meta.env.VITE_BASE_URL; // Access VITE_BASE_URL from .env

  const getPricingText = (mess) => {
    return mess.ratePerMonth ? `₹${mess.ratePerMonth} / month` : 'Pricing not available';
  };

  const getMessIcon = (type) => {
    switch (type) {
      case 'veg':
        return <Utensils size={24} className="text-green-600" />;
      case 'non-veg':
        return <Utensils size={24} className="text-red-600" />;
      default:
        return <Home size={24} className="text-blue-600" />;
    }
  };

  // Construct full image URL if images exist
  const imageUrl = mess.images && mess.images[0] 
    ? `${baseUrl}/uploads/${mess.images[0]}` 
    : null;

  return (
    <Link
      to={`/messes/${mess._id}`}
      className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {imageUrl ? (
        <div className="relative">
          <img
            src={imageUrl}
            alt={mess.messName}
            className="w-full h-48 object-cover"
            onError={(e) => { e.target.src = 'data:image/png;base64,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'; }}
          />
          <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md text-xs font-medium text-white">
            {mess.type || 'Mess'}
          </div>
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-100 flex flex-col items-center justify-center">
          {getMessIcon(mess.type)}
          <span className="mt-2 text-gray-500 text-sm">No Image</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center">
          {getMessIcon(mess.type)}
          <h3 className="ml-2 text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            {mess.messName || 'Unnamed Mess'}
          </h3>
        </div>
        <p className="mt-2 text-sm font-medium text-gray-800">{getPricingText(mess)}</p>
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            {mess.description
              ? (mess.description.length > 100
                ? mess.description.slice(0, 100) + '...'
                : mess.description)
              : 'No description available'}
          </p>
        </div>
        <div className="mt-3 text-right">
          <span className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800">
            View Details
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default MessCard;