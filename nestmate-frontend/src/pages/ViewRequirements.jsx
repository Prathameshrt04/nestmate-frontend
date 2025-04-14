import { useState, useEffect } from 'react';
import api from '../services/api'; // Import centralized API instance
import { Home, MapPin, DollarSign, Calendar, MessageSquare, User, Loader2 } from 'lucide-react';

const ViewRequirements = () => {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequirements = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/requirements/all');
        setRequirements(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while fetching requirements');
        console.error('Error fetching requirements:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequirements();
  }, []);

  const handleContact = (phone, requirement) => {
    const message = `Hi, I have seen your requirement: ${requirement.forWhom} at ${requirement.location}, max rent ${requirement.maxRent}, shifting date ${new Date(requirement.shiftingDate).toLocaleDateString()}. ${requirement.description}`;
    const whatsappUrl = `https://wa.me/+91${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <Loader2 size={24} className="animate-spin text-purple-600 mx-auto mb-2" />
        <p className="text-gray-600">Loading requirements...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6 flex items-center">
        <Home size={28} className="mr-2" />
        Listed Requirements
      </h1>
      {requirements.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {requirements.map((req) => (
            <div
              key={req._id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                <h3 className="text-lg font-semibold flex items-center">
                  <Home size={18} className="mr-2" />
                  {req.forWhom || 'Untitled Requirement'}
                </h3>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <p className="text-sm text-gray-700 flex items-center">
                  <MapPin size={16} className="mr-2 text-pink-500" />
                  <span className="font-medium">Location:</span> {req.location || 'Not specified'}
                </p>
                <p className="text-sm text-gray-700 flex items-center">
                  <DollarSign size={16} className="mr-2 text-green-600" />
                  <span className="font-medium">Max Rent:</span> ₹{req.maxRent || 'Not specified'}
                </p>
                <p className="text-sm text-gray-700 flex items-center">
                  <Calendar size={16} className="mr-2 text-blue-600" />
                  <span className="font-medium">Shifting Date:</span>
                  {req.shiftingDate ? new Date(req.shiftingDate).toLocaleDateString() : 'Not specified'}
                </p>
                <p className="text-sm text-gray-600 flex items-start">
                  <MessageSquare size={16} className="mr-2 text-purple-600 mt-1" />
                  <span>
                    <span className="font-medium">Description:</span> {req.description || 'No description'}
                  </span>
                </p>
                <p className="text-sm text-gray-500 flex items-center">
                  <User size={16} className="mr-2 text-gray-500" />
                  <span className="font-medium">Posted by:</span> {req.userId?.name || 'Unknown'}
                </p>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => handleContact(req.userId?.phone, req)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-colors"
                >
                  <MessageSquare size={18} className="mr-2" />
                  Contact via WhatsApp
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-600">
          <p>No requirements listed yet.</p>
        </div>
      )}
    </div>
  );
};

export default ViewRequirements;