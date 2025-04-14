import { useState, useEffect } from 'react';
import { useAuth } from '../utils/authContext';
import messService from '../services/messService'; // Assuming this exists
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Coffee, MapPin, Upload, Trash2, XCircle, CheckCircle, DollarSign, Clock, Utensils, Users } from 'lucide-react';

const AddMess = () => {
  const { isAuthenticated, logout } = useAuth();
  const [formData, setFormData] = useState({
    messName: '',
    description: '',
    ratePerMonth: '',
    ratePerPlate: '',
    type: '',
    timings: '',
    images: [],
    location: { coordinates: { lat: null, lng: null }, city: '', locality: '', landmark: '' },
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL; // Access VITE_BASE_URL from .env

  useEffect(() => {
    if (!isAuthenticated) {
      logout();
      navigate('/login');
    }
  }, [isAuthenticated, logout, navigate]);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setFormData(prev => ({
          ...prev,
          location: { ...prev.location, coordinates: { lat: e.latlng.lat, lng: e.latlng.lng } },
        }));
      },
    });
    return formData.location.coordinates.lat && formData.location.coordinates.lng ? (
      <Marker position={[formData.location.coordinates.lat, formData.location.coordinates.lng]} />
    ) : null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['city', 'locality', 'landmark'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [name]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const formDataUpload = new FormData();
    files.forEach(file => formDataUpload.append('images', file));

    try {
      const response = await messService.uploadPhotos(formDataUpload); // Use messService
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...response.imageUrls],
      }));
    } catch (error) {
      alert(`Failed to upload photos: ${error.message || 'Unknown error'}`);
    }
  };

  const handleRemovePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.messName) newErrors.messName = 'Mess name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.ratePerMonth) newErrors.ratePerMonth = 'Rate per month is required';
    if (!formData.type) newErrors.type = 'Type is required';
    if (!formData.timings) newErrors.timings = 'Timings are required';
    if (!formData.location.coordinates.lat || !formData.location.coordinates.lng)
      newErrors.coordinates = 'Location coordinates are required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const messData = {
        messName: formData.messName,
        description: formData.description,
        ratePerMonth: Number(formData.ratePerMonth),
        ratePerPlate: formData.ratePerPlate ? Number(formData.ratePerPlate) : undefined,
        type: formData.type,
        timings: formData.timings,
        location: {
          city: formData.location.city,
          locality: formData.location.locality,
          landmark: formData.location.landmark,
          coordinates: {
            lat: formData.location.coordinates.lat,
            lng: formData.location.coordinates.lng,
          },
        },
        images: formData.images,
      };
      await messService.createMess(messData); // Use messService
      alert('Mess added successfully!');
      setFormData({
        messName: '',
        description: '',
        ratePerMonth: '',
        ratePerPlate: '',
        type: '',
        timings: '',
        images: [],
        location: { coordinates: { lat: null, lng: null }, city: '', locality: '', landmark: '' },
      });
      navigate('/dashboard');
    } catch (error) {
      alert(`Failed to add mess: ${error.message || 'Unknown error'}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600 mb-4">Please log in to add a mess.</p>
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-colors"
        >
          <Users size={18} className="mr-2" />
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6 flex items-center">
        <Coffee size={28} className="mr-2" />
        Add Your Mess
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            {/* Mess Details Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <Utensils size={24} className="text-orange-600 mr-2" />
                Mess Details
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mess Name</label>
                <input
                  name="messName"
                  value={formData.messName}
                  onChange={handleChange}
                  placeholder="e.g., Home Kitchen Mess"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {errors.messName && <p className="text-red-500 text-sm mt-1">{errors.messName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (e.g., special dishes, extra rates)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="e.g., Offers North Indian cuisine, special thali on weekends..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  rows="4"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate per Month (₹)</label>
                <input
                  name="ratePerMonth"
                  type="number"
                  value={formData.ratePerMonth}
                  onChange={handleChange}
                  placeholder="e.g., 5000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {errors.ratePerMonth && <p className="text-red-500 text-sm mt-1">{errors.ratePerMonth}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate per Plate (₹, Optional)</label>
                <input
                  name="ratePerPlate"
                  type="number"
                  value={formData.ratePerPlate}
                  onChange={handleChange}
                  placeholder="e.g., 50"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Type</option>
                  <option value="veg">Veg</option>
                  <option value="nonveg">Non-Veg</option>
                  <option value="both">Both</option>
                </select>
                {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timings</label>
                <input
                  name="timings"
                  value={formData.timings}
                  onChange={handleChange}
                  placeholder="e.g., 7 AM - 10 PM"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {errors.timings && <p className="text-red-500 text-sm mt-1">{errors.timings}</p>}
              </div>
            </div>

            {/* Gallery Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <Upload size={24} className="text-blue-600 mr-2" />
                Gallery
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photos</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gradient-to-r file:from-blue-500 file:to-purple-600 file:text-white file:hover:opacity-90"
                />
              </div>
              {formData.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Photos</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {formData.images.map((filename, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden shadow-sm">
                        <img
                          src={`${baseUrl}/uploads/${filename}`}
                          alt={`Photo ${index}`}
                          className="w-full h-32 object-cover transition-transform hover:scale-105 duration-300"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found'; }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <MapPin size={24} className="text-pink-500 mr-2" />
                Location Details
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  name="city"
                  value={formData.location.city}
                  onChange={handleChange}
                  placeholder="e.g., Pune"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Locality</label>
                <input
                  name="locality"
                  value={formData.location.locality}
                  onChange={handleChange}
                  placeholder="e.g., FC Road"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                <input
                  name="landmark"
                  value={formData.location.landmark}
                  onChange={handleChange}
                  placeholder="e.g., Near Fergusson College"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Location on Map</label>
                <MapContainer
                  center={[18.5204, 73.8567]} // Default: Pune, India
                  zoom={13}
                  style={{ height: '300px', width: '100%' }}
                  className="rounded-lg border border-gray-200 shadow-md"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationMarker />
                </MapContainer>
                {formData.location.coordinates.lat && formData.location.coordinates.lng ? (
                  <p className="text-gray-600 mt-2">Selected: Lat {formData.location.coordinates.lat.toFixed(4)}, Lng {formData.location.coordinates.lng.toFixed(4)}</p>
                ) : (
                  <p className="text-red-500 text-sm mt-2">Please click on the map to select a location</p>
                )}
                {errors.coordinates && <p className="text-red-500 text-sm mt-1">{errors.coordinates}</p>}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-colors"
            >
              <CheckCircle size={18} className="mr-2" />
              Add Mess
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <XCircle size={18} className="mr-2" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMess;