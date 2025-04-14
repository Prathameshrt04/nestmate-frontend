import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/authContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Utensils, MapPin, Upload, Trash2, XCircle, CheckCircle, DollarSign, Clock, Users } from 'lucide-react';

const LocationMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });
  return position === null ? null : <Marker position={position} />;
};

const EditMess = () => {
  const { id } = useParams();
  const { isAuthenticated, user, logout } = useAuth();
  const [formData, setFormData] = useState({
    messName: '', description: '', ratePerMonth: '', ratePerPlate: '', type: '', timings: '',
    location: { coordinates: { lat: '', lng: '' } }, images: [],
  });
  const [mapPosition, setMapPosition] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      logout();
      navigate('/login');
      return;
    }

    const fetchMess = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/messes/${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('Failed to fetch mess');
        const data = await response.json();
        const userId = user?.id;
        const providerId = data.providerId._id || data.providerId;
        if (providerId !== userId) {
          alert('Unauthorized access');
          navigate('/dashboard');
          return;
        }
        setFormData({
          messName: data.messName || '',
          description: data.description || '',
          ratePerMonth: data.ratePerMonth || '',
          ratePerPlate: data.ratePerPlate || '',
          type: data.type || '',
          timings: data.timings || '',
          location: { coordinates: data.location?.coordinates || { lat: '', lng: '' } },
          images: data.images || [],
        });
        setMapPosition(data.location?.coordinates?.lat ? {
          lat: data.location.coordinates.lat,
          lng: data.location.coordinates.lng,
        } : null);
      } catch (error) {
        console.error('Fetch Mess Error:', error);
        alert('Failed to load mess details');
        navigate('/dashboard');
      }
    };
    fetchMess();
  }, [id, isAuthenticated, user, logout, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const formDataUpload = new FormData();
    files.forEach(file => formDataUpload.append('images', file));

    try {
      const response = await fetch('http://localhost:5000/api/messes/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formDataUpload,
      });
      if (!response.ok) throw new Error('Failed to upload images');
      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...data.imageUrls],
      }));
    } catch (error) {
      console.error('Upload Error:', error);
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
    if (!formData.location.coordinates.lat || !formData.location.coordinates.lng) {
      newErrors.coordinates = 'Location coordinates are required';
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
      const updatedData = {
        messName: formData.messName,
        description: formData.description,
        ratePerMonth: Number(formData.ratePerMonth),
        ratePerPlate: formData.ratePerPlate ? Number(formData.ratePerPlate) : undefined,
        type: formData.type,
        timings: formData.timings,
        location: {
          coordinates: {
            lat: Number(formData.location.coordinates.lat),
            lng: Number(formData.location.coordinates.lng),
          },
        },
        images: formData.images,
      };
      const response = await fetch(`http://localhost:5000/api/messes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error('Failed to update mess');
      alert('Mess updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Update Mess Error:', error);
      alert(`Failed to update mess: ${error.message || 'Unknown error'}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600 mb-4">Please log in to edit this mess.</p>
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
        <Utensils size={28} className="mr-2" />
        Edit Mess
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            {/* Mess Details Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <Utensils size={24} className="text-green-600 mr-2" />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="e.g., Special dishes include biryani, extra rates for non-veg..."
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

            {/* Location Section */}
            <div className="space-y-4 relative z-10">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <MapPin size={24} className="text-pink-500 mr-2" />
                Location Details
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Location on Map</label>
                <MapContainer
                  center={mapPosition || [18.5204, 73.8567]}
                  zoom={13}
                  style={{ height: '300px', width: '100%' }}
                  className="rounded-lg border border-gray-200 shadow-md"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationMarker
                    position={mapPosition}
                    setPosition={(pos) => {
                      setMapPosition(pos);
                      setFormData(prev => ({
                        ...prev,
                        location: { ...prev.location, coordinates: { lat: pos.lat, lng: pos.lng } },
                      }));
                    }}
                  />
                </MapContainer>
                {formData.location.coordinates.lat && formData.location.coordinates.lng ? (
                  <p className="text-gray-600 mt-2">Selected: Lat {formData.location.coordinates.lat.toFixed(4)}, Lng {formData.location.coordinates.lng.toFixed(4)}</p>
                ) : (
                  <p className="text-red-500 text-sm mt-2">Please click on the map to select a location</p>
                )}
                {errors.coordinates && <p className="text-red-500 text-sm mt-1">{errors.coordinates}</p>}
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
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden shadow-sm">
                        <img
                          src={`${url.startsWith('http') ? url : `http://localhost:5000/Uploads/${url}`}`}
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
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-colors"
            >
              <CheckCircle size={18} className="mr-2" />
              Save Changes
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

export default EditMess;