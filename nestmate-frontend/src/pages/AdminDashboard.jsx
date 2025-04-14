import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/authContext';
import api from '../services/api'; // Import centralized API instance
import Modal from '../components/Modal';
import { User, Package, Edit, LogOut, Trash2, Eye, Filter, Plus } from 'lucide-react';

const AdminDashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [modalData, setModalData] = useState({ isOpen: false, type: '', items: [], userId: '' });
  const [productModal, setProductModal] = useState({ isOpen: false, mode: 'add', product: {} });
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const guidelines = [
    'Ensure user data privacy and security at all times.',
    'Review and moderate listings (flats, services, messes) regularly.',
    'Remove inappropriate or spam content promptly.',
    'Manage affiliate products in Lifestyle Hub to maintain quality.',
    'Monitor user activity to prevent misuse of the platform.',
    'Respond to user inquiries or reported issues efficiently.',
    'Keep the platform’s content up-to-date and relevant.',
    'Use the "Remove User" feature cautiously as it deletes all associated data.',
  ];

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      logout();
      navigate('/login');
    }
    if (selectedMenu === 'manage-users') fetchUsers();
    if (selectedMenu === 'manage-products') fetchProducts();
  }, [isAuthenticated, user, logout, navigate, selectedMenu]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // Reset on error to avoid stale data
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/admin/products');
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setFilteredProducts([]);
    }
  };

  const fetchUserListings = async (userId, type) => {
    const endpoint = {
      flats: 'flats',
      services: 'services',
      messes: 'messes',
      requirements: 'requirements',
    }[type];
    try {
      const response = await api.get(`/admin/users/${userId}/${endpoint}`);
      setModalData({ isOpen: true, type, items: response.data, userId });
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      setModalData({ isOpen: true, type, items: [], userId }); // Show empty modal on error
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!window.confirm('Are you sure? This will delete the user and all their data.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter((u) => u._id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Failed to delete user: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleRemoveListing = async (itemId, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) return;
    try {
      await api.delete(`/admin/${type}/${itemId}`);
      setModalData((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item._id !== itemId),
      }));
    } catch (error) {
      console.error(`Error deleting ${type.slice(0, -1)}:`, error);
      alert(`Failed to delete ${type.slice(0, -1)}: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleFilterProducts = (category) => {
    if (category === 'all') setFilteredProducts(products);
    else setFilteredProducts(products.filter((p) => p.category === category));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productData = {
      category: formData.get('category'),
      name: formData.get('name'),
      description: formData.get('description'),
      affiliateLink: formData.get('affiliateLink'),
      images: formData.get('images') ? formData.get('images').split(',') : [],
    };
    try {
      const response = await api.post('/admin/products', productData);
      const newProduct = response.data;
      setProducts([...products, newProduct]);
      setFilteredProducts([...products, newProduct]);
      setProductModal({ isOpen: false, mode: 'add', product: {} });
    } catch (error) {
      console.error('Error adding product:', error);
      alert(`Failed to add product: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/admin/products/${productId}`);
      setProducts(products.filter((p) => p._id !== productId));
      setFilteredProducts(filteredProducts.filter((p) => p._id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(`Failed to delete product: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
    if (menu === 'edit-profile') navigate('/edit-profile');
    else if (menu === 'logout') logout();
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center">
            <User size={24} className="mr-2" />
            Admin Menu
          </h2>
          <ul className="mt-8 space-y-3">
            <li>
              <button
                onClick={() => handleMenuClick('manage-users')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-all duration-300 ${
                  selectedMenu === 'manage-users'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User size={18} className="mr-2" />
                Manage Users
              </button>
            </li>
            <li>
              <button
                onClick={() => handleMenuClick('manage-products')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-all duration-300 ${
                  selectedMenu === 'manage-products'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Package size={18} className="mr-2" />
                Manage Products
              </button>
            </li>
            <li>
              <button
                onClick={() => handleMenuClick('edit-profile')}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center transition-all duration-300"
              >
                <Edit size={18} className="mr-2" />
                Edit Profile
              </button>
            </li>
            <li>
              <button
                onClick={() => handleMenuClick('logout')}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center transition-all duration-300"
              >
                <LogOut size={18} className="mr-2" />
                Log Out
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-8 animate-fade-in">
          Admin Panel
        </h1>

        {!selectedMenu ? (
          <div className="bg-white rounded-xl shadow-md p-6 animate-fade-in-up">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Admin Guidelines</h2>
            <ul className="list-disc pl-6 space-y-3 text-gray-700">
              {guidelines.map((guideline, index) => (
                <li key={index} className="transition-all duration-300 hover:text-purple-600">
                  {guideline}
                </li>
              ))}
            </ul>
          </div>
        ) : selectedMenu === 'manage-users' ? (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Manage Users</h2>
            {users.map((u) => (
              <div
                key={u._id}
                className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 flex items-center justify-center text-white font-bold">
                      {u.name.charAt(0)}
                    </span>
                    <p className="text-lg font-medium text-gray-900">{u.name}</p>
                  </div>
                  <p className="text-gray-600 mt-1">{u.email}</p>
                  <p className="text-gray-600">{u.phone || 'No phone'}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Registered: {new Date(u.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => fetchUserListings(u._id, 'flats')}
                    className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <Eye size={16} className="mr-2" />
                    Flats
                  </button>
                  <button
                    onClick={() => fetchUserListings(u._id, 'services')}
                    className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <Eye size={16} className="mr-2" />
                    Services
                  </button>
                  <button
                    onClick={() => fetchUserListings(u._id, 'messes')}
                    className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <Eye size={16} className="mr-2" />
                    Messes
                  </button>
                  <button
                    onClick={() => fetchUserListings(u._id, 'requirements')}
                    className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <Eye size={16} className="mr-2" />
                    Requirements
                  </button>
                  <button
                    onClick={() => handleRemoveUser(u._id)}
                    className="inline-flex items-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Manage Products</h2>
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-3">
                <button
                  onClick={() => handleFilterProducts('all')}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                >
                  <Filter size={16} className="mr-2" />
                  All
                </button>
                <button
                  onClick={() => handleFilterProducts('furniture')}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                >
                  <Filter size={16} className="mr-2" />
                  Furniture
                </button>
                <button
                  onClick={() => handleFilterProducts('decor')}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                >
                  <Filter size={16} className="mr-2" />
                  Decor
                </button>
              </div>
              <button
                onClick={() => setProductModal({ isOpen: true, mode: 'add', product: {} })}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white rounded-lg transition-colors duration-200"
              >
                <Plus size={16} className="mr-2" />
                Add Product
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="h-48">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Package size={36} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{product.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {product.description || 'No description'}
                    </p>
                    <div className="flex justify-between items-center">
                      <a
                        href={product.affiliateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                      >
                        <Eye size={16} className="mr-2" />
                        Price
                      </a>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="inline-flex items-center px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Listings Modal */}
      <Modal
        isOpen={modalData.isOpen}
        onClose={() => setModalData({ ...modalData, isOpen: false })}
        title={`Listed ${modalData.type.charAt(0).toUpperCase() + modalData.type.slice(1)}`}
      >
        {modalData.items.length > 0 ? (
          <ul className="space-y-4">
            {modalData.items.map((item) => (
              <li
                key={item._id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <p className="text-gray-900 truncate flex-1">
                  {item.apartmentName  || item.name || item.messName || item.forWhom  ||  item.serviceType ||'Unnamed'}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      navigate(
                        `/${modalData.type === 'messes' ? 'messes' : modalData.type.slice(0)}/${
                          item._id
                        }`
                      )
                    }
                    className="inline-flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                  >
                    <Eye size={16} className="mr-2" />
                    View
                  </button>
                  <button
                    onClick={() => handleRemoveListing(item._id, modalData.type)}
                    className="inline-flex items-center px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 text-center py-4">No {modalData.type} listed by this user.</p>
        )}
      </Modal>

      {/* Product Modal */}
      <Modal
        isOpen={productModal.isOpen}
        onClose={() => setProductModal({ isOpen: false, mode: 'add', product: {} })}
        title={productModal.mode === 'add' ? 'Add Product' : 'Edit Product'}
      >
        <form onSubmit={handleAddProduct} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              defaultValue={productModal.product.category || 'furniture'}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            >
              <option value="furniture">Furniture</option>
              <option value="decor">Decor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              defaultValue={productModal.product.name || ''}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              defaultValue={productModal.product.description || ''}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Affiliate Link</label>
            <input
              type="url"
              name="affiliateLink"
              defaultValue={productModal.product.affiliateLink || ''}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images (comma-separated URLs)
            </label>
            <input
              type="text"
              name="images"
              defaultValue={productModal.product.images?.join(',') || ''}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <Plus size={18} className="mr-2" />
            {productModal.mode === 'add' ? 'Add Product' : 'Update Product'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;