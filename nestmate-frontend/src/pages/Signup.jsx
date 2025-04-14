import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/authContext';
import validationUtils from '../utils/validationUtils';
import { User, Mail, Phone, Lock, UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Custom validation function using validationUtils and additional checks
  const validateForm = () => {
    const fields = [
      { name: 'name', label: 'Name', validate: value => value.trim().length < 2 && 'Name must be at least 2 characters' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'phone' },
      { 
        name: 'password', 
        label: 'Password', 
        type: 'password',
        validate: value => 
          !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value) && 
          'Password must be 8+ characters with uppercase, lowercase, number, and special character'
      },
    ];

    // Use validationUtils.validateForm for basic checks
    let newErrors = validationUtils.validateForm(formData, fields);

    // Additional custom validations
    fields.forEach(field => {
      if (field.validate && !newErrors[field.name]) {
        const error = field.validate(formData[field.name]);
        if (error) newErrors[field.name] = error;
      }
    });

    // Phone number validation (exactly 10 digits)
    const phoneNumber = formData.phone.trim();
    if (!/^\d{10}$/.test(phoneNumber)) {
      newErrors.phone = 'Phone must be exactly 10 digits';
    } else if (!validationUtils.isValidPhone(phoneNumber)) {
      newErrors.phone = 'Invalid phone number format';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await signup(formData);
      navigate('/login');
    } catch (error) {
      setErrors({ general: error.message || 'Failed to sign up. Please try again.' });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6 flex items-center">
          <UserPlus size={28} className="mr-2" />
          Sign Up
        </h1>
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-center text-red-700">
            <AlertCircle size={18} className="mr-2" />
            <span>{errors.general}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
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
              required
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
              required
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
              placeholder="e.g., 9876543210"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Lock size={18} className="mr-2 text-purple-600" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-colors"
          >
            <UserPlus size={18} className="mr-2" />
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-purple-600 hover:underline font-medium"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;