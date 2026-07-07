import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, X, MapPin } from 'lucide-react';
import { adminApi } from '../../services/api';
import type { Location } from '../../types';

const defaultForm = { name: '', address: '', city: '', state: '', country: 'United States', zipCode: '' };

export default function AdminLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLoc, setEditingLoc] = useState<Location | null>(null);
  const [formData, setFormData] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchLocations(); }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try { const locs = await adminApi.getLocations(); setLocations(locs); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditingLoc(null); setFormData(defaultForm); setShowForm(true); setError(''); };

  const openEdit = (loc: Location) => {
    setEditingLoc(loc);
    setFormData({ name: loc.name, address: loc.address, city: loc.city, state: loc.state || '', country: loc.country, zipCode: loc.zipCode || '' });
    setShowForm(true); setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      if (editingLoc) { await adminApi.updateLocation(editingLoc.id, formData); }
      else { await adminApi.createLocation(formData); }
      setShowForm(false); fetchLocations();
    } catch (err: any) { setError(err.message || 'Failed to save'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this location?')) return;
    try { await adminApi.deleteLocation(id); fetchLocations(); }
    catch (err: any) { alert(err.message || 'Failed to delete'); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="text-gray-500 hover:text-primary-600"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-3xl font-bold text-gray-900">Manage Locations</h1>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Location</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingLoc ? 'Edit Location' : 'Add Location'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-6 h-6" /></button>
            </div>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} required className="input-field" />
              </div>
              <div><label className="block text-sm font-medium mb-1">Address *</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))} required className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">City *</label>
                  <input type="text" value={formData.city} onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))} required className="input-field" />
                </div>
                <div><label className="block text-sm font-medium mb-1">State</label>
                  <input type="text" value={formData.state} onChange={(e) => setFormData(p => ({ ...p, state: e.target.value }))} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Country</label>
                  <input type="text" value={formData.country} onChange={(e) => setFormData(p => ({ ...p, country: e.target.value }))} className="input-field" />
                </div>
                <div><label className="block text-sm font-medium mb-1">Zip Code</label>
                  <input type="text" value={formData.zipCode} onChange={(e) => setFormData(p => ({ ...p, zipCode: e.target.value }))} className="input-field" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Saving...' : editingLoc ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((loc) => (
            <div key={loc.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{loc.name}</h3>
                    <p className="text-sm text-gray-600">{loc.address}</p>
                    <p className="text-sm text-gray-500">{loc.city}{loc.state ? `, ${loc.state}` : ''} {loc.zipCode}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(loc)} className="p-2 text-gray-500 hover:text-primary-600"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(loc.id)} className="p-2 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
