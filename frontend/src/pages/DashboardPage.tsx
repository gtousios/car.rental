import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, AlertCircle, CheckCircle, XCircle, Car } from 'lucide-react';
import { bookingsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Booking } from '../types';
import { format } from 'date-fns';

const statusConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  PENDING: { color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: Clock, label: 'Pending' },
  CONFIRMED: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: CheckCircle, label: 'Confirmed' },
  ACTIVE: { color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: Car, label: 'Active' },
  COMPLETED: { color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200', icon: CheckCircle, label: 'Completed' },
  CANCELLED: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: XCircle, label: 'Cancelled' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '50' };
      if (statusFilter) params.status = statusFilter;
      const response = await bookingsApi.list(params);
      setBookings(response.bookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(id);
    try {
      await bookingsApi.cancel(id);
      fetchBookings();
    } catch (error: any) {
      alert(error.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.firstName}!</p>
        </div>
        <Link to="/cars" className="btn-primary">Book a Car</Link>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['', 'PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings found</h3>
          <p className="text-gray-500 mb-6">You haven't made any bookings yet.</p>
          <Link to="/cars" className="btn-primary">Browse Cars</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const config = statusConfig[booking.status];
            const StatusIcon = config.icon;
            return (
              <div key={booking.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <img
                    src={booking.car.imageUrl}
                    alt={`${booking.car.brand} ${booking.car.model}`}
                    className="w-full md:w-40 h-28 object-cover rounded-lg"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'; }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {booking.car.brand} {booking.car.model} {booking.car.year}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.color} mt-1`}>
                          <StatusIcon className="w-3.5 h-3.5" /> {config.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary-600">${booking.totalPrice.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{format(new Date(booking.startDate), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{format(new Date(booking.endDate), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{booking.pickupLocation.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{booking.returnLocation.name}</span>
                      </div>
                    </div>

                    {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                      <div className="mt-4">
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
