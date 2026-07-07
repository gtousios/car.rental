import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Car, Menu, X, User, LogOut, LayoutDashboard, Settings } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-primary-600">Apirental</span>
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Home</Link>
              <Link to="/cars" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Cars</Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <span>{user.firstName}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border">
                    <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                      <LayoutDashboard className="w-4 h-4 mr-2" /> My Bookings
                    </Link>
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                      <User className="w-4 h-4 mr-2" /> Profile
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                        <Settings className="w-4 h-4 mr-2" /> Admin Panel
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50">
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium">Login</Link>
                <Link to="/signup" className="btn-primary text-sm !py-2 !px-4">Sign Up</Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="space-y-2">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Home</Link>
              <Link to="/cars" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Cars</Link>
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 font-medium">My Bookings</Link>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Profile</Link>
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Admin</Link>
                  )}
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block py-2 text-red-600 font-medium">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Login</Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-primary-600 font-medium">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
