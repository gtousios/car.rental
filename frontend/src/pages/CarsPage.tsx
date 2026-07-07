import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { carsApi } from '../services/api';
import type { Car, CarsResponse } from '../types';
import CarCard from '../components/cars/CarCard';

const categories = [
  { value: 'ECONOMY', label: 'Economy' },
  { value: 'COMPACT', label: 'Compact' },
  { value: 'MIDSIZE', label: 'Midsize' },
  { value: 'FULLSIZE', label: 'Full Size' },
  { value: 'SUV', label: 'SUV' },
  { value: 'LUXURY', label: 'Luxury' },
  { value: 'VAN', label: 'Van' },
  { value: 'SPORTS', label: 'Sports' },
];

const fuelTypes = [
  { value: 'GASOLINE', label: 'Gasoline' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'ELECTRIC', label: 'Electric' },
  { value: 'HYBRID', label: 'Hybrid' },
];

export default function CarsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category')?.split(',').filter(Boolean) || []
  );
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>(
    searchParams.get('fuelType')?.split(',').filter(Boolean) || []
  );
  const [transmission, setTransmission] = useState(searchParams.get('transmission') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [seats, setSeats] = useState(searchParams.get('seats') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'pricePerDay');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'asc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: '12',
        sortBy,
        sortOrder,
      };
      if (search) params.search = search;
      if (selectedCategories.length) params.category = selectedCategories.join(',');
      if (selectedFuelTypes.length) params.fuelType = selectedFuelTypes.join(',');
      if (transmission) params.transmission = transmission;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (seats) params.seats = seats;

      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response: CarsResponse = await carsApi.list(params);
      setCars(response.cars);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('Failed to fetch cars:', error);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategories, selectedFuelTypes, transmission, minPrice, maxPrice, seats, sortBy, sortOrder, page, searchParams]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setPage(1);
  };

  const toggleFuelType = (ft: string) => {
    setSelectedFuelTypes(prev =>
      prev.includes(ft) ? prev.filter(f => f !== ft) : [...prev, ft]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedFuelTypes([]);
    setTransmission('');
    setMinPrice('');
    setMaxPrice('');
    setSeats('');
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = search || selectedCategories.length || selectedFuelTypes.length || transmission || minPrice || maxPrice || seats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Cars</h1>
          <p className="text-gray-600 mt-1">{total} vehicles found</p>
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="md:hidden flex items-center gap-2 px-4 py-2 border rounded-lg"
        >
          <SlidersHorizontal className="w-5 h-5" /> Filters
        </button>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className={`${filtersOpen ? 'fixed inset-0 z-40 bg-white p-6 overflow-y-auto' : 'hidden'} md:block md:static md:w-64 flex-shrink-0`}>
          <div className="flex justify-between items-center mb-6 md:hidden">
            <h2 className="text-xl font-bold">Filters</h2>
            <button onClick={() => setFiltersOpen(false)}><X className="w-6 h-6" /></button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Brand or model..."
              className="input-field"
            />
          </div>

          {/* Categories */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label key={cat.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.value)}
                    onChange={() => toggleCategory(cat.value)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fuel Type */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fuel Type</label>
            <div className="space-y-2">
              {fuelTypes.map((ft) => (
                <label key={ft.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFuelTypes.includes(ft.value)}
                    onChange={() => toggleFuelType(ft.value)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{ft.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Transmission */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Transmission</label>
            <select value={transmission} onChange={(e) => { setTransmission(e.target.value); setPage(1); }} className="input-field">
              <option value="">Any</option>
              <option value="AUTOMATIC">Automatic</option>
              <option value="MANUAL">Manual</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range ($/day)</label>
            <div className="flex gap-2">
              <input type="number" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setPage(1); }} placeholder="Min" className="input-field" />
              <input type="number" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }} placeholder="Max" className="input-field" />
            </div>
          </div>

          {/* Seats */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Min Seats</label>
            <select value={seats} onChange={(e) => { setSeats(e.target.value); setPage(1); }} className="input-field">
              <option value="">Any</option>
              <option value="2">2+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
              <option value="7">7+</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="w-full py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
              Clear All Filters
            </button>
          )}
        </aside>

        {/* Results */}
        <div className="flex-1">
          {/* Sort */}
          <div className="flex justify-between items-center mb-6">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="input-field w-auto"
            >
              <option value="pricePerDay-asc">Price: Low to High</option>
              <option value="pricePerDay-desc">Price: High to Low</option>
              <option value="year-desc">Newest First</option>
              <option value="brand-asc">Brand: A-Z</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : cars.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">No cars found matching your criteria</p>
              <button onClick={clearFilters} className="mt-4 text-primary-600 font-semibold hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-4 py-2 border rounded-lg ${p === page ? 'bg-primary-600 text-white border-primary-600' : 'hover:bg-gray-50'}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
