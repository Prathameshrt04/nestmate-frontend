import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import flatService from '../services/flatService';
import FlatCard from '../components/FlatCard';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Search, MapPin, Filter, Loader2, Home, DollarSign, SortAsc, SortDesc } from 'lucide-react';

const LocationMarker = ({ setPoi }) => {
  const [position, setPosition] = useState(null);
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setPoi({ lat: e.latlng.lat, lng: e.latlng.lng });
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : <Marker position={position} />;
};

const SearchFlats = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedTerm, setSearchedTerm] = useState('');
  const [poi, setPoi] = useState(null);
  const [flats, setFlats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [distanceFilter, setDistanceFilter] = useState(''); // '' means no filter
  const [priceRange, setPriceRange] = useState({ min: '', max: '' }); // Price filter
  const [sortOption, setSortOption] = useState(''); // Sorting option
  const [useMapSearch, setUseMapSearch] = useState(false); // Toggle for map-based search
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const place = params.get('place');
    const lat = params.get('lat');
    const lng = params.get('lng');
    if (place || (lat && lng)) {
      setSearchTerm(place || '');
      setSearchedTerm(place || 'Selected Location');
      if (lat && lng) {
        setPoi({ lat: parseFloat(lat), lng: parseFloat(lng) });
        setUseMapSearch(true);
      }
      handleSearch(place || '', lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null);
    }
  }, [location.search]);

  const handleSearch = async (term = searchTerm, coordinates = poi) => {
    setLoading(true);
    setError(null);
    setFlats(null);
    try {
      const trimmedTerm = term.trim();
      if (!trimmedTerm && !coordinates) {
        setError('Please enter a city name or select a location on the map');
        return;
      }
      const query = {};
      if (trimmedTerm) query.search = trimmedTerm; // Matches city, locality, or landmark
      if (coordinates) {
        query.lat = coordinates.lat;
        query.lng = coordinates.lng;
      }
      const results = await flatService.getAllFlats(query);

      let filteredResults = Array.isArray(results) ? results : [];

      // Apply filters for map-based search
      if (useMapSearch && coordinates) {
        // Distance filter
        if (distanceFilter) {
          const maxDistance = parseInt(distanceFilter) / 1000; // Convert meters to km
          filteredResults = filteredResults.filter(flat => flat.distance <= maxDistance);
        }
        // Price range filter
        if (priceRange.min) {
          filteredResults = filteredResults.filter(flat => flat.rentPrice >= parseInt(priceRange.min));
        }
        if (priceRange.max) {
          filteredResults = filteredResults.filter(flat => flat.rentPrice <= parseInt(priceRange.max));
        }
        // Sorting
        if (sortOption === 'price-asc') {
          filteredResults.sort((a, b) => a.rentPrice - b.rentPrice);
        } else if (sortOption === 'price-desc') {
          filteredResults.sort((a, b) => b.rentPrice - a.rentPrice);
        } else if (sortOption === 'distance') {
          filteredResults.sort((a, b) => a.distance - b.distance);
        }
      }

      setFlats(filteredResults);
      setSearchedTerm(trimmedTerm || 'Selected Location');
    } catch (err) {
      console.error('Search Error:', err);
      setError(`Failed to search flats: ${err.message || 'Unknown error'}`);
      setFlats([]);
      setSearchedTerm(trimmedTerm || 'Selected Location');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = () => {
    if (searchTerm.trim() || poi) {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set('place', searchTerm.trim());
      if (poi) {
        params.set('lat', poi.lat);
        params.set('lng', poi.lng);
      }
      navigate(`/search?${params.toString()}`);
      handleSearch();
    }
  };

  const toggleMapSearch = () => {
    setUseMapSearch(true);
    setSearchTerm(''); // Clear city search when switching to map
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6 text-center flex items-center justify-center">
        <Home size={32} className="mr-2" />
        Where do you want to find a flat?
      </h1>

      {/* Search Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-full max-w-2xl mb-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter city name (e.g., Pune)"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:bg-gray-100"
                disabled={useMapSearch}
              />
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={handleSearchClick}
              className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
              disabled={loading || useMapSearch}
            >
              <Search size={18} className="mr-2" />
              {loading && !useMapSearch ? 'Searching...' : 'Search'}
            </button>
          </div>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <button
              onClick={toggleMapSearch}
              className="text-purple-600 hover:underline font-medium"
            >
              find flats by pinning a location on the map
            </button>
          </p>
        </div>

        {/* Map-Based Search Section */}
        {useMapSearch && (
          <div className="w-full max-w-2xl space-y-4">
            <p className="text-gray-600 flex items-center justify-center">
              <MapPin size={18} className="mr-2 text-pink-500" />
              Click on the map to select a point of interest
            </p>
            <MapContainer
              center={[18.5204, 73.8567]}
              zoom={13}
              style={{ height: '300px', width: '100%' }}
              className="rounded-lg border border-gray-200 shadow-md"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationMarker setPoi={setPoi} />
            </MapContainer>
            {poi && (
              <p className="text-gray-600 text-center">
                Selected: Lat {poi.lat.toFixed(4)}, Lng {poi.lng.toFixed(4)}
              </p>
            )}

            {/* Filters and Sorting */}
            <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Filter size={20} className="mr-2 text-purple-600" />
                Filters & Sorting
              </h3>
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <MapPin size={16} className="mr-2 text-pink-500" />
                    Distance
                  </label>
                  <select
                    value={distanceFilter}
                    onChange={(e) => setDistanceFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Any Distance</option>
                    <option value="1000">1 km</option>
                    <option value="2000">2 km</option>
                    <option value="3000">3 km</option>
                    <option value="5000">5 km</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <DollarSign size={16} className="mr-2 text-green-600" />
                    Price Range (₹)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      placeholder="Min"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      placeholder="Max"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <SortAsc size={16} className="mr-2 text-blue-600" />
                  Sort By
                </label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="distance">Distance: Nearest First</option>
                </select>
              </div>
              <button
                onClick={handleSearchClick}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                disabled={loading || !poi}
              >
                <Search size={18} className="mr-2" />
                {loading ? 'Searching...' : 'Apply Filters & Search'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="text-center py-10">
          <Loader2 size={24} className="animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading flats...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : flats === null ? (
        <div className="text-center py-10 text-gray-600">
          Please enter a city name or select a location to search for flats
        </div>
      ) : flats.length > 0 ? (
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
            <Home size={24} className="mr-2 text-blue-600" />
            Flats {searchedTerm ? `near "${searchedTerm}"` : 'found'}
            {useMapSearch && distanceFilter && ` (within ${distanceFilter / 1000} km)`}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {flats.map(flat => (
              <FlatCard key={flat._id} flat={flat} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-600">
          No flats available {searchedTerm ? `in "${searchedTerm}"` : 'at this location'}
          {useMapSearch && distanceFilter && ` within ${distanceFilter / 1000} km`}
        </div>
      )}
    </div>
  );
};

export default SearchFlats;