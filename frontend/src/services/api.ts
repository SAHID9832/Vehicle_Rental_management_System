import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('movo_token') || localStorage.getItem('vektor_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('movo_token');
      localStorage.removeItem('movo_user');
      localStorage.removeItem('vektor_token');
      localStorage.removeItem('vektor_user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: {
    email: string; password: string; first_name: string; last_name: string;
    phone: string; role?: 'Customer' | 'Admin'; address?: string; city?: string; state?: string;
    pincode?: string; driving_license?: string; date_of_birth?: string;
  }) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { oldPassword, newPassword }),
};

// ─── Vehicles ─────────────────────────────────────────────────────────────
export const vehiclesApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/vehicles', { params }),
  getById: (id: number) => api.get(`/vehicles/${id}`),
  create: (data: unknown) => api.post('/vehicles', data),
  update: (id: number, data: unknown) => api.put(`/vehicles/${id}`, data),
  delete: (id: number) => api.delete(`/vehicles/${id}`),
  getCategories: () => api.get('/vehicles/categories'),
  checkAvailability: (vehicleId: number, pickup: string, returnDate: string) =>
    api.get(`/vehicles/${vehicleId}/availability`, { params: { pickup, return: returnDate } }),
  searchAvailable: (params: Record<string, unknown>) =>
    api.get('/vehicles/search/available', { params }),
};

// ─── Customers ────────────────────────────────────────────────────────────
export const customersApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/customers', { params }),
  getById: (id: number) => api.get(`/customers/${id}`),
  create: (data: unknown) => api.post('/customers', data),
  update: (id: number, data: unknown) => api.put(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
  getMyProfile: () => api.get('/customers/me/profile'),
  updateMyProfile: (data: unknown) => api.put('/customers/me/profile', data),
  getMyBookings: (params?: Record<string, unknown>) =>
    api.get('/customers/me/bookings', { params }),
  getMyHistory: () => api.get('/customers/me/history'),
};

// ─── Branches ─────────────────────────────────────────────────────────────
export const branchesApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/branches', { params }),
  getById: (id: number) => api.get(`/branches/${id}`),
  create: (data: unknown) => api.post('/branches', data),
  update: (id: number, data: unknown) => api.put(`/branches/${id}`, data),
  delete: (id: number) => api.delete(`/branches/${id}`),
  getConnections: () => api.get('/branches/connections'),
  addConnection: (data: unknown) => api.post('/branches/connections', data),
  removeConnection: (id: number) => api.delete(`/branches/connections/${id}`),
  syncCsv: () => api.post('/branches/sync-csv'),
};

// ─── Bookings ─────────────────────────────────────────────────────────────
export const bookingsApi = {
  create: (data: unknown) => api.post('/bookings', data),
  getAll: (params?: Record<string, unknown>) => api.get('/bookings', { params }),
  getById: (id: number) => api.get(`/bookings/${id}`),
  confirm: (id: number) => api.put(`/bookings/${id}/confirm`),
  cancel: (id: number, reason?: string) =>
    api.put(`/bookings/${id}/cancel`, { reason }),
  getMyBookings: (params?: Record<string, unknown>) =>
    api.get('/bookings/my', { params }),
};

// ─── Rentals ──────────────────────────────────────────────────────────────
export const rentalsApi = {
  startRental: (bookingId: number, data: unknown) =>
    api.post(`/rentals/start`, { bookingId, ...data as Record<string, unknown> }),
  completeRental: (rentalId: number, data: unknown) =>
    api.put(`/rentals/${rentalId}/complete`, data),
  getActive: () => api.get('/rentals/active'),
  getOverdue: () => api.get('/rentals/overdue'),
  getById: (id: number) => api.get(`/rentals/${id}`),
};

// ─── Maintenance ──────────────────────────────────────────────────────────
export const maintenanceApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/maintenance', { params }),
  create: (data: unknown) => api.post('/maintenance', data),
  update: (id: number, data: unknown) => api.put(`/maintenance/${id}`, data),
  complete: (id: number) => api.put(`/maintenance/${id}/complete`),
};

// ─── Invoices ─────────────────────────────────────────────────────────────
export const invoicesApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/invoices', { params }),
  getById: (id: number) => api.get(`/invoices/${id}`),
  getMyInvoices: () => api.get('/invoices/my'),
  simulatePayment: (id: number, method: string) =>
    api.post(`/invoices/${id}/pay`, { method }),
  getPdfData: (id: number) => api.get(`/invoices/${id}/pdf`),
};

// ─── Dashboard ────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

// ─── DSA ──────────────────────────────────────────────────────────────────
export const dsaApi = {
  getLinkedList: () => api.get('/dsa/linked-list'),
  getStack: () => api.get('/dsa/stack'),
  getQueue: () => api.get('/dsa/queue'),
  getGraph: () => api.get('/dsa/graph'),
  evaluateExpression: (data: { days: number; dailyRate: number; discount: number; additionalCharges: number }) =>
    api.post('/dsa/expression', data),
  getBSTVehicles: () => api.get('/dsa/bst'),
  runBFS: (startBranchId: number) => api.post('/dsa/bfs', { startBranchId }),
  searchVehicles: (data: { query: string; method: 'linear' | 'binary' }) =>
    api.post('/dsa/search', data),
  sortVehicles: (data: { order: 'asc' | 'desc' }) =>
    api.post('/dsa/sort', data),
  greedyRecommend: (data: unknown) => api.post('/dsa/greedy', data),
};

// ─── Notifications ────────────────────────────────────────────────────────
export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};
