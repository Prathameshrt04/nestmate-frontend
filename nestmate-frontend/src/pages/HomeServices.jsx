import { useEffect, useState } from 'react';
import serviceService from '../services/serviceService';
import ServiceCard from '../components/ServiceCard';
import formatUtils from '../utils/formatUtils';

const HomeServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeServices = async () => {
      try {
        console.log('Fetching home services...');
        const allServices = await serviceService.getAllServices();
        const homeServices = allServices.filter(service => service.serviceType === 'home-cleaning');
        setServices(homeServices);
      } catch (error) {
        console.error('Error fetching home services:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeServices();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Home Services</h1>
      {loading ? (
        <p className="text-gray-600">Loading home services...</p>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <ServiceCard
              key={service._id}
              service={{
                ...service,
                pricing: { ...service.pricing, amount: formatUtils.formatCurrency(service.pricing.amount, 'INR') },
              }}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No home services available at this time.</p>
      )}
    </div>
  );
};

export default HomeServices;