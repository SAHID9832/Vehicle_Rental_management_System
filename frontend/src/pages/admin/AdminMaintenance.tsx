import React, { useState, useEffect } from 'react';
import { Wrench, Plus, CheckCircle, Clock, AlertCircle, X, Car } from 'lucide-react';
import toast from 'react-hot-toast';
import { maintenanceApi, vehiclesApi } from '../../services/api';
import { MaintenanceRecord, Vehicle } from '../../types';
import { formatINR, formatDateTime, getStatusColor } from '../../utils';

export default function AdminMaintenance() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Maintenance Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_id: 1,
    maintenance_type: 'General Service',
    description: 'Periodic 10,000 km oil and filter replacement',
    cost: 3500,
    scheduled_date: new Date().toISOString().split('T')[0],
    performed_by: 'Authorized Service Centre',
    branch_id: 1,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [mRes, vRes] = await Promise.all([
        maintenanceApi.getAll(),
        vehiclesApi.getAll({ limit: 100 }),
      ]);
      setRecords(mRes.data.data?.data || mRes.data.data || []);
      setVehicles(vRes.data.data?.data || vRes.data.data || []);
    } catch (err) {
      console.error('Failed to load maintenance records:', err);
      toast.error('Failed to load maintenance records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await maintenanceApi.create(formData);
      toast.success('Maintenance scheduled! Vehicle status set to Maintenance.');
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to schedule maintenance.');
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await maintenanceApi.complete(id);
      toast.success('Maintenance marked completed! Vehicle restored to Available.');
      loadData();
    } catch (err) {
      toast.error('Failed to complete maintenance.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Fleet Maintenance Records
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Schedule vehicle servicing, track workshop expenses, and automatically manage vehicle readiness.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Schedule Service</span>
        </button>
      </div>

      {/* Maintenance Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-6">Vehicle</th>
                <th className="py-3 px-6">Service Type</th>
                <th className="py-3 px-6">Description</th>
                <th className="py-3 px-6">Scheduled Date</th>
                <th className="py-3 px-6">Cost</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-600">
                    Loading maintenance logs...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-600">
                    No maintenance records found.
                  </td>
                </tr>
              ) : (
                records.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-gray-900">
                      {m.vehicle_name || `Vehicle #${m.vehicle_id}`}
                    </td>
                    <td className="py-3.5 px-6 font-semibold">{m.maintenance_type}</td>
                    <td className="py-3.5 px-6 text-gray-600 max-w-xs truncate">{m.description}</td>
                    <td className="py-3.5 px-6 text-gray-600">{m.scheduled_date}</td>
                    <td className="py-3.5 px-6 font-bold text-gray-900">{formatINR(Number(m.cost))}</td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(
                          m.status
                        )}`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      {m.status !== 'Completed' && (
                        <button
                          onClick={() => handleComplete(m.id)}
                          className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs transition-colors"
                        >
                          Mark Completed
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

      {/* Schedule Service Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-black text-gray-900">Schedule Fleet Maintenance</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Select Vehicle</label>
                <select
                  value={formData.vehicle_id}
                  onChange={(e) => setFormData({ ...formData, vehicle_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.vehicle_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Maintenance Type</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brake Pad Replacement, Oil Change"
                  value={formData.maintenance_type}
                  onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Estimated Cost (INR)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Scheduled Date</label>
                <input
                  type="date"
                  required
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Description / Workshop Notes</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-sm"
              >
                Schedule & Update Vehicle Status
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
