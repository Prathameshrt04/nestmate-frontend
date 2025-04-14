import { Link } from 'react-router-dom';
import { Home, Mail, Phone, Instagram, Twitter, Facebook, MapPin, ChevronRight, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Footer Top Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Information */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-white/10 rounded-full">
                <Home className="text-white" size={20} />
              </div>
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                NestMate
              </h3>
            </div>
            <p className="text-gray-300 mb-6">
              Your comprehensive platform for finding the perfect living space and services in a new city.
            </p>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin size={18} className="text-purple-400 mr-2 mt-0.5" />
                <span className="text-gray-300">Fergusson College, Pune In</span>
              </div>
              <div className="flex items-center">
                <Mail size={18} className="text-purple-400 mr-2" />
                <a href="mailto:contact@nestmate.com" className="text-gray-300 hover:text-white">
                  contact@nestmate.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone size={18} className="text-purple-400 mr-2" />
                <span className="text-gray-300">+91 9028730883</span>
              </div>
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-700">Services</h4>
            <ul className="space-y-2">
              <FooterLink to="/lifestyle?category=furniture" label="Furniture" />
              <FooterLink to="/lifestyle?category=decor" label="Home Decor" />
              <FooterLink to="/messes" label="Messes" />
              <FooterLink to="/cleaning-services" label="Cleaning Services" />
              <FooterLink to="/laundry-services" label="Laundry Services" />
            </ul>
          </div>

          {/* Flats Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-700">Flats</h4>
            <ul className="space-y-2">
              <FooterLink to="/search" label="Find Flats" />
              <FooterLink to="/add-flat" label="List Your Flat" />
              <FooterLink to="/requirements" label="Listed Requirements" />
              <FooterLink to="/add-requirement" label="Post Requirement" />
            </ul>
          </div>

          {/* Explore Links & Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-700">Stay Connected</h4>
            <p className="text-gray-300 mb-4">Subscribe to our newsletter for updates</p>
            
            <div className="flex mb-6">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-gray-700 rounded-l-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-200"
              />
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-r-lg px-4 font-medium hover:opacity-90 transition-opacity">
                Subscribe
              </button>
            </div>
            
            <h5 className="font-medium text-gray-200 mb-3">Follow Us</h5>
            <div className="flex space-x-4">
              <SocialLink icon={<Facebook size={18} />} />
              <SocialLink icon={<Twitter size={18} />} />
              <SocialLink icon={<Instagram size={18} />} />
            </div>
          </div>
        </div>
      </div>

      {/* Explore Links */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center md:justify-between gap-y-2">
            <div className="flex flex-wrap justify-center space-x-4 text-sm text-gray-400">
              <Link to="/about" className="hover:text-white">About Us</Link>
              <Link to="/faq" className="hover:text-white">FAQ</Link>
              <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white">Terms of Service</Link>
              <Link to="/contact" className="hover:text-white">Contact Us</Link>
            </div>
            
            <div className="text-gray-400 text-sm flex items-center">
              <span>&copy; {currentYear} NestMate. Made with</span>
              <Heart size={14} className="mx-1 text-red-400" />
              <span>in India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Footer Link Component
const FooterLink = ({ to, label }) => (
  <li>
    <Link to={to} className="text-gray-300 hover:text-white transition-colors flex items-center">
      <ChevronRight size={16} className="text-purple-400 mr-1" />
      {label}
    </Link>
  </li>
);

// Social Link Component
const SocialLink = ({ icon }) => (
  <a 
    href="#" 
    className="bg-gray-700 p-2 rounded-full hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 transition-all"
  >
    {icon}
  </a>
);

export default Footer;