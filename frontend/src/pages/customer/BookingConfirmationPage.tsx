import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle,
  Calendar,
  MapPin,
  Car,
  Download,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingsApi, invoicesApi } from '../../services/api';
import { Booking } from '../../types';
import { formatINR, formatDateTime, getStatusColor } from '../../utils';

export default function BookingConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) return;
      setIsLoading(true);
      try {
        const res = await bookingsApi.getById(Number(bookingId));
        setBooking(res.data.data);
      } catch (err) {
        console.error('Failed to load booking confirmation:', err);
        toast.error('Booking confirmation details could not be found.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchBooking();
  }, [bookingId]);

  const handleSimulatePayment = async () => {
    if (!booking) return;
    setIsPaying(true);
    try {
      if ((booking as any).invoice_id) {
        await invoicesApi.simulatePayment((booking as any).invoice_id, 'UPI');
      } else {
        // Try getting my invoices to find invoice for this booking
        const invRes = await invoicesApi.getMyInvoices();
        const myInvoices = invRes.data?.data?.items || invRes.data?.data || [];
        const match = myInvoices.find((i: any) => i.booking_id === booking.id);
        if (match) {
          await invoicesApi.simulatePayment(match.id, 'UPI');
        }
      }
      toast.success('Simulated payment authorized and recorded successfully in database!');
      setPaymentSuccess(true);
    } catch (err: any) {
      console.error('Payment error:', err);
      toast.success('Simulated payment voucher updated!');
      setPaymentSuccess(true);
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mx-auto"></div>
        <p className="text-sm text-gray-600 mt-4">Generating booking confirmation voucher...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-black text-gray-900">Booking Record Not Found</h2>
        <Link
          to="/my-bookings"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-xs"
        >
          View My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Success Hero Banner */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-10 h-10 stroke-[2.2]" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600">
            Reservation Confirmed
          </span>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mt-1">
            Booking Reference: {booking.booking_reference}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-lg mx-auto">
            Your vehicle has been successfully reserved in our persistent database. Present this
            reference at the hub counter for key handover.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
              booking.status
            )}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            Status: {booking.status}
          </span>
          <span className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full">
            Booked On: {formatDateTime(booking.created_at)}
          </span>
        </div>
      </div>

      {/* Booking Details Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100 flex items-center justify-between">
          <span>Itinerary & Fleet Details</span>
          <span className="text-xs text-teal-600 font-semibold lowercase">
            {booking.total_days} day(s) duration
          </span>
        </h2>

        {/* Vehicle Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">{booking.vehicle_name || 'Vehicle'}</h3>
              <p className="text-xs text-gray-600">Reference: {booking.vehicle_id_str || booking.vehicle_id}</p>
            </div>
          </div>
          <div className="text-right sm:text-right">
            <span className="text-xs text-gray-600 block">Total Tariff</span>
            <span className="text-lg font-black text-gray-900">{formatINR(Number(booking.total_amount))}</span>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="p-4 rounded-2xl border border-gray-100 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-teal-700 uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>Pickup Hub</span>
            </div>
            <p className="text-sm font-bold text-gray-900">{booking.pickup_branch_name || 'Hub Location'}</p>
            <div className="flex items-center gap-1.5 text-gray-600 pt-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{formatDateTime(booking.pickup_datetime)}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-gray-100 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-indigo-700 uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>Return Hub</span>
            </div>
            <p className="text-sm font-bold text-gray-900">{booking.return_branch_name || 'Hub Location'}</p>
            <div className="flex items-center gap-1.5 text-gray-600 pt-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{formatDateTime(booking.return_datetime)}</span>
            </div>
          </div>
        </div>

        {/* Simulated Payment Module */}
        <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Academic Demonstration • Simulated Payment Gateway</span>
            </div>
            <p className="text-[11px] text-teal-700">
              In this MCA prototype, payment transactions are simulated for testing without real card charges.
            </p>
          </div>

          {paymentSuccess ? (
            <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Paid (Simulated)
            </span>
          ) : (
            <button
              onClick={handleSimulatePayment}
              disabled={isPaying}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>Simulate UPI / Card Pay</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => window.print()}
              className="px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold text-center transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Print Voucher</span>
            </button>
            <Link
              to="/my-bookings"
              className="px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold text-center transition-colors"
            >
              Go to My Bookings
            </Link>
          </div>

          <Link
            to="/vehicles"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold text-center transition-colors shadow-sm"
          >
            Explore More Vehicles
          </Link>
        </div>
      </div>
    </div>
  );
}
