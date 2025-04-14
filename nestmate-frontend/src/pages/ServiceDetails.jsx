import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import serviceService from '../services/serviceService';
import contactService from '../services/contactService';
import ratingService from '../services/ratingService';
import formatUtils from '../utils/formatUtils';
import { useAuth } from '../utils/authContext';
import Modal from '../components/Modal';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { Package, MapPin, Star, Phone, Edit, Trash2, CheckCircle, X, ChevronLeft, ChevronRight, Users, Heart } from 'lucide-react';

const useSlideshow = (images, interval = 3000) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!images || !Array.isArray(images) || images.length <= 1) return;
    const slideshow = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);
    return () => clearInterval(slideshow);
  }, [images, interval]);

  return [currentImageIndex, setCurrentImageIndex];
};

const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isContactedModalOpen, setIsContactedModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [contactedUsers, setContactedUsers] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const baseUrl = import.meta.env.VITE_BASE_URL; // Access VITE_BASE_URL from .env
  const [currentImageIndex, setCurrentImageIndex] = useSlideshow(service?.images, 3000);

  const isOwner = useMemo(() => {
    return isAuthenticated && user && service && (service.providerId._id === user.id || service.providerId === user.id);
  }, [isAuthenticated, user, service]);

  const canRate = useMemo(() => {
    return !isOwner && contactedUsers.some(c => c.userId === user?.id && c.confirmed);
  }, [isOwner, contactedUsers, user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        const serviceData = await serviceService.getServiceById(id);
        setService(serviceData);
        const ratingsData = await ratingService.getRatings('service', id);
        setRatings(Array.isArray(ratingsData) ? ratingsData : []);
        if (isOwner) {
          const contacted = await serviceService.getContactedUsers(id);
          setContactedUsers(Array.isArray(contacted) ? contacted : []);
        } else {
          setContactedUsers([]);
        }
      } catch (error) {
        console.error('Fetch Error:', error);
        alert(`Failed to load service: ${error.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user?.id, isAuthenticated, isOwner]);

  const handleContact = () => {
    const phone = service?.providerId?.phone;
    if (!phone) {
      alert("Provider's phone number is not available.");
      return;
    }
    const message = encodeURIComponent(`Hi, I'm interested in your service "${service.name || service.serviceType}" on NestMate. Can we discuss further?`);
    window.open(`https://wa.me/+91${phone}?text=${message}`, '_blank');
    contactService.createContact({
      contactedId: service.providerId._id || service.providerId,
      message: `Interested in your service ${service.name || service.serviceType}`,
      type:'service',
    }).catch((error) => console.error('Contact Error:', error));
  };

  const handleConfirmContact = async (userId) => {
    try {
      await serviceService.confirmContactedUser(id, userId);
      const contacted = await serviceService.getContactedUsers(id);
      setContactedUsers(Array.isArray(contacted) ? contacted : []);
    } catch (error) {
      alert(`Failed to confirm contact: ${error.message}`);
    }
  };

  const handleRemoveContact = async (userId) => {
    if (
      window.confirm(
        `The person will not be able to rate your service "${service?.name || service?.serviceType}". This cannot be undone.`
      )
    ) {
      try {
        await serviceService.removeContactedUser(id, userId);
        const contacted = await serviceService.getContactedUsers(id);
        setContactedUsers(Array.isArray(contacted) ? contacted : []);
      } catch (error) {
        alert(`Failed to remove contact: ${error.message}`);
      }
    }
  };

  const handleSubmitRating = async () => {
    try {
      const ratingData = {
        type: 'service',
        targetId: id,
        rating,
        comment,
      };
      await ratingService.createRating(ratingData);
      alert('Rating submitted successfully!');
      setIsRatingModalOpen(false);
      setRating(0);
      setComment('');
      const updatedRatings = await ratingService.getRatings('service', id);
      setRatings(Array.isArray(updatedRatings) ? updatedRatings : []);
    } catch (error) {
      alert(`Failed to submit rating: ${error.message}`);
    }
  };

  const handleEdit = () => navigate(`/edit-service/${id}`);
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await serviceService.deleteService(id);
        alert('Service deleted!');
        navigate('/dashboard');
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const openFullScreen = () => setIsFullScreen(true);
  const closeFullScreen = () => setIsFullScreen(false);

  const navigateToPrevImage = (e) => {
    e.stopPropagation();
    if (service?.images && service.images.length > 1) {
      setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : service.images.length - 1));
    }
  };

  const navigateToNextImage = (e) => {
    e.stopPropagation();
    if (service?.images && service.images.length > 1) {
      setCurrentImageIndex((prev) => (prev < service.images.length - 1 ? prev + 1 : 0));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white rounded-lg shadow-lg p-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Service Not Found</h2>
          <p className="text-gray-600 mb-6">The service you're looking for doesn't exist or has been removed.</p>
          <Link to="/search" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg transition-colors hover:opacity-90">
            <Package size={20} className="mr-2" />
            Browse Available Services
          </Link>
        </div>
      </div>
    );
  }

  const averageRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : 'No ratings yet';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center text-sm text-gray-500">
        <Link to="/" className="hover:text-purple-600 transition-colors">Home</Link>
        <span className="mx-2">›</span>
        <Link to="/search" className="hover:text-purple-600 transition-colors">Services</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">{service.name || service.serviceType}</span>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Image Gallery */}
          <div>
            <div className="relative rounded-lg overflow-hidden bg-gray-100 shadow-md">
              {Array.isArray(service.images) && service.images.length > 0 ? (
                <>
                  <img
                    src={`${baseUrl}/uploads/${service.images[currentImageIndex]}`}
                    alt={`Service ${currentImageIndex}`}
                    className="w-full h-96 object-cover cursor-pointer transition-transform hover:scale-105 duration-300"
                    onError={(e) => (e.target.src = 'data:image/png;base64,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')}
                    onClick={openFullScreen}
                  />

                  {service.images.length > 1 && (
                    <>
                      <button
                        onClick={navigateToPrevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md text-gray-800 hover:text-purple-600 transition-colors"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={navigateToNextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md text-gray-800 hover:text-purple-600 transition-colors"
                      >
                        <ChevronRight size={24} />
                      </button>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {service.images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-96 flex items-center justify-center text-gray-500">
                  <Package size={48} className="opacity-50" />
                  <p className="ml-2">No Images Available</p>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {Array.isArray(service.images) && service.images.length > 1 && (
              <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
                {service.images.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-16 w-16 flex-shrink-0 rounded-md overflow-hidden cursor-pointer border-2 ${currentImageIndex === index ? 'border-purple-600' : 'border-transparent'}`}
                  >
                    <img
                      src={`${baseUrl}/uploads/${img}`}
                      alt={`Thumbnail ${index}`}
                      className="h-full w-full object-cover"
                      onError={(e) => (e.target.src = 'data:image/png;base64,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')}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Service Details */}
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
              {service.name || service.serviceType}
            </h1>

            <div className="flex items-center mb-4">
              <div className="flex items-center text-yellow-500 mr-2">
                <Star size={20} className="fill-current" />
                <span className="ml-1 font-bold">{averageRating}</span>
              </div>
              <span className="text-sm text-gray-600">({ratings.length} reviews)</span>
              <div className="mx-3 h-5 border-l border-gray-300"></div>
              <div className="flex items-center text-gray-600">
                <MapPin size={16} className="mr-1" />
                <span className="text-sm">{service.location.city}, {service.location.locality}</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline mb-2">
                {service.serviceType === 'laundry' ? (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {formatUtils.formatCurrency(service.chargePerShirt, 'INR')}
                    </h2>
                    <span className="text-gray-600 ml-1">/shirt</span>
                  </>
                ) : service.serviceType === 'cleaning' ? (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {formatUtils.formatCurrency(service.rate, 'INR')}
                    </h2>
                    <span className="text-gray-600 ml-1">
                      {service.chargeType === 'perHour' ? '/hour' : '/BHK'}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-600">Pricing not available</span>
                )}
              </div>
              {service.serviceType === 'laundry' && service.chargePerCloth && (
                <p className="text-sm text-gray-600">
                  Other clothes: {formatUtils.formatCurrency(service.chargePerCloth, 'INR')} /cloth
                </p>
              )}
            </div>

            {/* Service Details */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-6">
              <div className="flex items-center text-gray-700">
                <span className="w-28 text-sm text-gray-500">Type:</span>
                <span className="font-medium">{service.serviceType}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <span className="w-28 text-sm text-gray-500">Available From:</span>
                <span className="font-medium">
                  {service.availabilityDate ? new Date(service.availabilityDate).toLocaleDateString() : 'Immediate'}
                </span>
              </div>
            </div>

            {/* Description */}
            {service.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{service.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              {!isOwner ? (
                <>
                  <button
                    onClick={handleContact}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg transition-colors hover:opacity-90"
                  >
                    <Phone size={18} className="mr-2" />
                    Contact Provider
                  </button>
                  {canRate && (
                    <button
                      onClick={() => setIsRatingModalOpen(true)}
                      className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg transition-colors hover:bg-gray-50"
                    >
                      <Star size={18} className="mr-2" />
                      Rate Service
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsContactedModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg transition-colors hover:opacity-90"
                  >
                    <Users size={18} className="mr-2" />
                    Contacted People
                  </button>
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg transition-colors hover:bg-gray-50"
                  >
                    <Edit size={18} className="mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg transition-colors hover:bg-gray-50"
                  >
                    <Trash2 size={18} className="mr-2" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-10 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
          <Star size={24} className="text-yellow-500 mr-2" />
          Ratings & Reviews
        </h2>

        <div className="mb-6 flex items-center">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={24}
                className={`${i < Math.round(Number(averageRating) || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="ml-4 text-2xl font-bold text-gray-900">{averageRating}</span>
          <span className="ml-2 text-sm text-gray-600">({ratings.length} reviews)</span>
        </div>

        {ratings.length > 0 ? (
          <ul className="space-y-6 divide-y divide-gray-200">
            {ratings.map((r) => (
              <li key={r._id} className="pt-6 first:pt-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{r.userId.name || 'Anonymous'}</h3>
                    <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`${i < r.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{r.comment || 'No comment provided'}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-600 mb-4">No reviews yet.</p>
            {!isOwner && (
              <button
                onClick={() => setIsRatingModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg transition-colors hover:opacity-90"
                disabled={!canRate}
              >
                <Star size={18} className="mr-2" />
                {canRate ? 'Be the first to rate' : 'Contact provider to rate'}
              </button>
            )}
          </div>
        )}
      </section>

      {/* Location Map Section */}
      {service.location.coordinates.lat && service.location.coordinates.lng && (
        <section className="mt-10 bg-white rounded-lg shadow-md p-6 relative z-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin size={24} className="text-pink-500 mr-2" />
            Location
          </h2>
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <MapContainer
              center={[service.location.coordinates.lat, service.location.coordinates.lng]}
              zoom={13}
              style={{ height: '400px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[service.location.coordinates.lat, service.location.coordinates.lng]} />
            </MapContainer>
          </div>

          <div className="mt-4 text-gray-700">
            <p>
              <span className="font-medium">Address:</span> {service.location.locality}, {service.location.city}
              {service.location.landmark && `, Near ${service.location.landmark}`}
            </p>
          </div>
        </section>
      )}

      {/* Full-Screen Image Modal */}
      {isFullScreen && Array.isArray(service.images) && service.images.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center">
            <div className="absolute top-4 right-4 z-10 flex space-x-2">
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-white text-sm">
                {currentImageIndex + 1} / {service.images.length}
              </div>
              <button
                onClick={closeFullScreen}
                className="bg-white bg-opacity-20 hover:bg-opacity-40 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            <img
              src={`${baseUrl}/uploads/${service.images[currentImageIndex]}`}
              alt={`Full Screen ${currentImageIndex}`}
              className="max-w-full max-h-[80vh] object-contain"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found'; }}
            />

            {service.images.length > 1 && (
              <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 flex justify-between px-4">
                <button
                  onClick={(e) => navigateToPrevImage(e)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-40 rounded-full w-12 h-12 flex items-center justify-center text-white transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => navigateToNextImage(e)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-40 rounded-full w-12 h-12 flex items-center justify-center text-white transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}

            {service.images.length > 1 && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 overflow-x-auto">
                {service.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${currentImageIndex === index ? 'border-purple-500 scale-110' : 'border-white border-opacity-50'}`}
                  >
                    <img
                      src={`${baseUrl}/uploads/${img}`}
                      alt={`Thumbnail ${index}`}
                      className="h-full w-full object-cover"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=Error'; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contacted Peoples Modal */}
      <Modal
        isOpen={isContactedModalOpen}
        onClose={() => setIsContactedModalOpen(false)}
        title="People Who Contacted You"
      >
        <div className="py-2">
          {contactedUsers.length > 0 ? (
            <ul className="space-y-4 max-h-96 overflow-y-auto">
              {contactedUsers.map((contact) => (
                <li key={contact.userId} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{contact.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        <time dateTime={contact.date}>
                          {new Date(contact.date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </time>
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      {!contact.confirmed ? (
                        <>
                          <button
                            onClick={() => handleConfirmContact(contact.userId)}
                            className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-md transition-colors hover:opacity-90"
                          >
                            <CheckCircle size={16} className="mr-1" />
                            Confirm
                          </button>
                          <button
                            onClick={() => handleRemoveContact(contact.userId)}
                            className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md transition-colors hover:bg-gray-50"
                          >
                            <X size={16} className="mr-1" />
                            Remove
                          </button>
                        </>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 text-sm font-medium rounded-md">
                          <CheckCircle size={16} className="mr-1" />
                          Confirmed
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10">
              <Users size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No contacts yet</h3>
              <p className="text-gray-600">
                When people contact you about this service, they'll appear here.
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Rating Modal */}
      <Modal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        title="Rate this Service"
      >
        <div className="p-2 space-y-6">
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">How was your experience?</h3>
            <div className="flex space-x-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} transition-colors`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              {rating === 1 && "Poor - Not at all as described"}
              {rating === 2 && "Fair - Below expectations"}
              {rating === 3 && "Good - As expected"}
              {rating === 4 && "Very Good - Above expectations"}
              {rating === 5 && "Excellent - Highly recommended"}
            </p>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Share your experience (optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others what you liked or disliked about this service..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows="4"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsRatingModalOpen(false)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitRating}
              disabled={rating === 0}
              className={`px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg transition-colors ${rating === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
            >
              Submit Rating
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ServiceDetails;