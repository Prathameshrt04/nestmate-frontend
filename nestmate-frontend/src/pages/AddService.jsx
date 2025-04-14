import { useState, useEffect } from 'react';
import { useAuth } from '../utils/authContext';
import serviceService from '../services/serviceService';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Briefcase, MapPin, Upload, Trash2, XCircle, CheckCircle, DollarSign, Clock, Shirt, Brush, Users } from 'lucide-react';

const AddService = () => {
  const { isAuthenticated, logout } = useAuth();
  const [serviceType, setServiceType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    chargeType: '',
    rate: '',
    workingDays: [],
    workingTime: '',
    chargePerShirt: '',
    chargePerCloth: '',
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

  const handleTypeChange = (e) => {
    setServiceType(e.target.value);
    setFormData({
      name: '',
      description: '',
      chargeType: '',
      rate: '',
      workingDays: [],
      workingTime: '',
      chargePerShirt: '',
      chargePerCloth: '',
      images: [],
      location: { coordinates: { lat: null, lng: null }, city: '', locality: '', landmark: '' },
    });
    setErrors({});
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

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      workingDays: checked
        ? [...prev.workingDays, name]
        : prev.workingDays.filter(day => day !== name),
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const formDataUpload = new FormData();
    files.forEach(file => formDataUpload.append('images', file));

    try {
      const response = await serviceService.uploadPhotos(formDataUpload); // Use serviceService
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
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.location.coordinates.lat || !formData.location.coordinates.lng)
      newErrors.coordinates = 'Location coordinates are required';
    if (serviceType === 'cleaning') {
      if (!formData.chargeType) newErrors.chargeType = 'Charge type is required';
      if (!formData.rate) newErrors.rate = 'Rate is required';
      if (formData.workingDays.length === 0) newErrors.workingDays = 'At least one working day is required';
      if (!formData.workingTime) newErrors.workingTime = 'Working time is required';
    } else if (serviceType === 'laundry') {
      if (!formData.chargePerShirt) newErrors.chargePerShirt = 'Charge per shirt is required';
      if (!formData.chargePerCloth) newErrors.chargePerCloth = 'Charge per cloth is required';
      if (formData.workingDays.length === 0) newErrors.workingDays = 'At least one working day is required';
      if (!formData.workingTime) newErrors.workingTime = 'Working time is required';
    }
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
      const serviceData = {
        serviceType,
        name: formData.name,
        description: formData.description,
        location: {
          city: formData.location.city,
          locality: formData.location.locality,
          landmark: formData.location.landmark,
          coordinates: {
            lat: formData.location.coordinates.lat,
            lng: formData.location.coordinates.lng,
          },
        },
        ...(serviceType === 'cleaning' && {
          chargeType: formData.chargeType,
          rate: Number(formData.rate),
          workingDays: formData.workingDays,
          workingTime: formData.workingTime,
        }),
        ...(serviceType === 'laundry' && {
          chargePerShirt: Number(formData.chargePerShirt),
          chargePerCloth: Number(formData.chargePerCloth),
          workingDays: formData.workingDays,
          workingTime: formData.workingTime,
        }),
        images: formData.images,
        status: 'active',
      };
      await serviceService.createService(serviceData); // Use serviceService
      alert('Service added successfully!');
      setFormData({
        name: '',
        description: '',
        chargeType: '',
        rate: '',
        workingDays: [],
        workingTime: '',
        chargePerShirt: '',
        chargePerCloth: '',
        images: [],
        location: { coordinates: { lat: null, lng: null }, city: '', locality: '', landmark: '' },
      });
      setServiceType('');
      navigate('/dashboard');
    } catch (error) {
      alert(`Failed to add service: ${error.message || 'Unknown error'}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600 mb-4">Please log in to add a service.</p>
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
        <Briefcase size={28} className="mr-2" />
        Add a Service
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            {/* Service Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <select
                value={serviceType}
                onChange={handleTypeChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">Select Service Type</option>
                <option value="cleaning">Cleaning Service</option>
                <option value="laundry">Laundry Service</option>
              </select>
            </div>

            {serviceType && (
              <>
                {/* Service Details Section */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                    {serviceType === 'cleaning' ? (
                      <Brush size={24} className="text-green-600 mr-2" />
                    ) : (
                      <Shirt size={24} className="text-blue-600 mr-2" />
                    )}
                    Service Details
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Sparkle Cleaning"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder={serviceType === 'cleaning'
                        ? 'Describe what you clean (e.g., floors, windows) and how you clean it (e.g., vacuum, manual)'
                        : 'Describe your laundry service details'}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      rows="4"
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>

                  {serviceType === 'cleaning' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Charge Type</label>
                        <select
                          name="chargeType"
                          value={formData.chargeType}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        >
                          <option value="">Select Charge Type</option>
                          <option value="perHour">Rate per Hour</option>
                          <option value="fixedBHK">Fixed Rate based on BHK</option>
                        </select>
                        {errors.chargeType && <p className="text-red-500 text-sm mt-1">{errors.chargeType}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹)</label>
                        <input
                          name="rate"
                          type="number"
                          value={formData.rate}
                          onChange={handleChange}
                          placeholder="e.g., 500"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                        {errors.rate && <p className="text-red-500 text-sm mt-1">{errors.rate}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Working Days</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                            <label key={day} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                name={day}
                                checked={formData.workingDays.includes(day)}
                                onChange={handleCheckboxChange}
                                className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <span className="text-sm text-gray-700">{day}</span>
                            </label>
                          ))}
                        </div>
                        {errors.workingDays && <p className="text-red-500 text-sm mt-1">{errors.workingDays}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Working Time</label>
                        <input
                          name="workingTime"
                          value={formData.workingTime}
                          onChange={handleChange}
                          placeholder="e.g., 9 AM - 5 PM"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                        {errors.workingTime && <p className="text-red-500 text-sm mt-1">{errors.workingTime}</p>}
                      </div>
                    </>
                  )}

                  {serviceType === 'laundry' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Charge per Shirt (₹)</label>
                        <input
                          name="chargePerShirt"
                          type="number"
                          value={formData.chargePerShirt}
                          onChange={handleChange}
                          placeholder="e.g., 20"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                        {errors.chargePerShirt && <p className="text-red-500 text-sm mt-1">{errors.chargePerShirt}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Charge per Cloth (₹)</label>
                        <input
                          name="chargePerCloth"
                          type="number"
                          value={formData.chargePerCloth}
                          onChange={handleChange}
                          placeholder="e.g., 15"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                        {errors.chargePerCloth && <p className="text-red-500 text-sm mt-1">{errors.chargePerCloth}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Working Days</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                            <label key={day} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                name={day}
                                checked={formData.workingDays.includes(day)}
                                onChange={handleCheckboxChange}
                                className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <span className="text-sm text-gray-700">{day}</span>
                            </label>
                          ))}
                        </div>
                        {errors.workingDays && <p className="text-red-500 text-sm mt-1">{errors.workingDays}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Working Time</label>
                        <input
                          name="workingTime"
                          value={formData.workingTime}
                          onChange={handleChange}
                          placeholder="e.g., 9 AM - 5 PM"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                        {errors.workingTime && <p className="text-red-500 text-sm mt-1">{errors.workingTime}</p>}
                      </div>
                    </>
                  )}
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
              </>
            )}
          </div>

          {serviceType && (
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-colors"
              >
                <CheckCircle size={18} className="mr-2" />
                Add Service
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
          )}
        </form>
      </div>
    </div>
  );
};

export default AddService;