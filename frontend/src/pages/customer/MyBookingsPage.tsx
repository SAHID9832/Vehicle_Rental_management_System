import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Car,
  Clock,
  AlertTriangle,
  ArrowRight,
  XCircle,
  CheckCircle2,
  Receipt,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingsApi } from '../../services/api';
import { Booking } from '../../types';
import { formatINR, formatDateTime, getStatusColor } from '../../utils';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await bookingsApi.getMyBookings();
      setBookings(res.data.data?.data || res.data.data || []);
    } catch (err) {
      console.error('Failed to load my bookings:', err);
      toast.error('Could not load your bookings list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id: number) => {
    if (!window.confirm('Are you sure you wish to cancel this booking reservation?')) return;

    setCancellingId(id);
    try {
      await bookingsApi.cancel(id, 'Cancelled by customer online');
      toast.success('Booking cancelled successfully.');
      fetchBookings();
    } catch (err) {
      toast.error('Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Bookings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your vehicle reservations, pickup schedules, and booking vouchers.
          </p>
        </div>

        <Link
          to="/vehicles"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors"
        >
          <Car className="w-4 h-4" />
          <span>Book Another Vehicle</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-white rounded-3xl border border-gray-100 animate-pulse"></div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 text-gray-400 flex items-center justify-center">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Reservations Found</h3>
          <p className="text-xs text-gray-600 max-w-sm mx-auto">
            You don't have any bookings yet. Choose from our Bengaluru fleet and book in 2 minutes.
          </p>
          <Link
            to="/vehicles"
            className="inline-block px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 transition-colors"
          >
            Explore Vehicles
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const canCancel = b.status === 'Pending' || b.status === 'Confirmed';
            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Vehicle & Info */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold shrink-0">
                    <Car className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-gray-900">
                        {b.vehicle_name || 'Vehicle Reservation'}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600">Reference: {b.booking_reference}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        Pickup: {formatDateTime(b.pickup_datetime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        Return: {formatDateTime(b.return_datetime)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Tariff & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-gray-600 block">Total Tariff</span>
                    <span className="text-lg font-black text-gray-900">{formatINR(Number(b.total_amount))}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/booking/confirmation/${b.id}`}
                      className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
                    >
                      Voucher
                    </Link>

                    {canCancel && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        disabled={cancellingId === b.id}
                        className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-700 transition-colors"
                      >
                        {cancellingId === b.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
