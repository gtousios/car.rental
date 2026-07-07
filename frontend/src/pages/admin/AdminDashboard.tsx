import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Users, CalendarCheck, DollarSign, BarChart3, MapPin } from 'lucide-react';
import { adminApi } from '../../services/api';
import type { AdminStats } from '../../types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Total Cars</p><p className="text-3xl font-bold text-gray-900">{stats?.totalCars}</p></div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><Car className="w-6 h-6 text-blue-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Total Users</p><p className="text-3xl font-bold text-gray-900">{stats?.totalUsers}</p></div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><Users className="w-6 h-6 text-green-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Active Bookings</p><p className="text-3xl font-bold text-gray-900">{stats?.activeBookings}</p></div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"><CalendarCheck className="w-6 h-6 text-purple-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Total Revenue</p><p className="text-3xl font-bold text-gray-900">${stats?.totalRevenue?.toFixed(0)}</p></div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center"><DollarSign className="w-6 h-6 text-yellow-600" /></div>
          </div>
        </div>
      </div>
      {stats && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary-600" /> Bookings by Status</h2>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(stats.bookingsByStatus).map(([status, count]) => (
              <div key={status} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-500 capitalize">{status}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/cars" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow flex items-center gap-4">
          <Car className="w-8 h-8 text-primary-600" /><div><h3 className="font-bold">Manage Cars</h3><p className="text-sm text-gray-500">Add, edit, remove vehicles</p></div>
        </Link>
        <Link to="/admin/bookings" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow flex items-center gap-4">
          <CalendarCheck className="w-8 h-8 text-primary-600" /><div><h3 className="font-bold">Manage Bookings</h3><p className="text-sm text-gray-500">View and update bookings</p></div>
        </Link>
        <Link to="/admin/users" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow flex items-center gap-4">
          <Users className="w-8 h-8 text-primary-600" /><div><h3 className="font-bold">Manage Users</h3><p className="text-sm text-gray-500">View registered users</p></div>
        </Link>
        <Link to="/admin/locations" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow flex items-center gap-4">
          <MapPin className="w-8 h-8 text-primary-600" /><div><h3 className="font-bold">Manage Locations</h3><p className="text-sm text-gray-500">Pickup & return points</p></div>
        </Link>
      </div>
    </div>
  );
}
