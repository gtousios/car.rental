import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, Fuel, Settings2, DoorOpen, Briefcase, Gauge, Calendar, MapPin, Check, ArrowLeft } from 'lucide-react';
import { carsApi, locationsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Car, Location, AvailabilityResponse } from '../types';

const categoryLabels: Record<string, string> = {
  ECONOMY: 'Economy', COMPACT: 'Compact', MIDSIZE: 'Midsize', FULLSIZE: 'Full Size',
  SUV: 'SUV', LUXURY: 'Luxury', VAN: 'Van', SPORTS: 'Sports',
};
const fuelLabels: Record<string, string> = {
  GASOLINE: 'Gasoline', DIESEL: 'Diesel', ELECTRIC: 'Electric', HYBRID: 'Hybrid',
};

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState<Car | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      carsApi.get(id),
      locationsApi.list(),
    ]).then(([carData, locsData]) => {
      setCar(carData);
      setLocations(locsData);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const checkAvailability = async () => {
    if (!id || !startDate || !endDate) return;
    setCheckingAvailability(true);
    try {
      const result = await carsApi.checkAvailability(id, startDate, endDate);
      setAvailability(result);
    } catch (error) {
      console.error('Error checking availability:', error);
    } finally {
      setCheckingAvailability(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate && startDate < endDate) {
      checkAvailability();
    } else {
      setAvailability(null);
    }
  }, [startDate, endDate]);

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Car not found</h2>
        <Link to="/cars" className="text-primary-600 font-semibold">← Back to cars</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-5 h-5 mr-1" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Car Info */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden mb-6">
            <img
              src={car.imageUrl}
              alt={`${car.brand} ${car.model}`}
              className="w-full h-[400px] object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800';
              }}
            />
          </div>

          <div className="mb-6">
            <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full">
              {categoryLabels[car.category]}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mt-3">
              {car.brand} {car.model} <span className="text-gray-500 font-normal">{car.year}</span>
            </h1>
            {car.description && (
              <p className="text-gray-600 mt-3 text-lg">{car.description}</p>
            )}
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <Users className="w-6 h-6 text-primary-600" />
              <div>
                <div className="text-sm text-gray-500">Seats</div>
                <div className="font-semibold">{car.seats} Passengers</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <Settings2 className="w-6 h-6 text-primary-600" />
              <div>
                <div className="text-sm text-gray-500">Transmission</div>
                <div className="font-semibold">{car.transmission === 'AUTOMATIC' ? 'Automatic' : 'Manual'}</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <Fuel className="w-6 h-6 text-primary-600" />
              <div>
                <div className="text-sm text-gray-500">Fuel Type</div>
                <div className="font-semibold">{fuelLabels[car.fuelType]}</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <DoorOpen className="w-6 h-6 text-primary-600" />
              <div>
                <div className="text-sm text-gray-500">Doors</div>
                <div className="font-semibold">{car.doors}</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-primary-600" />
              <div>
                <div className="text-sm text-gray-500">Luggage</div>
                <div className="font-semibold">{car.luggage} Bags</div>
              </div>
            </div>
            {car.mileage && (
              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                <Gauge className="w-6 h-6 text-primary-600" />
                <div>
                  <div className="text-sm text-gray-500">Mileage</div>
                  <div className="font-semibold">{car.mileage}</div>
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          {car.features.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Features</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {car.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Booking Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-1">
                <span className="text-4xl font-bold text-primary-600">${car.pricePerDay}</span>
                <span className="text-gray-500">/day</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline w-4 h-4 mr-1" /> Pickup Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={today}
                  className="input-field"
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
                  className="input-field"
                />
              </div>
            </div>

            {checkingAvailability && (
              <div className="text-center py-4 text-gray-500">Checking availability...</div>
            )}

            {availability && !checkingAvailability && (
              <div className={`rounded-xl p-4 mb-6 ${availability.available ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {availability.available ? (
                  <>
                    <p className="text-green-700 font-semibold mb-2">✓ Available for your dates!</p>
                    <div className="text-sm text-green-600 space-y-1">
                      <div className="flex justify-between">
                        <span>${car.pricePerDay} × {availability.days} days</span>
                        <span className="font-semibold">${availability.totalPrice.toFixed(2)}</span>
                      </div>
                      <hr className="border-green-200" />
                      <div className="flex justify-between text-lg font-bold text-green-800">
                        <span>Total</span>
                        <span>${availability.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-red-700 font-semibold">✗ Not available for selected dates</p>
                )}
              </div>
            )}

            {user ? (
              <button
                onClick={() => navigate(`/booking/${car.id}?startDate=${startDate}&endDate=${endDate}`)}
                disabled={!availability?.available}
                className="btn-primary w-full text-center"
              >
                {availability?.available ? 'Book Now' : startDate && endDate ? 'Not Available' : 'Select Dates'}
              </button>
            ) : (
              <Link to="/login" className="btn-primary w-full text-center block">
                Login to Book
              </Link>
            )}

            <p className="text-center text-sm text-gray-500 mt-4">
              Free cancellation up to 24h before pickup
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
