import React, { useState, useEffect } from 'react';
import {
  Car,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Eye,
  ArrowUpDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { vehiclesApi, branchesApi } from '../../services/api';
import { Vehicle, Branch, VehicleCategory } from '../../types';
import { formatINR, getStatusColor, getVehicleImageUrl } from '../../utils';

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortPrice, setSortPrice] = useState<'asc' | 'desc' | ''>('');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    vehicle_id: '',
    name: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    category_id: 1,
    branch_id: 1,
    color: 'Pearl White',
    fuel_type: 'Petrol',
    transmission: 'Manual',
    seating_capacity: 5,
    daily_rate: 1000,
    weekly_rate: 6000,
    monthly_rate: 22000,
    security_deposit: 5000,
    image_url: '/assets/vehicles/swift.jpg',
    description: '',
    features: ['AC', 'Power Windows', 'Airbags'],
    status: 'Available',
    mileage: 20,
    engine_cc: 1197,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [vehRes, branchRes, catRes] = await Promise.all([
        vehiclesApi.getAll({ limit: 100 }),
        branchesApi.getAll(),
        vehiclesApi.getCategories(),
      ]);

      setVehicles(vehRes.data.data?.data || vehRes.data.data || []);
      setBranches(branchRes.data.data || []);
      setCategories(catRes.data.data || []);
    } catch (err) {
      console.error('Failed to load fleet inventory:', err);
      toast.error('Failed to load vehicle list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingVehicle(null);
    setFormData({
      vehicle_id: `VKT-NEW-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      brand: 'Maruti Suzuki',
      model: '',
      year: new Date().getFullYear(),
      category_id: categories[0]?.id || 1,
      branch_id: branches[0]?.id || 1,
      color: 'White',
      fuel_type: 'Petrol',
      transmission: 'Manual',
      seating_capacity: 5,
      daily_rate: 1200,
      weekly_rate: 7500,
      monthly_rate: 25000,
      security_deposit: 5000,
      image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
      description: 'Well-maintained rental vehicle for Bengaluru city and outstation trips.',
      features: ['AC', 'Airbags', 'Power Steering'],
      status: 'Available',
      mileage: 20,
      engine_cc: 1200,
    });
    setModalOpen(true);
  };

  const openEditModal = (v: Vehicle) => {
    setEditingVehicle(v);
    setFormData({
      vehicle_id: v.vehicle_id,
      name: v.name,
      brand: v.brand,
      model: v.model,
      year: v.year,
      category_id: v.category_id,
      branch_id: v.branch_id,
      color: v.color || 'White',
      fuel_type: v.fuel_type,
      transmission: v.transmission,
      seating_capacity: v.seating_capacity,
      daily_rate: Number(v.daily_rate),
      weekly_rate: Number(v.weekly_rate || v.daily_rate * 6),
      monthly_rate: Number(v.monthly_rate || v.daily_rate * 22),
      security_deposit: Number(v.security_deposit || 5000),
      image_url: v.image_url || '',
      description: v.description || '',
      features: Array.isArray(v.features) ? v.features : ['AC'],
      status: v.status,
      mileage: Number(v.mileage || 18),
      engine_cc: Number(v.engine_cc || 1200),
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await vehiclesApi.update(editingVehicle.id, formData);
        toast.success('Vehicle details updated successfully!');
      } else {
        await vehiclesApi.create(formData);
        toast.success('New vehicle added to fleet!');
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save vehicle details.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to decommission / deactivate this vehicle?')) return;
    try {
      await vehiclesApi.delete(id);
      toast.success('Vehicle status set to Inactive.');
      loadData();
    } catch (err) {
      toast.error('Failed to deactivate vehicle.');
    }
  };

  // Filtered List
  const displayVehicles = vehicles
    .filter((v) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        v.name.toLowerCase().includes(q) ||
        v.vehicle_id.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q);
      const matchStatus = !statusFilter || v.status === statusFilter;
      const matchCat = !categoryFilter || v.category_name === categoryFilter;
      return matchSearch && matchStatus && matchCat;
    })
    .sort((a, b) => {
      if (sortPrice === 'asc') return Number(a.daily_rate) - Number(b.daily_rate);
      if (sortPrice === 'desc') return Number(b.daily_rate) - Number(a.daily_rate);
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Fleet Inventory Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Add, update, search, and manage availability across all {vehicles.length} fleet units.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Vehicle ID or Model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white text-gray-700"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Rented">Rented</option>
            <option value="Reserved">Reserved</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white text-gray-700"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Sort Price Button */}
          <button
            onClick={() =>
              setSortPrice(sortPrice === 'asc' ? 'desc' : sortPrice === 'desc' ? '' : 'asc')
            }
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              sortPrice
                ? 'bg-teal-50 border-teal-300 text-teal-800'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Price {sortPrice === 'asc' ? '↑ Low' : sortPrice === 'desc' ? '↓ High' : 'Sort'}</span>
          </button>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-6">ID & Vehicle</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Stationed Hub</th>
                <th className="py-3 px-6">Specs</th>
                <th className="py-3 px-6">Daily Tariff</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-600">
                    Loading inventory records...
                  </td>
                </tr>
              ) : displayVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-600">
                    No matching vehicles found.
                  </td>
                </tr>
              ) : (
                displayVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={getVehicleImageUrl(v)}
                          alt={v.name}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-200"
                        />
                        <div>
                          <p className="font-bold text-gray-900">{v.name}</p>
                          <p className="text-[11px] text-gray-600">{v.vehicle_id} • {v.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-semibold">{v.category_name}</td>
                    <td className="py-3.5 px-6 text-gray-600">{v.branch_name || 'Hub'}</td>
                    <td className="py-3.5 px-6 text-[11px] text-gray-600">
                      {v.seating_capacity} seats • {v.fuel_type} • {v.transmission}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-gray-900">
                      {formatINR(Number(v.daily_rate))}/day
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(
                          v.status
                        )}`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(v)}
                        className="p-1.5 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit vehicle"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Deactivate vehicle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Vehicle Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900">
                {editingVehicle ? 'Edit Vehicle Details' : 'Add New Vehicle to Fleet'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Vehicle Identifier / ID</label>
                  <input
                    type="text"
                    required
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Vehicle Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maruti Swift ZXi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Brand / Make</label>
                  <input
                    type="text"
                    required
                    placeholder="Maruti Suzuki, Toyota, Honda..."
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Swift, Innova, Creta..."
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Stationed Hub</label>
                  <select
                    value={formData.branch_id}
                    onChange={(e) => setFormData({ ...formData, branch_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Daily Rental Tariff (INR)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={formData.daily_rate}
                    onChange={(e) => setFormData({ ...formData, daily_rate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  >
                    <option value="Available">Available</option>
                    <option value="Rented">Rented</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Fuel Type</label>
                  <select
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="CNG">CNG</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Transmission</label>
                  <select
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Seating Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.seating_capacity}
                    onChange={(e) => setFormData({ ...formData, seating_capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Image URL</label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm transition-colors"
                >
                  {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
