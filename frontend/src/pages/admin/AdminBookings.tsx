import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { adminApi } from '../../services/api';
import type { Booking } from '../../types';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchBookings(); }, [statusFilter, search]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '50' };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await adminApi.getBookings(params);
      setBookings(res.bookings);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await adminApi.updateBooking(id, { status });
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to update booking');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin" className="text-gray-500 hover:text-primary-600"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer or car..."
          className="input-field max-w-xs" />
        <div className="flex gap-2">
          {['', 'PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <img src={booking.car.imageUrl} alt="" className="w-full md:w-36 h-24 object-cover rounded-lg"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'; }} />
                <div className="flex-1">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <h3 className="font-bold text-lg">{booking.car.brand} {booking.car.model} {booking.car.year}</h3>
                      <p className="text-sm text-gray-500">
                        Customer: {booking.user?.firstName} {booking.user?.lastName} ({booking.user?.email})
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary-600">${booking.totalPrice.toFixed(2)}</div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {format(new Date(booking.startDate), 'MMM d, yyyy')}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {format(new Date(booking.endDate), 'MMM d, yyyy')}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {booking.pickupLocation.name}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {booking.returnLocation.name}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <select
                      value={booking.status}
                      onChange={(e) => updateStatus(booking.id, e.target.value)}
                      className="text-sm border rounded-lg px-3 py-1.5"
                    >
                      {['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
            <div className="text-center py-12 text-gray-500">No bookings found</div>
          )}
        </div>
      )}
    </div>
  );
}
