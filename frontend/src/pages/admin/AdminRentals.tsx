import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  CheckCircle,
  Clock,
  Car,
  User,
  Shield,
  X,
  Gauge,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { rentalsApi, bookingsApi } from '../../services/api';
import { Rental, Booking } from '../../types';
import { formatINR, formatDateTime, getStatusColor } from '../../utils';

export default function AdminRentals() {
  const [activeRentals, setActiveRentals] = useState<Rental[]>([]);
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Start Rental Modal
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [odometerStart, setOdometerStart] = useState(15000);
  const [conditionPickup, setConditionPickup] = useState('Clean interior, no visible scratches');

  // Complete Rental Modal
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [odometerEnd, setOdometerEnd] = useState(15350);
  const [conditionReturn, setConditionReturn] = useState('Vehicle returned in good condition, fuel level full');
  const [extraCharges, setExtraCharges] = useState(0);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rentalsRes, bookingsRes] = await Promise.all([
        rentalsApi.getActive(),
        bookingsApi.getAll({ status: 'Confirmed' }),
      ]);
      setActiveRentals(rentalsRes.data.data || []);
      setConfirmedBookings(bookingsRes.data.data?.data || bookingsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load rentals:', err);
      toast.error('Failed to load active rentals data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartRentalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    try {
      await rentalsApi.startRental(selectedBooking.id, {
        odometer_start: odometerStart,
        condition_on_pickup: conditionPickup,
      });
      toast.success('Rental started! Vehicle checked out and marked as Rented.');
      setStartModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start rental.');
    }
  };

  const handleCompleteRentalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRental) return;

    try {
      await rentalsApi.completeRental(selectedRental.id, {
        odometer_end: odometerEnd,
        condition_on_return: conditionReturn,
        extra_charges: Number(extraCharges),
      });
      toast.success('Vehicle return completed! Invoice generated and vehicle marked Available.');
      setCompleteModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to complete vehicle return.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Rentals & Return Handover
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Dispatch vehicles on pickup, track active trips, verify return odometer readings, and auto-generate invoices.
          </p>
        </div>

        <div className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-4 py-2 rounded-xl">
          Active Trips: {activeRentals.length}
        </div>
      </div>

      {/* Confirmed Bookings Ready for Pickup Dispatch */}
      {confirmedBookings.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Confirmed Bookings Ready for Key Handover
              </h2>
              <p className="text-xs text-gray-600">
                Customers with confirmed reservations awaiting vehicle pickup at hubs.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              {confirmedBookings.length} Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {confirmedBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-gray-900">{b.booking_reference}</span>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      Confirmed
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm truncate">{b.vehicle_name || 'Vehicle'}</h4>
                  <p className="text-xs text-gray-600">{b.customer_name || 'Customer'}</p>
                  <p className="text-[11px] text-gray-600 mt-1">
                    Pickup: {formatDateTime(b.pickup_datetime)}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedBooking(b);
                    setStartModalOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Rental (Handover)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Rentals Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Vehicles Currently On Trip (Active Rentals)</h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Monitor trips currently underway and process vehicle returns when brought back to hubs.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-6">Vehicle</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Trip Schedule</th>
                <th className="py-3 px-6">Pickup Odometer</th>
                <th className="py-3 px-6">Condition</th>
                <th className="py-3 px-6 text-right">Return Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-600">
                    Loading active rental records...
                  </td>
                </tr>
              ) : activeRentals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-600">
                    No active rentals currently checked out.
                  </td>
                </tr>
              ) : (
                activeRentals.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-gray-900">
                      {r.vehicle_name || 'Vehicle'}
                      <span className="block text-[10px] text-gray-600 font-normal">
                        Ref: {r.booking_reference || `Booking #${r.booking_id}`}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-semibold">{r.customer_name || 'Customer'}</td>
                    <td className="py-3.5 px-6 text-gray-600 space-y-0.5">
                      <p>Out: {formatDateTime(r.pickup_datetime)}</p>
                      <p className="font-semibold text-gray-800">
                        Due: {formatDateTime(r.expected_return_datetime)}
                      </p>
                    </td>
                    <td className="py-3.5 px-6 font-mono font-bold text-gray-900">
                      {r.odometer_start ? `${r.odometer_start} km` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-6 text-gray-600 max-w-[200px] truncate">
                      {r.condition_on_pickup || 'Normal'}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => {
                          setSelectedRental(r);
                          setOdometerEnd((r.odometer_start || 15000) + 250);
                          setCompleteModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-xs inline-flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Process Return</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Start Rental Modal */}
      {startModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-black text-gray-900">
                Key Handover: {selectedBooking.booking_reference}
              </h3>
              <button
                onClick={() => setStartModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStartRentalSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <p className="font-bold text-gray-900">{selectedBooking.vehicle_name}</p>
                <p className="text-gray-600">Customer: {selectedBooking.customer_name}</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Initial Odometer Reading (km)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={odometerStart}
                  onChange={(e) => setOdometerStart(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Condition on Handover</label>
                <textarea
                  rows={2}
                  required
                  value={conditionPickup}
                  onChange={(e) => setConditionPickup(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-sm"
              >
                Confirm Pickup & Start Trip
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Complete Rental Modal */}
      {completeModalOpen && selectedRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-black text-gray-900">
                Process Vehicle Return & Hand-in
              </h3>
              <button
                onClick={() => setCompleteModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteRentalSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <p className="font-bold text-gray-900">{selectedRental.vehicle_name}</p>
                <p className="text-gray-600">Pickup Odometer: {selectedRental.odometer_start} km</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Final Return Odometer (km)</label>
                <input
                  type="number"
                  required
                  min={selectedRental.odometer_start || 0}
                  value={odometerEnd}
                  onChange={(e) => setOdometerEnd(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Vehicle Return Condition</label>
                <textarea
                  rows={2}
                  required
                  value={conditionReturn}
                  onChange={(e) => setConditionReturn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Permitted Additional Surcharges (INR, if any)</label>
                <input
                  type="number"
                  min="0"
                  value={extraCharges}
                  onChange={(e) => setExtraCharges(Number(e.target.value))}
                  placeholder="0 (Refueling or late hours)"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-sm"
              >
                Complete Return & Mark Vehicle Available
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
