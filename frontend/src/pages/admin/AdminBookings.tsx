import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Car,
  User,
  MapPin,
  ArrowRight,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingsApi } from '../../services/api';
import { Booking } from '../../types';
import { formatINR, formatDateTime, getStatusColor } from '../../utils';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const res = await bookingsApi.getAll({ limit: 100 });
      setBookings(res.data.data?.data || res.data.data || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      toast.error('Failed to fetch booking records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleConfirm = async (id: number) => {
    setActionLoadingId(id);
    try {
      await bookingsApi.confirm(id);
      toast.success('Booking confirmed successfully!');
      loadBookings();
    } catch (err) {
      toast.error('Failed to confirm booking.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('Cancel this reservation? This will free the vehicle for other customers.'))
      return;
    setActionLoadingId(id);
    try {
      await bookingsApi.cancel(id, 'Cancelled by admin operations');
      toast.success('Booking cancelled.');
      loadBookings();
    } catch (err) {
      toast.error('Failed to cancel booking.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      b.booking_reference.toLowerCase().includes(q) ||
      b.customer_name?.toLowerCase().includes(q) ||
      b.vehicle_name?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Reservation Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Track customer reservations, verify schedules, confirm bookings, and manage cancellations.
          </p>
        </div>

        <div className="text-xs font-bold text-gray-700 bg-white border border-gray-100 shadow-xs px-4 py-2 rounded-xl">
          Total Bookings: {bookings.length}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by reference, customer, or vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white text-gray-700"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-6">Booking Reference</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Vehicle</th>
                <th className="py-3 px-6">Hubs & Schedule</th>
                <th className="py-3 px-6">Amount</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-600">
                    Loading booking reservations...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-600">
                    No bookings found matching filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-gray-900">
                      {b.booking_reference}
                      <span className="block text-[10px] text-gray-600 font-sans font-normal">
                        {formatDateTime(b.created_at)}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-medium text-gray-900">
                      {b.customer_name || 'Customer'}
                    </td>
                    <td className="py-3.5 px-6 font-semibold">
                      {b.vehicle_name || 'Vehicle'}
                    </td>
                    <td className="py-3.5 px-6 text-[11px] text-gray-600 space-y-0.5">
                      <p className="font-semibold text-gray-800">
                        {b.pickup_branch_name} → {b.return_branch_name}
                      </p>
                      <p>
                        {formatDateTime(b.pickup_datetime)} ({b.total_days}d)
                      </p>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-gray-900">
                      {formatINR(Number(b.total_amount))}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      {b.status === 'Pending' && (
                        <button
                          onClick={() => handleConfirm(b.id)}
                          disabled={actionLoadingId === b.id}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[11px] transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                      {(b.status === 'Pending' || b.status === 'Confirmed') && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          disabled={actionLoadingId === b.id}
                          className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
