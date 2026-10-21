// Global TypeScript types for Vektor Rentals

export interface User {
  id: number;
  email: string;
  role: 'Admin' | 'Manager' | 'Agent' | 'Customer';
  name: string;
}

export interface Customer {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  driving_license: string;
  date_of_birth: string;
  email?: string;
  created_at?: string;
}

export interface VehicleCategory {
  id: number;
  name: string;
  description: string;
  icon_name: string;
  is_active: boolean;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  manager_name: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  vehicle_count?: number;
}

export interface BranchConnection {
  id: number;
  from_branch_id: number;
  to_branch_id: number;
  distance_km: number;
  travel_time_mins: number;
  is_active: boolean;
  from_branch_name?: string;
  to_branch_name?: string;
  from_city?: string;
  to_city?: string;
  from_state?: string;
  to_state?: string;
}

export interface Vehicle {
  id: number;
  vehicle_id: string;
  name: string;
  model: string;
  brand: string;
  year: number;
  category_id: number;
  category_name?: string;
  branch_id: number;
  branch_name?: string;
  branch_city?: string;
  branch_state?: string;
  color: string;
  fuel_type: 'Petrol' | 'Diesel' | 'Electric' | 'CNG' | 'Hybrid';
  transmission: 'Manual' | 'Automatic';
  seating_capacity: number;
  daily_rate: number;
  weekly_rate: number;
  monthly_rate: number;
  security_deposit: number;
  image_url: string;
  description: string;
  features: string[];
  image_views?: Array<{ view: string; path: string; license?: string; attribution?: string; source_url?: string }>;
  status: 'Available' | 'Rented' | 'Reserved' | 'Maintenance' | 'Inactive';
  mileage: number;
  engine_cc: number;
  created_at?: string;
  updated_at?: string;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled';

export interface Booking {
  id: number;
  booking_reference: string;
  customer_id: number;
  vehicle_id: number;
  pickup_branch_id: number;
  return_branch_id: number;
  pickup_datetime: string;
  return_datetime: string;
  actual_return_datetime?: string;
  status: BookingStatus;
  total_days: number;
  subtotal: number;
  discount: number;
  additional_charges: number;
  total_amount: number;
  notes?: string;
  created_at: string;
  // Joined fields
  vehicle_name?: string;
  vehicle_id_str?: string;
  vehicle_image?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  pickup_branch_name?: string;
  return_branch_name?: string;
  category_name?: string;
}

export interface Rental {
  id: number;
  booking_id: number;
  vehicle_id: number;
  customer_id: number;
  pickup_datetime: string;
  expected_return_datetime: string;
  actual_return_datetime?: string;
  status: 'Active' | 'Completed' | 'Overdue';
  odometer_start: number;
  odometer_end?: number;
  condition_on_pickup: string;
  condition_on_return?: string;
  // Joined fields
  vehicle_name?: string;
  vehicle_id_str?: string;
  customer_name?: string;
  booking_reference?: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  booking_id: number;
  customer_id: number;
  subtotal: number;
  discount: number;
  additional_charges: number;
  tax_amount: number;
  total_amount: number;
  payment_status: 'Pending' | 'Paid' | 'Partially Paid' | 'Refunded';
  issued_at: string;
  due_date: string;
  paid_at?: string;
  // Joined
  booking_reference?: string;
  customer_name?: string;
  vehicle_name?: string;
}

export interface MaintenanceRecord {
  id: number;
  vehicle_id: number;
  maintenance_type: string;
  description: string;
  cost: number;
  scheduled_date: string;
  completed_date?: string;
  performed_by: string;
  branch_id: number;
  status: 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';
  vehicle_name?: string;
  branch_name?: string;
}

export interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
  reservedVehicles: number;
  maintenanceVehicles: number;
  totalBookings: number;
  activeRentals: number;
  totalCustomers: number;
  totalRevenue: number;
  monthlyRevenue: Array<{ month: string; revenue: number; bookings: number }>;
  bookingsByCategory: Array<{ category: string; count: number; revenue: number }>;
  recentActivity: Booking[];
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'Booking' | 'Rental' | 'Payment' | 'System' | 'Maintenance';
  is_read: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: number;
  status?: string;
  branch?: number;
  fuel_type?: string;
  transmission?: string;
  min_price?: number;
  max_price?: number;
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'newest';
}

export interface BookingFormData {
  vehicle_id: number;
  pickup_branch_id: number;
  return_branch_id: number;
  pickup_datetime: string;
  return_datetime: string;
  notes?: string;
}

export interface WaitingQueueEntry {
  id: number;
  customer_id: number;
  vehicle_category_id: number;
  branch_id: number;
  requested_from: string;
  requested_to: string;
  priority: number;
  status: 'Waiting' | 'Notified' | 'Fulfilled' | 'Cancelled';
  enqueued_at: string;
  customer_name?: string;
  category_name?: string;
  branch_name?: string;
}
