import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Check, ArrowLeft } from 'lucide-react';
import { carsApi, locationsApi, bookingsApi } from '../services/api';
import type { Car, Location } from '../types';

export default function BookingPage() {
  const { carId } = useParams<{ carId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [car, setCar] = useState<Car | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');

  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [pickupLocationId, setPickupLocationId] = useState('');
  const [returnLocationId, setReturnLocationId] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!carId) return;
    Promise.all([
      carsApi.get(carId),
      locationsApi.list(),
    ]).then(([carData, locsData]) => {
      setCar(carData);
      setLocations(locsData);
      if (locsData.length > 0) {
        setPickupLocationId(locsData[0].id);
        setReturnLocationId(locsData[0].id);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [carId]);

  const days = startDate && endDate
    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const totalPrice = car ? days * car.pricePerDay : 0;
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carId || !startDate || !endDate || !pickupLocationId || !returnLocationId) return;

    setSubmitting(true);
    setError('');
    try {
      const booking = await bookingsApi.create({
        carId,
        pickupLocationId,
        returnLocationId,
        startDate,
        endDate,
        notes: notes || undefined,
      });
      setSuccess(true);
      setBookingId(booking.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Car not found</h2>
        <Link to="/cars" className="text-primary-600">← Browse cars</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-2">Your reservation for the {car.brand} {car.model} has been confirmed.</p>
        <p className="text-sm text-gray-500 mb-8">Booking ID: {bookingId}</p>
        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Car:</span><br/><span className="font-semibold">{car.brand} {car.model} {car.year}</span></div>
            <div><span className="text-gray-500">Total Price:</span><br/><span className="font-semibold text-primary-600">${totalPrice.toFixed(2)}</span></div>
            <div><span className="text-gray-500">Pickup Date:</span><br/><span className="font-semibold">{new Date(startDate).toLocaleDateString()}</span></div>
            <div><span className="text-gray-500">Return Date:</span><br/><span className="font-semibold">{new Date(endDate).toLocaleDateString()}</span></div>
          </div>
        </div>
        <div className="flex gap-4 justify-center">
          <Link to="/dashboard" className="btn-primary">View My Bookings</Link>
          <Link to="/cars" className="btn-secondary">Browse More Cars</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-5 h-5 mr-1" /> Back
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Booking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Car summary */}
          <div className="bg-white rounded-xl shadow p-4 flex gap-4">
            <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} className="w-32 h-24 object-cover rounded-lg"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'; }} />
            <div>
              <h3 className="font-bold text-lg">{car.brand} {car.model} {car.year}</h3>
              <p className="text-gray-500 text-sm">{car.transmission === 'AUTOMATIC' ? 'Automatic' : 'Manual'} · {car.seats} seats</p>
              <p className="text-primary-600 font-bold mt-1">${car.pricePerDay}/day</p>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" /> Rental Period
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date *</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} min={today} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return Date *</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate || today} required className="input-field" />
              </div>
            </div>
          </div>

          {/* Locations */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" /> Locations
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location *</label>
                <select value={pickupLocationId} onChange={(e) => setPickupLocationId(e.target.value)} required className="input-field">
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name} — {loc.city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return Location *</label>
                <select value={returnLocationId} onChange={(e) => setReturnLocationId(e.target.value)} required className="input-field">
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name} — {loc.city}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Any special requirements..."
              className="input-field" />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
          )}

          <button type="submit" disabled={submitting || days <= 0} className="btn-primary w-full text-lg">
            {submitting ? 'Processing...' : `Confirm Booking — $${totalPrice.toFixed(2)}`}
          </button>
        </form>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{car.brand} {car.model}</span>
              </div>
              {days > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">${car.pricePerDay} × {days} days</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">${totalPrice.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
