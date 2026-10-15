import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Car,
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Cpu,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { vehiclesApi, branchesApi, bookingsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Vehicle, Branch } from '../../types';
import {
  formatINR,
  calculateRentalDays,
  getMinPickupDateTime,
  formatDateTime,
} from '../../utils';
import { evaluateRentalCost } from '../../dsa/Stack';

export default function BookingPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [pickupBranchId, setPickupBranchId] = useState<string>('');
  const [returnBranchId, setReturnBranchId] = useState<string>('');
  const [pickupDateTime, setPickupDateTime] = useState<string>('');
  const [returnDateTime, setReturnDateTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Validation & Availability State
  const [availabilityError, setAvailabilityError] = useState<string>('');
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!vehicleId) return;
      setIsLoading(true);
      try {
        const [vehRes, branchRes] = await Promise.all([
          vehiclesApi.getById(Number(vehicleId)),
          branchesApi.getAll(),
        ]);

        const v = vehRes.data.data;
        const bList = branchRes.data.data || [];

        setVehicle(v);
        setBranches(bList);

        // Pre-select vehicle's home branch
        if (v && v.branch_id) {
          setPickupBranchId(String(v.branch_id));
          setReturnBranchId(String(v.branch_id));
        } else if (bList.length > 0) {
          setPickupBranchId(String(bList[0].id));
          setReturnBranchId(String(bList[0].id));
        }

        // Set default dates: tomorrow 10am to day after tomorrow 10am
        const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
        tomorrow.setHours(10, 0, 0, 0);
        const dayAfter = new Date(Date.now() + 72 * 3600 * 1000); // 2 days
        dayAfter.setHours(10, 0, 0, 0);

        const pad = (n: number) => String(n).padStart(2, '0');
        const fmt = (d: Date) =>
          `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

        setPickupDateTime(fmt(tomorrow));
        setReturnDateTime(fmt(dayAfter));
      } catch (err) {
        console.error('Failed to load booking form data:', err);
        toast.error('Vehicle data could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [vehicleId]);

  // Check overlapping availability whenever dates change
  useEffect(() => {
    async function verifyDates() {
      if (!vehicle || !pickupDateTime || !returnDateTime) return;

      const pDate = new Date(pickupDateTime);
      const rDate = new Date(returnDateTime);

      if (rDate <= pDate) {
        setAvailabilityError('Return date must be strictly after pickup date.');
        return;
      }

      setIsCheckingAvailability(true);
      setAvailabilityError('');
      try {
        const res = await vehiclesApi.checkAvailability(vehicle.id, pickupDateTime, returnDateTime);
        if (!res.data.data?.is_available && res.data.data?.is_available !== undefined) {
          setAvailabilityError('Vehicle is already booked or reserved for these selected dates.');
        } else {
          setAvailabilityError('');
        }
      } catch (err) {
        // Fallback: If endpoint encounters issue, don't hard block client
        console.warn('Availability check notice:', err);
      } finally {
        setIsCheckingAvailability(false);
      }
    }

    const timer = setTimeout(verifyDates, 400);
    return () => clearTimeout(timer);
  }, [vehicle, pickupDateTime, returnDateTime]);

  // Calculate rental days & stack-based breakdown
  const rentalDays =
    pickupDateTime && returnDateTime
      ? calculateRentalDays(pickupDateTime, returnDateTime)
      : 1;

  const costEval = vehicle
    ? evaluateRentalCost(rentalDays, Number(vehicle.daily_rate), 0, 0)
    : { result: 0, breakdown: { subtotal: 0, total: 0 } };

  const securityDeposit = Number(vehicle?.security_deposit || 5000);
  const totalPayable = costEval.result;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;

    if (new Date(returnDateTime) <= new Date(pickupDateTime)) {
      toast.error('Return date must be after pickup date');
      return;
    }

    if (availabilityError) {
      toast.error(availabilityError);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        vehicle_id: vehicle.id,
        pickup_branch_id: Number(pickupBranchId),
        return_branch_id: Number(returnBranchId),
        pickup_datetime: pickupDateTime,
        return_datetime: returnDateTime,
        notes: notes.trim() || undefined,
      };

      const res = await bookingsApi.create(payload);
      const newBooking = res.data.data;
      toast.success('Reservation created successfully!');
      navigate(`/booking/confirmation/${newBooking.id}`);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to confirm reservation. Please check dates.';
      toast.error(errorMsg);
      setAvailabilityError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mx-auto"></div>
        <p className="text-sm text-gray-600 mt-4">Initializing booking workflow...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-black text-gray-900">Vehicle Not Found</h2>
        <Link
          to="/vehicles"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Fleet</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <Link
          to={`/vehicles/${vehicle.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-semibold mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Vehicle Details</span>
        </Link>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Complete Vehicle Reservation</h1>
        <p className="text-sm text-gray-600 mt-1">
          Review pickup locations, schedule, and transparent stack-evaluated rental tariffs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">
              1. Rental Schedule & Hubs
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pickup Hub */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  Pickup Hub
                </label>
                <select
                  value={pickupBranchId}
                  onChange={(e) => setPickupBranchId(e.target.value)}
                  required
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Return Hub */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  Return Hub
                </label>
                <select
                  value={returnBranchId}
                  onChange={(e) => setReturnBranchId(e.target.value)}
                  required
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Pickup Date & Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  Pickup Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={pickupDateTime}
                  min={getMinPickupDateTime()}
                  onChange={(e) => setPickupDateTime(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Return Date & Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  Return Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={returnDateTime}
                  min={pickupDateTime || getMinPickupDateTime()}
                  onChange={(e) => setReturnDateTime(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Overlap Error Alert */}
            {availabilityError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Booking Window Unavailable</strong>
                  <span>{availabilityError}</span>
                </div>
              </div>
            )}

            {/* Driver Contact Info */}
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider pt-4 pb-2 border-b border-gray-100">
              2. Registered Driver Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-600 block">Driver Name</span>
                <span className="text-sm font-bold text-gray-900">{user?.name}</span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-600 block">Registered Email</span>
                <span className="text-sm font-bold text-gray-900 truncate block">{user?.email}</span>
              </div>
            </div>

            {/* Special Requests / Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Special Requests or Route Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Airport luggage assistance, infant seat request, etc."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || Boolean(availabilityError) || isCheckingAvailability}
              className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:bg-gray-300 text-white font-bold text-sm shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Confirming Reservation...</span>
                </>
              ) : (
                <>
                  <span>Confirm Booking • {formatINR(totalPayable)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right 1 Col: Vehicle Card Summary & Tariff Breakdown */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-5">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Selected Vehicle
            </h3>

            <div className="flex gap-4 items-center pb-4 border-b border-gray-100">
              <img
                src={
                  vehicle.image_url && vehicle.image_url.startsWith('http')
                    ? vehicle.image_url
                    : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80'
                }
                alt={vehicle.name}
                className="w-20 h-20 rounded-2xl object-cover bg-slate-100 shrink-0"
              />
              <div className="overflow-hidden">
                <span className="text-[10px] font-bold text-teal-600 uppercase">
                  {vehicle.category_name}
                </span>
                <h4 className="font-bold text-gray-900 text-sm truncate">{vehicle.name}</h4>
                <p className="text-xs text-gray-600">{vehicle.vehicle_id}</p>
                <p className="text-xs font-bold text-gray-900 mt-1">
                  {formatINR(Number(vehicle.daily_rate))}/day
                </p>
              </div>
            </div>

            {/* Stack-Evaluated Tariff Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-900">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-teal-600" />
                  Tariff Calculation
                </span>
                <span className="text-teal-700 font-extrabold">{rentalDays} Day(s)</span>
              </div>

              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>
                    Rental Subtotal ({rentalDays}d × {formatINR(Number(vehicle.daily_rate))})
                  </span>
                  <span className="font-semibold text-gray-900">{formatINR(costEval.breakdown.subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Hub Surcharge</span>
                  <span className="font-semibold text-emerald-600">₹0 (Free)</span>
                </div>

                <div className="flex justify-between">
                  <span>GST (18% - Included)</span>
                  <span className="font-semibold text-gray-900">
                    {formatINR(Math.round(costEval.result * 0.18))}
                  </span>
                </div>

                <div className="flex justify-between pt-2 border-t border-gray-100 text-gray-900 font-extrabold text-sm">
                  <span>Total Rental Tariff</span>
                  <span className="text-teal-700">{formatINR(totalPayable)}</span>
                </div>

                <div className="flex justify-between pt-1 text-[11px] text-gray-600">
                  <span>Refundable Security Deposit</span>
                  <span>{formatINR(securityDeposit)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-gray-600 space-y-1">
              <p className="font-bold text-gray-900">Cancellation Policy</p>
              <p>
                Free cancellation up to 6 hours before scheduled pickup. 100% refundable security deposit
                collected at vehicle handover.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
