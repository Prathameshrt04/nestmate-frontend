import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './utils/authContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import SearchFlats from './pages/SearchFlats';
import FlatDetails from './pages/FlatDetails';
import AddFlat from './pages/AddFlat';
import AddService from './pages/AddService';
import AddRequirement from './pages/AddRequirement';
import LifestyleHub from './pages/LifestyleHub';
import UserDashboard from './pages/UserDashboard';
import ServiceDetails from './pages/ServiceDetails';
import HomeServices from './pages/HomeServices';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import FAQ from './pages/FAQ';
import AdminDashboard from './pages/AdminDashboard';
import EditProfile from './pages/EditProfile';
import EditFlat from './pages/EditFlat';
import EditService from './pages/EditService';
import AddMess from './pages/AddMess';
import ViewMesses from './pages/ViewMesses';
import MessDetails from './pages/MessDetails';
import CleaningServices from './pages/CleaningServices';
import LaundryServices from './pages/LaundryServices';
import EditMess from './pages/EditMess';
import ViewRequirements from './pages/ViewRequirements';
import { useEffect } from 'react';

// ScrollToTop component to reset scroll position on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); // Scrolls to the top of the page
  }, [pathname]); // Runs whenever the route changes

  return null; // This component doesn't render anything
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <ScrollToTop /> {/* Added here to apply to all routes */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchFlats />} />
              <Route path="/flats/:id" element={<FlatDetails />} />
              <Route path="/add-flat" element={<AddFlat />} />
              <Route path="/add-service" element={<AddService />} />
              <Route path="/add-requirement" element={<AddRequirement />} />
              <Route path="/lifestyle" element={<LifestyleHub />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/services/:id" element={<ServiceDetails />} />
              <Route path="/services/home-services" element={<HomeServices />} />
              <Route path="/cleaning-services" element={<CleaningServices />} />
              <Route path="/laundry-services" element={<LaundryServices />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/edit-flat/:id" element={<EditFlat />} />
              <Route path="/edit-service/:id" element={<EditService />} />
              <Route path="/messes" element={<ViewMesses />} />
              <Route path="/messes/:id" element={<MessDetails />} />
              <Route path="/add-mess" element={<AddMess />} />
              <Route path="/edit-mess/:id" element={<EditMess />} />
              <Route path="/requirements" element={<ViewRequirements />} />
              <Route
                path="*"
                element={
                  <div className="text-center py-10">
                    <h1 className="text-2xl font-semibold text-gray-900">404 - Page Not Found</h1>
                    <p className="mt-2 text-gray-600">The page you're looking for doesn't exist.</p>
                  </div>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;