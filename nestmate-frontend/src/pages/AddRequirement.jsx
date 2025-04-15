import { useState, useEffect } from 'react';
import { useAuth } from '../utils/authContext';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, MapPin, DollarSign, Calendar, Users, CheckCircle, XCircle } from 'lucide-react';

const AddRequirement = () => {
  const { isAuthenticated, logout } = useAuth();
  const [formData, setFormData] = useState({
    forWhom: '',
    location: '',
    maxRent: '',
    shiftingDate: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      logout();
      navigate('/login');
    }
  }, [isAuthenticated, logout, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.forWhom) newErrors.forWhom = 'Please specify for whom';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.maxRent) newErrors.maxRent = 'Maximum rent is required';
    if (!formData.shiftingDate) newErrors.shiftingDate = 'Shifting date is required';
    if (!formData.description) newErrors.description = 'Description is required';
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
      const response = await fetch('http://nestmate-backend.onrender:5000/api/requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add requirement');
      alert('Requirement added successfully!');
      setFormData({ forWhom: '', location: '', maxRent: '', shiftingDate: '', description: '' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error adding requirement:', error);
      alert(error.message || 'An error occurred while adding the requirement');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600 mb-4">Please log in to add a requirement.</p>
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
        <ClipboardList size={28} className="mr-2" />
        Add a Requirement
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Users size={18} className="inline mr-2 text-purple-600" />
                For Whom
              </label>
              <select
                name="forWhom"
                value={formData.forWhom}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">Select</option>
                <option value="bachelor male">Bachelor Male</option>
                <option value="bachelor female">Bachelor Female</option>
                <option value="working male">Working Male</option>
                <option value="working female">Working Female</option>
              </select>
              {errors.forWhom && <p className="text-red-500 text-sm mt-1">{errors.forWhom}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin size={18} className="inline mr-2 text-pink-500" />
                Location
              </label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Pune, FC Road"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <DollarSign size={18} className="inline mr-2 text-blue-600" />
                Maximum Rent (₹)
              </label>
              <input
                name="maxRent"
                type="number"
                value={formData.maxRent}
                onChange={handleChange}
                placeholder="e.g., 15000"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              {errors.maxRent && <p className="text-red-500 text-sm mt-1">{errors.maxRent}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar size={18} className="inline mr-2 text-green-600" />
                Shifting Date
              </label>
              <input
                name="shiftingDate"
                type="date"
                value={formData.shiftingDate}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              {errors.shiftingDate && <p className="text-red-500 text-sm mt-1">{errors.shiftingDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g., Looking for a 2 BHK flat with good ventilation near a metro station..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                rows="4"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-colors"
            >
              <CheckCircle size={18} className="mr-2" />
              Add Requirement
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

export default AddRequirement;