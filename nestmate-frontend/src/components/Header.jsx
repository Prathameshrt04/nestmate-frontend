import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/authContext';
import { Home, User, Menu, X, ChevronDown, Package, Coffee, Building, Sparkles } from 'lucide-react';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Set initial state to make menus visible
    setScrolled(true);
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md' : 'bg-white shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-2xl font-bold transition-colors"
          >
            <div className="rounded-full p-1 bg-gradient-to-r from-blue-500 to-purple-600">
              <Home size={24} className="text-white" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              NestMate
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavItem
              title="Home Services"
              icon={<Package size={18} />}
              isScrolled={scrolled}
              items={[
                { to: "/cleaning-services", label: "Cleaning Services" },
                { to: "/laundry-services", label: "Laundry Services" },
                { to: "/add-service", label: "Add Your Service" }
              ]}
            />
            
            <NavItem
              title="Lifestyle Hub"
              icon={<Sparkles size={18} />}
              isScrolled={scrolled}
              items={[
                { to: "/lifestyle?category=decor", label: "Home Decor" },
                { to: "/lifestyle?category=furniture", label: "Furniture" }
              ]}
            />
            
            <NavItem
              title="Mess"
              icon={<Coffee size={18} />}
              isScrolled={scrolled}
              items={[
                { to: "/messes", label: "View Messes" },
                { to: "/add-mess", label: "Add Your Mess" }
              ]}
            />
            
            <NavItem
              title="Flats"
              icon={<Building size={18} />}
              isScrolled={scrolled}
              items={[
                { to: "/search", label: "Search Flat" },
                { to: "/add-flat", label: "Add Flat" },
                { to: "/requirements", label: "View Requirements" },
                { to: "/add-requirement", label: "Add Requirement" }
              ]}
            />

            {/* User menu */}
            <div className="relative group ml-2">
              <button className="flex items-center space-x-1 font-medium rounded-full px-4 py-2 transition-all text-gray-700 hover:bg-gray-100">
                <User size={18} />
                <span>{isAuthenticated && user && user.name ? user.name : 'Login'}</span>
                <ChevronDown size={16} />
              </button>
              
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl py-2 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-purple-600"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/edit-profile"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-purple-600"
                    >
                      Edit Profile
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={logout}
                      className="flex w-full items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-purple-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-purple-600"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-purple-600"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-lg text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className={`md:hidden absolute w-full bg-white shadow-lg transition-all duration-300 ease-in-out max-h-0 overflow-hidden ${
        mobileMenuOpen ? 'max-h-screen border-t border-gray-100' : 'max-h-0'
      }`}>
        <nav className="px-4 py-2 space-y-1">
          <MobileNavSection 
            title="Home Services" 
            icon={<Package size={18} className="text-blue-600" />}
            items={[
              { to: "/cleaning-services", label: "Cleaning Services" },
              { to: "/laundry-services", label: "Laundry Services" },
              { to: "/add-service", label: "Add Your Service" }
            ]}
          />
          
          <MobileNavSection 
            title="Lifestyle Hub" 
            icon={<Sparkles size={18} className="text-purple-600" />}
            items={[
              { to: "/lifestyle?category=decor", label: "Home Decor" },
              { to: "/lifestyle?category=furniture", label: "Furniture" }
            ]}
          />
          
          <MobileNavSection 
            title="Mess" 
            icon={<Coffee size={18} className="text-orange-600" />}
            items={[
              { to: "/messes", label: "View Messes" },
              { to: "/add-mess", label: "Add Your Mess" }
            ]}
          />
          
          <MobileNavSection 
            title="Flats" 
            icon={<Building size={18} className="text-pink-600" />}
            items={[
              { to: "/search", label: "Search Flat" },
              { to: "/add-flat", label: "Add Flat" },
              { to: "/requirements", label: "View Requirements" },
              { to: "/add-requirement", label: "Add Requirement" }
            ]}
          />
          
          <div className="pt-2 pb-3 border-t border-gray-100 mt-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center px-4 py-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                    <User size={16} className="text-purple-600" />
                  </div>
                  <span className="font-medium text-gray-800">{user?.name}</span>
                </div>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 pl-14 text-gray-600 hover:bg-gray-50 hover:text-purple-600"
                >
                  Dashboard
                </Link>
                <Link
                  to="/edit-profile"
                  className="block px-4 py-2 pl-14 text-gray-600 hover:bg-gray-50 hover:text-purple-600"
                >
                  Edit Profile
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 pl-14 text-gray-600 hover:bg-gray-50 hover:text-purple-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex space-x-2 px-4">
                <Link
                  to="/login"
                  className="flex-1 text-center py-2 bg-white border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="flex-1 text-center py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md text-white font-medium hover:opacity-90"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

// Desktop Navigation Item
const NavItem = ({ title, icon, items, isScrolled }) => {
  return (
    <div className="relative group">
      <button className="flex items-center space-x-1 font-medium rounded-lg px-3 py-2 transition-all text-gray-700 hover:bg-gray-100">
        {icon}
        <span>{title}</span>
        <ChevronDown size={16} />
      </button>
      
      <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl py-2 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left scale-95 group-hover:scale-100">
        {items.map((item, index) => (
          <Link
            key={index}
            to={item.to}
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-purple-600"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

// Mobile Navigation Section
const MobileNavSection = ({ title, icon, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <button 
        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          {icon}
          <span className="ml-2 font-medium">{title}</span>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      <div className={`pl-9 space-y-1 max-h-0 overflow-hidden transition-all duration-300 ${
        isOpen ? 'max-h-64 py-1' : 'max-h-0'
      }`}>
        {items.map((item, index) => (
          <Link
            key={index}
            to={item.to}
            className="block py-2 text-gray-600 hover:text-purple-600"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Header;