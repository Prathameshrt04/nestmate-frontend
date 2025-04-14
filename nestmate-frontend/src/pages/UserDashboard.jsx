import { useState, useEffect } from 'react';
import { useAuth } from '../utils/authContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api'; // Import centralized API instance
import requirementService from '../services/requirementService';
import ratingService from '../services/ratingService';
import FlatCard from '../components/FlatCard';
import ServiceCard from '../components/ServiceCard';
import MessCard from '../components/MessCard';
import RatingStars from '../components/RatingStars';
import Modal from '../components/Modal';
import { Home, User, Star, Loader2, Trash2, ToggleLeft, ToggleRight, Edit, X, Check } from 'lucide-react';

const UserDashboard = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [flats, setFlats] = useState([]);
  const [services, setServices] = useState([]);
  const [messes, setMesses] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [pendingRatings, setPendingRatings] = useState([]);
  const [givenRatings, setGivenRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [currentRating, setCurrentRating] = useState({ type: '', targetId: '', stars: 0, comment: '', id: '' });
  const [activeSection, setActiveSection] = useState('listings');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      logout();
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user's flats
        const flatsResponse = await api.get('/flats/user');
        setFlats(Array.isArray(flatsResponse.data) ? flatsResponse.data : []);

        // Fetch user's services
        const servicesResponse = await api.get('/services');
        setServices(
          Array.isArray(servicesResponse.data)
            ? servicesResponse.data.filter(
                (s) => s.providerId === user.id || (s.providerId && s.providerId._id === user.id)
              )
            : []
        );

        // Fetch user's messes
        const messesResponse = await api.get('/messes');
        setMesses(
          Array.isArray(messesResponse.data)
            ? messesResponse.data.filter(
                (m) => m.providerId === user.id || (m.providerId && m.providerId._id === user.id)
              )
            : []
        );

        // Fetch user's requirements (already using service)
        const requirementsData = await requirementService.getUserRequirements();
        setRequirements(Array.isArray(requirementsData) ? requirementsData : []);

        // Fetch pending ratings
        const pendingResponse = await api.get('/ratings/pending');
        setPendingRatings(Array.isArray(pendingResponse.data) ? pendingResponse.data : []);

        // Fetch given ratings (already using service)
        const given = await ratingService.getRatings('user', user.id);
        setGivenRatings(Array.isArray(given) ? given : []);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while fetching data');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, logout, navigate, user]);

  const openRatingModal = (type, targetId, existingRating = {}) => {
    setCurrentRating({
      type,
      targetId,
      stars: existingRating.rating || 0,
      comment: existingRating.comment || '',
      id: existingRating._id || '',
    });
    setIsRatingModalOpen(true);
  };

  const handleDeleteRequirement = async (id) => {
    if (window.confirm('Are you sure you want to delete this requirement?')) {
      try {
        await requirementService.deleteRequirement(id);
        setRequirements(requirements.filter((req) => req._id !== id));
        alert('Requirement deleted successfully!');
      } catch (error) {
        alert(`Failed to delete requirement: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleToggleFulfilled = async (id, currentStatus) => {
    try {
      const updatedRequirement = await requirementService.updateRequirement(id, { fulfilled: !currentStatus });
      setRequirements(requirements.map((req) => (req._id === id ? updatedRequirement : req)));
      alert(`Requirement marked as ${!currentStatus ? 'fulfilled' : 'not fulfilled'}!`);
    } catch (error) {
      alert(`Failed to update requirement status: ${error.message || 'Unknown error'}`);
    }
  };

  const handleRatingSubmit = async () => {
    try {
      if (currentRating.stars === 0) {
        alert('Please select a rating!');
        return;
      }
      if (currentRating.id) {
        const updatedRating = await ratingService.updateRating(currentRating.id, {
          rating: currentRating.stars,
          comment: currentRating.comment,
        });
        setGivenRatings((prev) => prev.map((r) => (r._id === currentRating.id ? updatedRating : r)));
      } else {
        const newRating = await ratingService.createRating({
          type: currentRating.type,
          targetId: currentRating.targetId,
          rating: currentRating.stars,
          comment: currentRating.comment,
        });
        setGivenRatings((prev) => [...prev, newRating]);
        setPendingRatings((prev) => prev.filter((p) => p.targetId !== currentRating.targetId));
      }
      setIsRatingModalOpen(false);
      setCurrentRating({ type: '', targetId: '', stars: 0, comment: '', id: '' });
    } catch (error) {
      alert(`Failed to submit rating: ${error.message}`);
    }
  };

  const handleIgnoreRating = async (type, targetId) => {
    const choice = window.confirm(
      'You will not be able to rate it again! Choose "OK" to rate now or "Cancel" to ignore forever.'
    );
    if (choice) {
      openRatingModal(type, targetId);
    } else {
      try {
        await api.delete(`/flats/${targetId}/contacted/${user.id}`);
        setPendingRatings((prev) => prev.filter((p) => p.targetId !== targetId));
      } catch (error) {
        alert(`Failed to ignore rating: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleDeleteRating = async (id) => {
    if (window.confirm('Are you sure? You will not be able to rate the same property again!')) {
      try {
        await ratingService.deleteRating(id);
        setGivenRatings((prev) => prev.filter((r) => r._id !== id));
      } catch (error) {
        alert(`Failed to delete rating: ${error.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <Loader2 size={24} className="animate-spin text-purple-600 mx-auto mb-2" />
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* User Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 flex items-center">
          <User size={28} className="mr-2" />
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-gray-600 mt-2 ml-9">Here's a quick overview of your activities.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveSection('listings')}
          className={`px-4 py-2 text-sm font-medium flex items-center ${
            activeSection === 'listings' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Home size={18} className="mr-2" />
          Your Listings
        </button>
        <button
          onClick={() => setActiveSection('requirements')}
          className={`px-4 py-2 text-sm font-medium flex items-center ${
            activeSection === 'requirements' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <User size={18} className="mr-2" />
          Requirements
        </button>
        <button
          onClick={() => setActiveSection('ratings')}
          className={`px-4 py-2 text-sm font-medium flex items-center ${
            activeSection === 'ratings' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Star size={18} className="mr-2" />
          Ratings
        </button>
      </div>

      {/* Listings Section */}
      {activeSection === 'listings' && (
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Home size={24} className="mr-2 text-blue-600" />
              Your Flats
            </h2>
            {flats.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {flats.map((flat) => (
                  <FlatCard key={flat._id} flat={flat} />
                ))}
              </div>
            ) : (
              <p className="text-gray-600">You have not listed any flats yet.</p>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Home size={24} className="mr-2 text-blue-600" />
              Your Services
            </h2>
            {services.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
            ) : (
              <p className="text-gray-600">You have not listed any services yet.</p>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Home size={24} className="mr-2 text-blue-600" />
              Your Messes
            </h2>
            {messes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {messes.map((mess) => (
                  <MessCard key={mess._id} mess={mess} />
                ))}
              </div>
            ) : (
              <p className="text-gray-600">You have not listed any messes yet.</p>
            )}
          </section>
        </div>
      )}

      {/* Requirements Section */}
      {activeSection === 'requirements' && (
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
            <User size={24} className="mr-2 text-purple-600" />
            Your Requirements
          </h2>
          {requirements.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {requirements.map((req) => (
                <div
                  key={req._id}
                  className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                    <h3 className="text-lg font-semibold flex items-center">
                      <User size={18} className="mr-2" />
                      {req.forWhom || 'Untitled Requirement'}
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-sm text-gray-600">Location: {req.location || 'Not specified'}</p>
                    <p className="text-sm text-gray-600">Max Rent: ₹{req.maxRent || 'Not specified'}</p>
                    <p className="text-sm text-gray-600">
                      Shifting Date: {req.shiftingDate ? new Date(req.shiftingDate).toLocaleDateString() : 'Not specified'}
                    </p>
                    <p className="text-sm text-gray-500">Description: {req.description || 'No description'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-200 flex space-x-2">
                    <button
                      onClick={() => handleDeleteRequirement(req._id)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                    >
                      <Trash2 size={18} className="mr-2" />
                      Delete
                    </button>
                    <button
                      onClick={() => handleToggleFulfilled(req._id, req.fulfilled)}
                      className={`flex-1 inline-flex items-center justify-center px-3 py-2 ${
                        req.fulfilled ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
                      } text-white font-medium rounded-lg transition-colors`}
                    >
                      {req.fulfilled ? <ToggleLeft size={18} className="mr-2" /> : <ToggleRight size={18} className="mr-2" />}
                      {req.fulfilled ? 'Open' : 'Close'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">You have not listed any requirements yet.</p>
          )}
        </section>
      )}

      {/* Ratings Section */}
      {activeSection === 'ratings' && (
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
            <Star size={24} className="mr-2 text-yellow-500" />
            Ratings
          </h2>
          {pendingRatings.length > 0 && (
            <div className="mb-6 bg-white rounded-lg shadow-md p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                <Star size={20} className="mr-2 text-yellow-500" />
                Your opinion matters to us!
              </h3>
              <ul className="space-y-4">
                {pendingRatings.map((item) => (
                  <li key={item.targetId} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{item.name}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openRatingModal(item.type, item.targetId)}
                        className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-colors"
                      >
                        <Star size={16} className="mr-2" />
                        Rate
                      </button>
                      <button
                        onClick={() => handleIgnoreRating(item.type, item.targetId)}
                        className="inline-flex items-center px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                      >
                        <X size={16} className="mr-2" />
                        Ignore
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {givenRatings.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                <Star size={20} className="mr-2 text-yellow-500" />
                Your Given Ratings
              </h3>
              <ul className="space-y-4">
                {givenRatings.map((rating) => (
                  <li key={rating._id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <div>
                      <span className="text-gray-700">
                        {rating.targetName || `${rating.type} ID: ${rating.targetId}`}
                      </span>
                      <p className="text-sm text-gray-500">{new Date(rating.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openRatingModal(rating.type, rating.targetId, rating)}
                        className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-colors"
                      >
                        <Edit size={16} className="mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRating(rating._id)}
                        className="inline-flex items-center px-3 py-1 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {pendingRatings.length === 0 && givenRatings.length === 0 && (
            <p className="text-gray-600 text-center py-4">No ratings to display yet.</p>
          )}
        </section>
      )}

      {/* Rating Modal */}
      <Modal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        title={currentRating.id ? 'Edit Rating' : 'Rate this'}
      >
        <div className="space-y-4">
          <RatingStars
            rating={currentRating.stars}
            editable={true}
            onRatingChange={(stars) => setCurrentRating((prev) => ({ ...prev, stars }))}
          />
          <textarea
            value={currentRating.comment}
            onChange={(e) => setCurrentRating((prev) => ({ ...prev, comment: e.target.value }))}
            placeholder="Write your review..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
          <button
            onClick={handleRatingSubmit}
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-colors"
          >
            <Check size={18} className="mr-2" />
            {currentRating.id ? 'Confirm Edit' : 'Submit'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UserDashboard;