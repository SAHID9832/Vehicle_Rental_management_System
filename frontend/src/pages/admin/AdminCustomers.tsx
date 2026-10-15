import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, Mail, MapPin, Eye, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { customersApi } from '../../services/api';
import { Customer } from '../../types';
import { formatDateTime } from '../../utils';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Customer Detail Drawer
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customerBookings, setCustomerBookings] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await customersApi.getAll({ limit: 100 });
      setCustomers(res.data.data?.data || res.data.data || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
      toast.error('Failed to load customer list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const openCustomerDetails = async (c: Customer) => {
    setSelectedCustomer(c);
    setIsLoadingHistory(true);
    try {
      const res = await customersApi.getById(c.id);
      setCustomerBookings(res.data.data?.bookings || []);
    } catch (err) {
      console.warn('Customer history note:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    const fullName = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
    return (
      fullName.includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.city?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Access verified customer identities, contact records, and rental histories.
          </p>
        </div>

        <div className="text-xs font-bold text-gray-700 bg-white border border-gray-100 shadow-xs px-4 py-2 rounded-xl">
          Total Customers: {customers.length}
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Contact</th>
                <th className="py-3 px-6">Location</th>
                <th className="py-3 px-6">Driving License</th>
                <th className="py-3 px-6">Registered On</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-600">
                    Loading customer directory...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-600">
                    No customers match your query.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {c.first_name ? c.first_name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {c.first_name} {c.last_name}
                          </p>
                          <p className="text-[11px] text-gray-600">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-medium">{c.phone || 'N/A'}</td>
                    <td className="py-3.5 px-6">
                      {c.city || 'Bengaluru'}, {c.state || 'KA'}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-[11px] font-semibold text-gray-800">
                      {c.driving_license || 'Not Provided'}
                    </td>
                    <td className="py-3.5 px-6 text-gray-600">
                      {c.created_at ? formatDateTime(c.created_at) : 'Active'}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => openCustomerDetails(c)}
                        className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>History</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  {selectedCustomer.first_name} {selectedCustomer.last_name}
                </h3>
                <p className="text-xs text-gray-600">{selectedCustomer.email} • {selectedCustomer.phone}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <p className="font-bold text-gray-700">Driving License</p>
                <p className="font-mono text-gray-900">{selectedCustomer.driving_license || 'Not submitted'}</p>
                <p className="font-bold text-gray-700 pt-2">Address</p>
                <p className="text-gray-900">{selectedCustomer.address || 'Bengaluru, Karnataka'}</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 uppercase tracking-wider mb-2">
                  Rental & Booking Records
                </h4>
                {isLoadingHistory ? (
                  <p className="text-gray-600">Loading history...</p>
                ) : customerBookings.length === 0 ? (
                  <p className="text-gray-600 py-3 text-center bg-gray-50 rounded-xl">
                    No active or past bookings found for this customer.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {customerBookings.map((b) => (
                      <div
                        key={b.id}
                        className="p-3 rounded-xl border border-gray-100 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-gray-900">{b.booking_reference}</p>
                          <p className="text-[11px] text-gray-600">
                            {formatDateTime(b.pickup_datetime)} • {b.total_days} Days
                          </p>
                        </div>
                        <span className="font-bold text-teal-700">
                          ₹{Number(b.total_amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedCustomer(null)}
              className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
