import { useState, useEffect } from 'react';
import api from '../services/api'; // Import centralized API instance
import ServiceCard from '../components/ServiceCard';
import { Shirt, Loader2 } from 'lucide-react';

const LaundryServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/services');
        const data = response.data;
        setServices(Array.isArray(data) ? data.filter((service) => service.serviceType === 'laundry') : []);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while fetching laundry services');
        console.error('Error fetching laundry services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6 flex items-center">
        <Shirt size={28} className="mr-2" />
        Laundry Services
      </h1>

      {loading ? (
        <div className="text-center py-10">
          <Loader2 size={24} className="animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading laundry services...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-600">
          No laundry services available at the moment.
        </div>
      )}
    </div>
  );
};

export default LaundryServices;