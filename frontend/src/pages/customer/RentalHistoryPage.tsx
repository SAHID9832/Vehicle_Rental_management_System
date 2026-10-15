import React, { useState, useEffect } from 'react';
import { History, Car, Clock, ShieldCheck, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { customersApi } from '../../services/api';
import { formatINR, formatDateTime, getStatusColor } from '../../utils';

export default function RentalHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      setIsLoading(true);
      try {
        const res = await customersApi.getMyHistory();
        setHistory(res.data.data || []);
      } catch (err) {
        console.error('Failed to load rental history:', err);
        toast.error('Could not load rental history.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Rental History</h1>
        <p className="text-sm text-gray-600 mt-1">
          Historical record of completed trips, odometer readings, and billing archives.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white rounded-3xl border border-gray-100 animate-pulse"></div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 text-gray-400 flex items-center justify-center">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Prior Rental History</h3>
          <p className="text-xs text-gray-600 max-w-sm mx-auto">
            Once you complete your first rental trip and return the vehicle to a hub, your trip records will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <Car className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-gray-900">
                      {record.vehicle_name || 'Vehicle'}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(
                        record.status || 'Completed'
                      )}`}
                    >
                      {record.status || 'Completed'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600">Booking Ref: {record.booking_reference}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-1">
                    <span>Pickup: {formatDateTime(record.pickup_datetime)}</span>
                    <span>Return: {formatDateTime(record.return_datetime)}</span>
                    <span>Duration: {record.total_days} Days</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-gray-600 block">Final Billed Amount</span>
                <span className="text-lg font-black text-gray-900">
                  {formatINR(Number(record.total_amount))}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
