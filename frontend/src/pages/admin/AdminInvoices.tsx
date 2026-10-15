import React, { useState, useEffect } from 'react';
import { Receipt, Search, Download, CreditCard, Eye, X, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { invoicesApi } from '../../services/api';
import { Invoice } from '../../types';
import { formatINR, formatDateTime, getStatusColor } from '../../utils';

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await invoicesApi.getAll();
      setInvoices(res.data.data?.data || res.data.data || []);
    } catch (err) {
      console.error('Failed to load invoices:', err);
      toast.error('Failed to load billing invoices.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleSimulatePayment = async (id: number) => {
    try {
      await invoicesApi.simulatePayment(id, 'Simulated UPI');
      toast.success('Invoice marked as Paid via simulated payment.');
      loadInvoices();
      if (selectedInvoice && selectedInvoice.id === id) {
        setSelectedInvoice({ ...selectedInvoice, payment_status: 'Paid' });
      }
    } catch (err) {
      toast.error('Failed to record payment.');
    }
  };

  const filteredInvoices = invoices.filter((i) => {
    const q = search.toLowerCase();
    return (
      i.invoice_number.toLowerCase().includes(q) ||
      i.booking_reference?.toLowerCase().includes(q) ||
      i.customer_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Billing & Invoices
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Audit rental invoices, tax breakdowns (18% GST), and simulated payment transactions.
          </p>
        </div>

        <div className="text-xs font-bold text-gray-700 bg-white border border-gray-100 shadow-xs px-4 py-2 rounded-xl">
          Total Invoices: {invoices.length}
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by invoice number or booking ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-6">Invoice Number</th>
                <th className="py-3 px-6">Booking Reference</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Subtotal</th>
                <th className="py-3 px-6">Taxes (GST)</th>
                <th className="py-3 px-6">Total Amount</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-600">
                    Loading invoice ledger...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-600">
                    No matching invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-gray-900">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-gray-700">
                      {inv.booking_reference || `Booking #${inv.booking_id}`}
                    </td>
                    <td className="py-3.5 px-6 font-semibold">
                      {inv.customer_name || `Customer #${inv.customer_id}`}
                    </td>
                    <td className="py-3.5 px-6 text-gray-600">
                      {formatINR(Number(inv.subtotal))}
                    </td>
                    <td className="py-3.5 px-6 text-gray-600">
                      {formatINR(Number(inv.tax_amount || 0))}
                    </td>
                    <td className="py-3.5 px-6 font-black text-gray-900">
                      {formatINR(Number(inv.total_amount))}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(
                          inv.payment_status
                        )}`}
                      >
                        {inv.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-[11px] transition-colors"
                      >
                        View
                      </button>
                      {inv.payment_status !== 'Paid' && (
                        <button
                          onClick={() => handleSimulatePayment(inv.id)}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[11px] transition-colors"
                        >
                          Mark Paid
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

      {/* Invoice Viewer Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-teal-600 uppercase">Tax Invoice</span>
                <h3 className="text-lg font-black text-gray-900">{selectedInvoice.invoice_number}</h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <span className="text-gray-600 block">Billed To</span>
                  <span className="font-bold text-gray-900">{selectedInvoice.customer_name}</span>
                </div>
                <div>
                  <span className="text-gray-600 block">Booking Reference</span>
                  <span className="font-mono font-bold text-gray-900">{selectedInvoice.booking_reference}</span>
                </div>
                <div>
                  <span className="text-gray-600 block">Issued Date</span>
                  <span>{formatDateTime(selectedInvoice.issued_at)}</span>
                </div>
                <div>
                  <span className="text-gray-600 block">Payment Status</span>
                  <span className="font-bold text-teal-700">{selectedInvoice.payment_status}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3">
                <div className="flex justify-between text-gray-600">
                  <span>Rental Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatINR(Number(selectedInvoice.subtotal))}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18% Tax)</span>
                  <span className="font-semibold text-gray-900">{formatINR(Number(selectedInvoice.tax_amount || 0))}</span>
                </div>
                <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total Amount</span>
                  <span className="text-teal-700">{formatINR(Number(selectedInvoice.total_amount))}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
