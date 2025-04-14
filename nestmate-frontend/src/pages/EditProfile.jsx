import { useState, useEffect } from 'react';
import { useAuth } from '../utils/authContext';
import authService from '../services/authService';
import validationUtils from '../utils/validationUtils';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, CheckCircle, Loader2, XCircle } from 'lucide-react';

const EditProfile = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      logout();
      navigate('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const userData = await authService.getUserProfile();
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
        });
      } catch (error) {
        alert('Failed to load profile data');
        navigate(user?.role === 'admin' ? '/admin-dashboard' : '/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [isAuthenticated, user, logout, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const fields = [
      { name: 'name', label: 'Name' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'phone' },
    ];
    return validationUtils.validateForm(formData, fields);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await authService.updateProfile(formData);
      alert('Profile updated successfully!');
      navigate(user?.role === 'admin' ? '/admin-dashboard' : '/dashboard');
    } catch (error) {
      alert(`Failed to update profile: ${error.message || 'Unknown error'}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600 mb-4">Please log in to edit your profile.</p>
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-colors"
        >
          <User size={18} className="mr-2" />
          Log In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-10">
        <Loader2 size={24} className="animate-spin text-purple-600 mx-auto mb-2" />
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6 flex items-center">
        <User size={28} className="mr-2" />
        Edit Profile
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                <User size={18} className="mr-2 text-purple-600" />
                Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g., John Doe"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Mail size={18} className="mr-2 text-blue-600" />
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="e.g., john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Phone size={18} className="mr-2 text-green-600" />
                Phone
              </label>
              <input
                type="text"
                name="phone"
                placeholder="e.g., +91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-colors w-full sm:w-auto"
            >
              <CheckCircle size={18} className="mr-2" />
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => navigate(user?.role === 'admin' ? '/admin-dashboard' : '/dashboard')}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
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

export default EditProfile;