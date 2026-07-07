import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowLeft, X } from 'lucide-react';
import { adminApi } from '../../services/api';
import type { Car } from '../../types';

interface CarForm {
  brand: string; model: string; year: number; category: string;
  transmission: string; fuelType: string; seats: number; doors: number;
  luggage: number; pricePerDay: number; imageUrl: string; description: string;
  features: string[]; mileage: string; color: string; licensePlate: string;
  available: boolean;
}

const defaultCarForm: CarForm = {
  brand: '', model: '', year: 2024, category: 'COMPACT',
  transmission: 'AUTOMATIC', fuelType: 'GASOLINE',
  seats: 5, doors: 4, luggage: 2, pricePerDay: 50,
  imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
  description: '', features: [], mileage: 'Unlimited',
  color: '', licensePlate: '', available: true,
};

export default function AdminCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [formData, setFormData] = useState<CarForm>(defaultCarForm);
  const [featuresInput, setFeaturesInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchCars(); }, [search]);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '50' };
      if (search) params.search = search;
      const res = await adminApi.getCars(params);
      setCars(res.cars);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openCreateForm = () => {
    setEditingCar(null); setFormData(defaultCarForm); setFeaturesInput('');
    setShowForm(true); setError('');
  };

  const openEditForm = (car: Car) => {
    setEditingCar(car);
    setFormData({
      brand: car.brand, model: car.model, year: car.year,
      category: car.category, transmission: car.transmission,
      fuelType: car.fuelType, seats: car.seats, doors: car.doors,
      luggage: car.luggage, pricePerDay: car.pricePerDay,
      imageUrl: car.imageUrl, description: car.description || '',
      features: car.features, mileage: car.mileage || '',
      color: car.color || '', licensePlate: car.licensePlate || '',
      available: car.available,
    });
    setFeaturesInput(car.features.join(', '));
    setShowForm(true); setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const data = { ...formData, features: featuresInput.split(',').map(f => f.trim()).filter(Boolean) };
      if (editingCar) { await adminApi.updateCar(editingCar.id, data); }
      else { await adminApi.createCar(data); }
      setShowForm(false); fetchCars();
    } catch (err: any) { setError(err.message || 'Failed to save car'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this car? This cannot be undone.')) return;
    try { await adminApi.deleteCar(id); fetchCars(); }
    catch (err: any) { alert(err.message || 'Failed to delete car'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="text-gray-500 hover:text-primary-600"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-3xl font-bold text-gray-900">Manage Cars</h1>
        </div>
        <button onClick={openCreateForm} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Car</button>
      </div>

      <div className="mb-6">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by brand or model..." className="input-field max-w-md" />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingCar ? 'Edit Car' : 'Add New Car'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-6 h-6" /></button>
            </div>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Brand *</label>
                  <input type="text" value={formData.brand} onChange={(e) => setFormData(p => ({ ...p, brand: e.target.value }))} required className="input-field" /></div>
                <div><label className="block text-sm font-medium mb-1">Model *</label>
                  <input type="text" value={formData.model} onChange={(e) => setFormData(p => ({ ...p, model: e.target.value }))} required className="input-field" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium mb-1">Year</label>
                  <input type="number" value={formData.year} onChange={(e) => setFormData(p => ({ ...p, year: parseInt(e.target.value) }))} className="input-field" /></div>
                <div><label className="block text-sm font-medium mb-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))} className="input-field">
                    {['ECONOMY','COMPACT','MIDSIZE','FULLSIZE','SUV','LUXURY','VAN','SPORTS'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select></div>
                <div><label className="block text-sm font-medium mb-1">Price/Day ($)</label>
                  <input type="number" step="0.01" value={formData.pricePerDay} onChange={(e) => setFormData(p => ({ ...p, pricePerDay: parseFloat(e.target.value) }))} required className="input-field" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium mb-1">Transmission</label>
                  <select value={formData.transmission} onChange={(e) => setFormData(p => ({ ...p, transmission: e.target.value }))} className="input-field">
                    <option value="AUTOMATIC">Automatic</option><option value="MANUAL">Manual</option>
                  </select></div>
                <div><label className="block text-sm font-medium mb-1">Fuel Type</label>
                  <select value={formData.fuelType} onChange={(e) => setFormData(p => ({ ...p, fuelType: e.target.value }))} className="input-field">
                    {['GASOLINE','DIESEL','ELECTRIC','HYBRID'].map(f => <option key={f} value={f}>{f}</option>)}
                  </select></div>
                <div><label className="block text-sm font-medium mb-1">Seats</label>
                  <input type="number" value={formData.seats} onChange={(e) => setFormData(p => ({ ...p, seats: parseInt(e.target.value) }))} className="input-field" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium mb-1">Doors</label>
                  <input type="number" value={formData.doors} onChange={(e) => setFormData(p => ({ ...p, doors: parseInt(e.target.value) }))} className="input-field" /></div>
                <div><label className="block text-sm font-medium mb-1">Luggage</label>
                  <input type="number" value={formData.luggage} onChange={(e) => setFormData(p => ({ ...p, luggage: parseInt(e.target.value) }))} className="input-field" /></div>
                <div><label className="block text-sm font-medium mb-1">Color</label>
                  <input type="text" value={formData.color} onChange={(e) => setFormData(p => ({ ...p, color: e.target.value }))} className="input-field" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Image URL *</label>
                <input type="url" value={formData.imageUrl} onChange={(e) => setFormData(p => ({ ...p, imageUrl: e.target.value }))} required className="input-field" /></div>
              <div><label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={2} className="input-field" /></div>
              <div><label className="block text-sm font-medium mb-1">Features (comma-separated)</label>
                <input type="text" value={featuresInput} onChange={(e) => setFeaturesInput(e.target.value)} placeholder="Bluetooth, GPS, USB" className="input-field" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">License Plate</label>
                  <input type="text" value={formData.licensePlate} onChange={(e) => setFormData(p => ({ ...p, licensePlate: e.target.value }))} className="input-field" /></div>
                <div><label className="block text-sm font-medium mb-1">Mileage Policy</label>
                  <input type="text" value={formData.mileage} onChange={(e) => setFormData(p => ({ ...p, mileage: e.target.value }))} className="input-field" /></div>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.available} onChange={(e) => setFormData(p => ({ ...p, available: e.target.checked }))} className="w-4 h-4" />
                <span className="text-sm font-medium">Available for rental</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Saving...' : editingCar ? 'Update Car' : 'Create Car'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Car</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price/Day</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Bookings</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cars.map((car) => (
                <tr key={car.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={car.imageUrl} alt="" className="w-16 h-10 object-cover rounded"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'; }} />
                      <div><div className="font-semibold text-gray-900">{car.brand} {car.model}</div>
                        <div className="text-sm text-gray-500">{car.year} · {car.licensePlate}</div></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{car.category}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">${car.pricePerDay}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${car.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {car.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{car._count?.bookings || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEditForm(car)} className="p-2 text-gray-500 hover:text-primary-600"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(car.id)} className="p-2 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
