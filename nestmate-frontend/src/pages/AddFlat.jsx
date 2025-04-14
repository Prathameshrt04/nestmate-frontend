import { useState, useEffect } from 'react';
import { useAuth } from '../utils/authContext';
import flatService from '../services/flatService';
import validationUtils from '../utils/validationUtils';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Building, MapPin, ChevronLeft, ChevronRight, Upload, Trash2, XCircle, CheckCircle, Home, DollarSign, Calendar, Users, Box } from 'lucide-react';

const AddFlat = () => {
  const { isAuthenticated, logout } = useAuth();
  const [stage, setStage] = useState(1);
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('addFlatDraft');
    return savedData
      ? JSON.parse(savedData)
      : { images: [], location: { coordinates: { lat: null, lng: null }, city: '', locality: '', landmark: '' } };
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL; // Access VITE_BASE_URL from .env

  useEffect(() => {
    if (!isAuthenticated) {
      logout();
      navigate('/login');
    }
    const savedData = localStorage.getItem('addFlatDraft');
    if (savedData) setFormData(JSON.parse(savedData));
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

  const validateStage = () => {
    let fields = [];
    let customErrors = {};

    switch (stage) {
      case 1:
        fields = [
          { name: 'apartmentName', label: 'Apartment Name' },
          { name: 'bhkType', label: 'BHK Type' },
          { name: 'floors', label: 'Floors' },
          { name: 'totalFloors', label: 'Total Floors' },
          { name: 'area', label: 'Area (sq ft)' },
        ];
        break;
      case 2:
        customErrors = {};
        if (!formData.location.city) customErrors.city = 'City is required';
        if (!formData.location.locality) customErrors.locality = 'Locality is required';
        if (!formData.location.coordinates.lat || !formData.location.coordinates.lng) {
          customErrors.coordinates = 'Location Coordinates are required';
        }
        return customErrors;
      case 3:
        fields = [
          { name: 'rentPrice', label: 'Rent Price' },
          { name: 'deposit', label: 'Deposit' },
          { name: 'preferredFor', label: 'Preferred For' },
          { name: 'furnishing', label: 'Furnishing' },
          { name: 'description', label: 'Description' },
          { name: 'availabilityDate', label: 'Availability Date' },
        ];
        break;
      case 4:
        fields = [{ name: 'bathrooms', label: 'Number of Bathrooms' }];
        break;
      case 5:
        fields = [{ name: 'images', label: 'Images' }];
        break;
      default:
        return {};
    }
    return validationUtils.validateForm(formData, fields);
  };

  const handleNext = () => {
    const validationErrors = validateStage();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    localStorage.setItem('addFlatDraft', JSON.stringify(formData));
    if (stage < 5) setStage(stage + 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    const validationErrors = validateStage();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const finalData = {
        apartmentName: formData.apartmentName,
        bhkType: formData.bhkType,
        floors: Number(formData.floors),
        totalFloors: Number(formData.totalFloors),
        area: Number(formData.area),
        location: {
          city: formData.location.city,
          locality: formData.location.locality,
          landmark: formData.location.landmark,
          coordinates: {
            lat: formData.location.coordinates.lat,
            lng: formData.location.coordinates.lng,
          },
        },
        rentPrice: Number(formData.rentPrice),
        deposit: Number(formData.deposit),
        negotiable: formData.negotiable || false,
        maintenance: formData.maintenance || false,
        maintenanceCost: formData.maintenance ? Number(formData.maintenanceCost) : undefined,
        preferredFor: formData.preferredFor,
        furnishing: formData.furnishing,
        parking: formData.parking,
        description: formData.description,
        bathrooms: Number(formData.bathrooms),
        amenities: formData.amenities || [],
        images: formData.images || [],
        availabilityDate: formData.availabilityDate || new Date().toISOString(),
        status: 'available',
      };
      await flatService.createFlat(finalData);
      alert('Flat listed successfully!');
      localStorage.removeItem('addFlatDraft');
      setFormData({ images: [], location: { coordinates: { lat: null, lng: null }, city: '', locality: '', landmark: '' } });
      setStage(1);
      navigate('/dashboard');
    } catch (error) {
      alert(`Failed to list flat: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel adding this flat? All entered data will be lost.')) {
      localStorage.removeItem('addFlatDraft');
      setFormData({ images: [], location: { coordinates: { lat: null, lng: null }, city: '', locality: '', landmark: '' } });
      setStage(1);
      navigate('/dashboard');
    }
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
      amenities: checked
        ? [...(prev.amenities || []), name]
        : (prev.amenities || []).filter(item => item !== name),
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const formDataUpload = new FormData();
    files.forEach(file => formDataUpload.append('images', file));

    try {
      const response = await flatService.uploadPhotos(formDataUpload);
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...response.imageUrls],
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

  const renderStage = () => {
    switch (stage) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Home size={24} className="text-blue-600 mr-2" />
              Listing Details
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="apartmentName" className="block text-sm font-medium text-gray-700 mb-1">Apartment Name</label>
                <input
                  name="apartmentName"
                  id="apartmentName"
                  placeholder="e.g., Skyview Apartments"
                  value={formData.apartmentName || ''}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {errors.apartmentName && <p className="text-red-500 text-sm mt-1">{errors.apartmentName}</p>}
              </div>
              <div>
                <label htmlFor="bhkType" className="block text-sm font-medium text-gray-700 mb-1">BHK Type</label>
                <input
                  name="bhkType"
                  id="bhkType"
                  placeholder="e.g., 2 BHK"
                  value={formData.bhkType || ''}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {errors.bhkType && <p className="text-red-500 text-sm mt-1">{errors.bhkType}</p>}
              </div>
              <div>
                <label htmlFor="floors" className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                <input
                  name="floors"
                  id="floors"
                  type="number"
                  placeholder="e.g., 5"
                  value={formData.floors || ''}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {errors.floors && <p className="text-red-500 text-sm mt-1">{errors.floors}</p>}
              </div>
              <div>
                <label htmlFor="totalFloors" className="block text-sm font-medium text-gray-700 mb-1">Total Floors</label>
                <input
                  name="totalFloors"
                  id="totalFloors"
                  type="number"
                  placeholder="e.g., 10"
                  value={formData.totalFloors || ''}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {errors.totalFloors && <p className="text-red-500 text-sm mt-1">{errors.totalFloors}</p>}
              </div>
              <div>
                <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">Area (sq ft)</label>
                <input
                  name="area"
                  id="area"
                  type="number"
                  placeholder="e.g., 1200"
                  value={formData.area || ''}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <MapPin size={24} className="text-pink-500 mr-2" />
              Locality Details
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  name="city"
                  id="city"
                  placeholder="e.g., Pune"
                  value={formData.location.city || ''}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>
              <div>
                <label htmlFor="locality" className="block text-sm font-medium text-gray-700 mb-1">Locality</label>
                <input
                  name="locality"
                  id="locality"
                  placeholder="e.g., FC Road"
                  value={formData.location.locality || ''}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {errors.locality && <p className="text-red-500 text-sm mt-1">{errors.locality}</p>}
              </div>
              <div>
                <label htmlFor="landmark" className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                <input
                  name="landmark"
                  id="landmark"
                  placeholder="e.g., Near Fergusson College"
                  value={formData.location.landmark || ''}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {errors.landmark && <p className="text-red-500 text-sm mt-1">{errors.landmark}</p>}
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
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <DollarSign size={24} className="text-blue-600 mr-2" />
              Property Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rent Price (₹ per month)</label>
                <input
                  name="rentPrice"
                  type="number"
                  placeholder="e.g., 15,000"
                  value={formData.rentPrice || ''}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {errors.rentPrice && <p className="text-red-500 text-sm mt-1">{errors.rentPrice}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Amount (₹)</label>
                <input
                  name="deposit"
                  type="number"
                  placeholder="e.g., 50,000"
                  value={formData.deposit || ''}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {errors.deposit && <p className="text-red-500 text-sm mt-1">{errors.deposit}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability Date</label>
                <input
                  name="availabilityDate"
                  type="date"
                  value={formData.availabilityDate || ''}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {errors.availabilityDate && <p className="text-red-500 text-sm mt-1">{errors.availabilityDate}</p>}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="negotiable"
                  checked={formData.negotiable || false}
                  onChange={e => setFormData({ ...formData, negotiable: e.target.checked })}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Rent Price Negotiable</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="maintenance"
                  checked={formData.maintenance || false}
                  onChange={e => setFormData({ ...formData, maintenance: e.target.checked })}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Maintenance Included</span>
              </div>
              {formData.maintenance && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Cost (₹ per month)</label>
                  <input
                    name="maintenanceCost"
                    type="number"
                    placeholder="e.g., 2,000"
                    value={formData.maintenanceCost || ''}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred For</label>
                <select
                  name="preferredFor"
                  value={formData.preferredFor || ''}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Preference</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="any">Any</option>
                </select>
                {errors.preferredFor && <p className="text-red-500 text-sm mt-1">{errors.preferredFor}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Furnishing Type</label>
                <select
                  name="furnishing"
                  value={formData.furnishing || ''}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Furnishing</option>
                  <option value="fully">Fully Furnished</option>
                  <option value="semi">Semi-Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
                {errors.furnishing && <p className="text-red-500 text-sm mt-1">{errors.furnishing}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parking Available</label>
                <select
                  name="parking"
                  value={formData.parking || ''}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Description</label>
                <textarea
                  name="description"
                  placeholder="e.g., Spacious 2BHK apartment with balcony, near metro station..."
                  value={formData.description || ''}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  rows="4"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Box size={24} className="text-purple-600 mr-2" />
              Amenities
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Bathrooms</label>
                <input
                  name="bathrooms"
                  type="number"
                  placeholder="e.g., 2"
                  value={formData.bathrooms || ''}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Available Amenities</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Wi-Fi', 'Air Conditioning', 'Heating', 'TV', 'Washing Machine', 'Dryer', 'Dishwasher', 'Microwave', 'Refrigerator',
                    'Oven', 'Stove', 'Balcony', 'Terrace', 'Garden', 'Gym', 'Swimming Pool', 'Lift', 'Security', 'Power Backup',
                    'Water Supply', 'Parking', 'CCTV', 'Intercom', 'Clubhouse', 'Play Area'
                  ].map(amenity => (
                    <label key={amenity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name={amenity}
                        checked={(formData.amenities || []).includes(amenity)}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Upload size={24} className="text-blue-600 mr-2" />
              Gallery
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photos</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gradient-to-r file:from-blue-500 file:to-purple-600 file:text-white file:hover:opacity-90"
                />
                {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
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
          </div>
        );
      default:
        return <p className="text-gray-600">Invalid stage</p>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600 mb-4">Please log in to add a flat.</p>
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
        <Building size={28} className="mr-2" />
        Add a Flat
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Progress Indicator */}
        <div className="flex justify-between mb-6">
          {[1, 2, 3, 4, 5].map(step => (
            <div key={step} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${stage >= step ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {step}
              </div>
              <span className={`text-xs mt-1 ${stage >= step ? 'text-purple-600' : 'text-gray-500'}`}>
                {step === 1 ? 'Listing' : step === 2 ? 'Location' : step === 3 ? 'Details' : step === 4 ? 'Amenities' : 'Gallery'}
              </span>
            </div>
          ))}
        </div>
        {renderStage()}
        <div className="mt-8 flex flex-wrap gap-3">
          {stage > 1 && (
            <button
              type="button"
              onClick={() => setStage(stage - 1)}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={18} className="mr-2" />
              Previous
            </button>
          )}
          {stage < 5 && (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-colors"
            >
              Save and Next
              <ChevronRight size={18} className="ml-2" />
            </button>
          )}
          {stage === 5 && (
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-colors"
            >
              <CheckCircle size={18} className="mr-2" />
              List Your Property
            </button>
          )}
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <XCircle size={18} className="mr-2" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFlat;