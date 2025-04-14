import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import productService from '../services/productService';
import { ShoppingBag, Loader2, ExternalLink } from 'lucide-react';

const LifestyleHub = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('category');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await productService.getAllProducts();
        const filteredProducts = category ? data.filter(p => p.category === category) : data;
        setProducts(filteredProducts);
      } catch (error) {
        console.error('Error fetching products:', error.message);
        setProducts([]); // Set empty array on error to show "No products" message
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6 flex items-center">
        <ShoppingBag size={28} className="mr-2" />
        {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Products` : 'Lifestyle Hub'}
      </h1>

      {loading ? (
        <div className="text-center py-10">
          <Loader2 size={24} className="animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="h-48">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = 'data:image/png;base64,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')}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <ShoppingBag size={36} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-medium text-gray-900 truncate">{product.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {product.description || 'No description available'}
                </p>
                <div className="mt-2">
                  <a
                    href={product.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-colors"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Check Latest Price
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-600">
          No products available {category ? `in the "${category}" category` : 'at the moment'}.
        </div>
      )}
    </div>
  );
};

export default LifestyleHub;