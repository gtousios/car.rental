export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  _count?: { bookings: number };
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: CarCategory;
  transmission: 'AUTOMATIC' | 'MANUAL';
  fuelType: FuelType;
  seats: number;
  doors: number;
  luggage: number;
  pricePerDay: number;
  imageUrl: string;
  description?: string;
  features: string[];
  available: boolean;
  mileage?: string;
  color?: string;
  licensePlate?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { bookings: number };
}

export type CarCategory = 'ECONOMY' | 'COMPACT' | 'MIDSIZE' | 'FULLSIZE' | 'SUV' | 'LUXURY' | 'VAN' | 'SPORTS';
export type FuelType = 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  _count?: { pickupBookings: number; returnBookings: number };
}

export interface Booking {
  id: string;
  userId: string;
  carId: string;
  pickupLocationId: string;
  returnLocationId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  car: Car;
  user?: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'phone'>;
  pickupLocation: Location;
  returnLocation: Location;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface PaginatedResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CarsResponse extends PaginatedResponse<Car> {
  cars: Car[];
}

export interface BookingsResponse extends PaginatedResponse<Booking> {
  bookings: Booking[];
}

export interface AdminStats {
  totalCars: number;
  totalUsers: number;
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  bookingsByStatus: {
    pending: number;
    confirmed: number;
    active: number;
    completed: number;
    cancelled: number;
  };
}

export interface AvailabilityResponse {
  available: boolean;
  pricePerDay: number;
  days: number;
  totalPrice: number;
  conflictingDates: { startDate: string; endDate: string; status: string }[];
}
