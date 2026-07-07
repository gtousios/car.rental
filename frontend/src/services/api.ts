const API_BASE = '/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new ApiError(response.status, error.error || 'Request failed');
  }

  return response.json();
}

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) =>
    request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  signup: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) =>
    request<{ user: any; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  me: () => request<any>('/auth/me'),
};

// Cars
export const carsApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/cars${query}`);
  },
  get: (id: string) => request<any>(`/cars/${id}`),
  checkAvailability: (id: string, startDate: string, endDate: string) =>
    request<any>(`/cars/${id}/availability?startDate=${startDate}&endDate=${endDate}`),
};

// Bookings
export const bookingsApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/bookings${query}`);
  },
  get: (id: string) => request<any>(`/bookings/${id}`),
  create: (data: {
    carId: string;
    pickupLocationId: string;
    returnLocationId: string;
    startDate: string;
    endDate: string;
    notes?: string;
  }) =>
    request<any>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  cancel: (id: string) =>
    request<any>(`/bookings/${id}/cancel`, { method: 'PATCH' }),
};

// Locations
export const locationsApi = {
  list: () => request<any[]>('/locations'),
};

// Users
export const usersApi = {
  getProfile: () => request<any>('/users/profile'),
  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string }) =>
    request<any>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<any>('/users/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Admin
export const adminApi = {
  getStats: () => request<any>('/admin/stats'),
  getCars: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/admin/cars${query}`);
  },
  createCar: (data: any) =>
    request<any>('/admin/cars', { method: 'POST', body: JSON.stringify(data) }),
  updateCar: (id: string, data: any) =>
    request<any>(`/admin/cars/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCar: (id: string) =>
    request<any>(`/admin/cars/${id}`, { method: 'DELETE' }),
  getBookings: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/admin/bookings${query}`);
  },
  updateBooking: (id: string, data: { status: string }) =>
    request<any>(`/admin/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getUsers: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/admin/users${query}`);
  },
  getLocations: () => request<any>('/admin/locations'),
  createLocation: (data: any) =>
    request<any>('/admin/locations', { method: 'POST', body: JSON.stringify(data) }),
  updateLocation: (id: string, data: any) =>
    request<any>(`/admin/locations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteLocation: (id: string) =>
    request<any>(`/admin/locations/${id}`, { method: 'DELETE' }),
};

export { ApiError };
