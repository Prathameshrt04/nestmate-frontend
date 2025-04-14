import { useState, useEffect } from 'react';
import api from '../services/api'; // Import centralized API instance
import MessCard from '../components/MessCard';
import { Utensils, Loader2 } from 'lucide-react';

const ViewMesses = () => {
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMesses = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/messes');
        setMesses(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while fetching messes');
        console.error('Error fetching messes:', err);
        setMesses([]); // Set empty array on error to show "No messes" message
      } finally {
        setLoading(false);
      }
    };
    fetchMesses();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6 flex items-center">
        <Utensils size={28} className="mr-2" />
        Available Messes
      </h1>

      {loading ? (
        <div className="text-center py-10">
          <Loader2 size={24} className="animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading messes...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : messes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {messes.map((mess) => (
            <MessCard key={mess._id} mess={mess} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-600">No messes available at the moment.</div>
      )}
    </div>
  );
};

export default ViewMesses;