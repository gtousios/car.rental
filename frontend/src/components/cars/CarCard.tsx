import { Link } from 'react-router-dom';
import { Users, Fuel, Settings2, DollarSign } from 'lucide-react';
import type { Car } from '../../types';

const categoryLabels: Record<string, string> = {
  ECONOMY: 'Economy',
  COMPACT: 'Compact',
  MIDSIZE: 'Midsize',
  FULLSIZE: 'Full Size',
  SUV: 'SUV',
  LUXURY: 'Luxury',
  VAN: 'Van',
  SPORTS: 'Sports',
};

const fuelLabels: Record<string, string> = {
  GASOLINE: 'Gas',
  DIESEL: 'Diesel',
  ELECTRIC: 'Electric',
  HYBRID: 'Hybrid',
};

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  return (
    <Link to={`/cars/${car.id}`} className="card group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={car.imageUrl}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800';
          }}
        />
        <span className="absolute top-3 left-3 px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full">
          {categoryLabels[car.category] || car.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900">
          {car.brand} {car.model}
        </h3>
        <p className="text-sm text-gray-500 mb-3">{car.year}</p>
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" /> {car.seats}
          </span>
          <span className="flex items-center gap-1">
            <Settings2 className="w-4 h-4" /> {car.transmission === 'AUTOMATIC' ? 'Auto' : 'Manual'}
          </span>
          <span className="flex items-center gap-1">
            <Fuel className="w-4 h-4" /> {fuelLabels[car.fuelType]}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-primary-600">
            <DollarSign className="w-5 h-5" />
            <span className="text-2xl font-bold">{car.pricePerDay}</span>
            <span className="text-sm text-gray-500 ml-1">/day</span>
          </div>
          <span className="text-primary-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
