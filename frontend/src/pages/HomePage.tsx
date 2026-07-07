import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Shield, Clock, Award, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { carsApi, locationsApi } from '../services/api';
import type { Car, Location } from '../types';
import CarCard from '../components/cars/CarCard';

export default function HomePage() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Location[]>([]);
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [pickupLocation, setPickupLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    locationsApi.list().then(setLocations).catch(console.error);
    carsApi.list({ limit: '4', sortBy: 'pricePerDay', sortOrder: 'desc' })
      .then((res) => setFeaturedCars(res.cars))
      .catch(console.error);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (pickupLocation) params.set('location', pickupLocation);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    navigate(`/cars?${params.toString()}`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Find Your Perfect
              <span className="text-primary-300"> Rental Car</span>
            </h1>
            <p className="text-xl text-primary-100 mb-10">
              Choose from our premium fleet of vehicles. Best prices, flexible dates, and locations across the country.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-6 shadow-2xl max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="inline w-4 h-4 mr-1" /> Pickup Location
                </label>
                <select
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="input-field text-gray-900"
                >
                  <option value="">Any Location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline w-4 h-4 mr-1" /> Pickup Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={today}
                  className="input-field text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline w-4 h-4 mr-1" /> Return Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || today}
                  className="input-field text-gray-900"
                />
              </div>
              <div className="flex items-end">
                <button type="submit" className="btn-primary w-full flex items-center justify-center">
                  <Search className="w-5 h-5 mr-2" /> Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fully Insured</h3>
              <p className="text-gray-600">All vehicles come with comprehensive insurance coverage for your peace of mind.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Our dedicated team is available around the clock to assist you with any needs.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600">Competitive rates with no hidden fees. Price match guarantee available.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Vehicles</h2>
              <p className="text-gray-600 mt-2">Explore our premium selection of rental cars</p>
            </div>
            <Link to="/cars" className="flex items-center text-primary-600 hover:text-primary-700 font-semibold">
              View All <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Hit the Road?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Sign up today and get 10% off your first rental. Join thousands of happy customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cars" className="px-8 py-4 bg-white text-primary-600 font-bold rounded-lg hover:bg-gray-100 transition-colors text-lg">
              Browse Cars
            </Link>
            <Link to="/signup" className="px-8 py-4 bg-primary-800 text-white font-bold rounded-lg hover:bg-primary-900 transition-colors text-lg">
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
