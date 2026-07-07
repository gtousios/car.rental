import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Car className="h-7 w-7 text-primary-400" />
              <span className="text-xl font-bold text-white">Apirental</span>
            </div>
            <p className="text-gray-400 text-sm">
              Premium car rental service with the best selection of vehicles for any occasion.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/cars" className="hover:text-white transition-colors">Browse Cars</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Car Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/cars?category=ECONOMY" className="hover:text-white transition-colors">Economy</Link></li>
              <li><Link to="/cars?category=SUV" className="hover:text-white transition-colors">SUV</Link></li>
              <li><Link to="/cars?category=LUXURY" className="hover:text-white transition-colors">Luxury</Link></li>
              <li><Link to="/cars?category=SPORTS" className="hover:text-white transition-colors">Sports</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2"><Phone className="w-4 h-4" /><span>+1 (555) 123-4567</span></li>
              <li className="flex items-center space-x-2"><Mail className="w-4 h-4" /><span>info@apirental.com</span></li>
              <li className="flex items-center space-x-2"><MapPin className="w-4 h-4" /><span>123 Main St, New York</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Apirental. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
