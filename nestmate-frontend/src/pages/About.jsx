import { useEffect } from 'react';
import { Home, Users, Star, MapPin } from 'lucide-react';

const About = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 animate-fade-in">
          About NestMate
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto animate-on-scroll opacity-0">
          NestMate is your ultimate platform for finding rooms, flats, and essential services when moving to a new city. We bridge the gap between renters, owners, and service providers with ease and efficiency.
        </p>
      </div>

      {/* Mission Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow duration-300 animate-on-scroll opacity-0">
          <div className="flex items-center mb-4">
            <Home size={28} className="text-blue-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">Our Mission</h2>
          </div>
          <p className="text-gray-600">
            At NestMate, we aim to simplify the process of finding a home and settling into a new city. Our mission is to create a seamless, trusted platform where users can connect, discover, and thrive.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow duration-300 animate-on-scroll opacity-0 delay-100">
          <div className="flex items-center mb-4">
            <Users size={28} className="text-purple-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">Our Community</h2>
          </div>
          <p className="text-gray-600">
            We’re building a community of renters, flat owners, and service providers who value transparency, reliability, and convenience. NestMate is more than a platform—it’s a network of support.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-10 animate-on-scroll opacity-0">
          Why Choose NestMate?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 shadow-md hover:scale-105 transition-transform duration-300 animate-on-scroll opacity-0">
            <div className="flex items-center mb-4">
              <MapPin size={24} className="text-blue-500 mr-3" />
              <h3 className="text-xl font-medium text-gray-900">Wide Coverage</h3>
            </div>
            <p className="text-gray-600">
              Explore listings and services across multiple cities, tailored to your needs.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 shadow-md hover:scale-105 transition-transform duration-300 animate-on-scroll opacity-0 delay-100">
            <div className="flex items-center mb-4">
              <Star size={24} className="text-purple-500 mr-3" />
              <h3 className="text-xl font-medium text-gray-900">Trusted Quality</h3>
            </div>
            <p className="text-gray-600">
              Verified listings and curated services ensure a reliable experience.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 shadow-md hover:scale-105 transition-transform duration-300 animate-on-scroll opacity-0 delay-200">
            <div className="flex items-center mb-4">
              <Users size={24} className="text-pink-500 mr-3" />
              <h3 className="text-xl font-medium text-gray-900">Direct Connections</h3>
            </div>
            <p className="text-gray-600">
              Connect directly with owners and providers, no middlemen involved.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center animate-on-scroll opacity-0">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-gray-600 mb-6">
          Join NestMate today and discover a smarter way to find your next home.
        </p>
        <button
          onClick={() => window.location.href = '/signup'}
          className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-colors duration-300"
        >
          Join Now
        </button>
      </div>

      {/* Animation Styles */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
};

export default About;