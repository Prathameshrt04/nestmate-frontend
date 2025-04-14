import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, User, MapPin, Star, Clock, ChevronDown, Users } from 'lucide-react';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null); // For interactive feature animations
  const aboutSectionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
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

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?place=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const scrollToAbout = () => {
    aboutSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-purple-900/70 z-10"></div>
          <div
            className="w-full h-full bg-cover bg-center animate-zoom-in"
            style={{
              backgroundImage: "url('https://via.placeholder.com/1920x1080')", // Placeholder image
            }}
          ></div>
        </div>

        <div className="container mx-auto px-6 relative z-20">
          <div className={`text-center transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-white rounded-full shadow-lg animate-bounce-slow">
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center">
                  <Home className="mr-3 text-purple-600" size={40} />
                  NestMate
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight animate-text-reveal">
              Find Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Living Space</span>
            </h1>

            <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto animate-fade-in-up">
              Connect with flat owners, discover nearby services, and make your new city feel like home
            </p>

            <button
              onClick={scrollToAbout}
              className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-full hover:shadow-xl transform transition-all hover:-translate-y-1 hover:scale-105"
            >
              Explore Now
            </button>

            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
              <ChevronDown className="text-white" size={36} />
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div ref={aboutSectionRef} className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12 animate-on-scroll opacity-0 transition-all duration-1000">
            How NestMate <span className="text-purple-600">Works</span>
          </h2>

          {/* Interactive Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div
              className="rounded-xl bg-white p-6 shadow-lg transition-all duration-500 transform hover:scale-105 animate-on-scroll opacity-0 translate-y-8"
              onMouseEnter={() => setHoveredFeature('flats')}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center transition-colors duration-300 ${hoveredFeature === 'flats' ? 'bg-blue-500' : 'bg-blue-100'}`}>
                <MapPin className={`transition-colors duration-300 ${hoveredFeature === 'flats' ? 'text-white' : 'text-blue-600'}`} size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">List & Find Flats</h3>
              <p className="text-gray-600 text-center">
                Flat owners list properties, newcomers find homes.
              </p>
              {hoveredFeature === 'flats' && (
                <div className="mt-4 flex justify-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center animate-spin-slow">
                    <Home className="text-white" size={24} />
                  </div>
                </div>
              )}
            </div>

            <div
              className="rounded-xl bg-white p-6 shadow-lg transition-all duration-500 transform hover:scale-105 animate-on-scroll opacity-0 translate-y-8 delay-100"
              onMouseEnter={() => setHoveredFeature('connect')}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center transition-colors duration-300 ${hoveredFeature === 'connect' ? 'bg-purple-500' : 'bg-purple-100'}`}>
                <User className={`transition-colors duration-300 ${hoveredFeature === 'connect' ? 'text-white' : 'text-purple-600'}`} size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Connect Directly</h3>
              <p className="text-gray-600 text-center">
                Direct connection with flat owners, no middlemen.
              </p>
              {hoveredFeature === 'connect' && (
                <div className="mt-4 flex justify-center space-x-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
                    <User className="text-white" size={16} />
                  </div>
                  <div className="h-1 w-12 bg-purple-500 rounded-full relative">
                    <div className="absolute h-full w-4 bg-white rounded-full animate-left-to-right"></div>
                  </div>
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
                    <Home className="text-white" size={16} />
                  </div>
                </div>
              )}
            </div>

            <div
              className="rounded-xl bg-white p-6 shadow-lg transition-all duration-500 transform hover:scale-105 animate-on-scroll opacity-0 translate-y-8 delay-200"
              onMouseEnter={() => setHoveredFeature('services')}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center transition-colors duration-300 ${hoveredFeature === 'services' ? 'bg-pink-500' : 'bg-pink-100'}`}>
                <Star className={`transition-colors duration-300 ${hoveredFeature === 'services' ? 'text-white' : 'text-pink-600'}`} size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Discover Services</h3>
              <p className="text-gray-600 text-center">
                Find and rate nearby messes and services.
              </p>
              {hoveredFeature === 'services' && (
                <div className="mt-4 flex justify-center">
                  <div className="relative">
                    <Star className="text-pink-500 w-12 h-12 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                      <Star className="text-white w-6 h-6" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Section */}
          <div className="max-w-4xl mx-auto text-center mb-16 animate-on-scroll opacity-0 transition-all duration-1000">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Start Your <span className="text-purple-600">Journey</span> Now
            </h2>
            <p className="text-gray-600 mb-8">
              Enter your desired location and find the perfect flat and services today
            </p>

            <div className="p-2 bg-white rounded-full shadow-xl">
              <div className="flex items-center">
                <div className="p-3">
                  <Search className="text-gray-400" size={24} />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search for flats (e.g., Pune, Mumbai, Bangalore)"
                  className="w-full p-3 outline-none text-gray-700 text-lg"
                />
                <button
                  onClick={handleSearch}
                  className="m-1 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-full hover:shadow-lg transform transition hover:-translate-y-1"
                >
                  Search Flats
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <span className="flex items-center">
                <Clock size={16} className="mr-1" />
                <span>100+ New Listings Daily</span>
              </span>
              <span className="flex items-center">
                <Star size={16} className="mr-1" />
                <span>Verified Owners</span>
              </span>
              <span className="flex items-center">
                <MapPin size={16} className="mr-1" />
                <span>10+ Cities Covered</span>
              </span>
            </div>
          </div>

          {/* Developers Section */}
          <div>
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12 animate-on-scroll opacity-0 transition-all duration-1000">
              Meet Our <span className="text-purple-600">Team</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Developer 1 */}
              <a
                href="https://www.linkedin.com/in/prathameshthorat07/"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 animate-on-scroll opacity-0 translate-y-8">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-blue-500 shadow-md">
                    <img
                      src="https://media.licdn.com/dms/image/v2/D4E03AQG-1geeHYuOuQ/profile-displayphoto-shrink_400_400/B4EZRq99hkHMAg-/0/1736961416295?e=1748476800&v=beta&t=GKFE23AXczeuMvAA_6iSdGwT1kG1QvuqQVD8fK9QXCY"
                      alt="Prathamesh Thorat"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 text-center">Prathamesh Thorat</h3>
                  <p className="text-purple-600 text-center font-medium mt-1">Developer</p>
                  <p className="text-gray-600 text-sm text-center mt-2">
                    MSc Computer Science, Fergusson College
                  </p>
                </div>
              </a>

              {/* Developer 2 */}
              <a
                href="https://www.linkedin.com/in/vasundhara-yadav-149410296/"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 animate-on-scroll opacity-0 translate-y-8 delay-100">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-purple-500 shadow-md">
                    <img
                      src="https://media.licdn.com/dms/image/v2/D5603AQHeihKuUH6bxw/profile-displayphoto-shrink_400_400/B56ZRuhxn6HoAg-/0/1737021136461?e=1748476800&v=beta&t=KqqGor5wsS71dihtGVNIwyzPwg2F3BskR-AFOb7zaQE"
                      alt="Vasundhara Yadav"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 text-center">Vasundhara Yadav</h3>
                  <p className="text-purple-600 text-center font-medium mt-1">Developer</p>
                  <p className="text-gray-600 text-sm text-center mt-2">
                    MSc Computer Science, Fergusson College
                  </p>
                </div>
              </a>

              {/* Mentor */}
              <a
                href="https://www.linkedin.com/in/dr-arati-sameer-nimgonkar-029412144/"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 animate-on-scroll opacity-0 translate-y-8 delay-200">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-pink-500 shadow-md">
                    <img
                      src="https://media.licdn.com/dms/image/v2/D4D03AQE2VVRCj6XQHw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1710471013973?e=1748476800&v=beta&t=8Y1J6ki1w6TSxzXcvwV0xH7FOZGdybjhB91CzazjumA"
                      alt="Dr. Aarati Nimgaonkar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 text-center">Dr. Aarati Nimgaonkar</h3>
                  <p className="text-pink-600 text-center font-medium mt-1">Mentor</p>
                  <p className="text-gray-600 text-sm text-center mt-2">
                    Professor in MSc Computer Science, Fergusson College
                  </p>
                </div>
              </a>

            </div>
          </div>
        </div>
      </div>

      {/* Global Styles for Animations */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-zoom-in {
          animation: zoomIn 1.5s ease-out forwards;
        }

        .animate-text-reveal {
          animation: textReveal 1s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
        }

        .animate-bounce-slow {
          animation: bounceSlow 3s infinite;
        }

        .animate-spin-slow {
          animation: spin 4s linear infinite;
        }

        .animate-left-to-right {
          animation: leftToRight 1.5s infinite alternate ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes zoomIn {
          from {
            transform: scale(1.1);
          }
          to {
            transform: scale(1);
          }
        }

        @keyframes textReveal {
          from {
            opacity: 0;
            clip-path: inset(0 100% 0 0);
          }
          to {
            opacity: 1;
            clip-path: inset(0 0 0 0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounceSlow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes leftToRight {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(100% - 1rem));
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;