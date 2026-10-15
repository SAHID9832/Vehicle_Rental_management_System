import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Users,
  CalendarCheck,
  KeyRound,
  TrendingUp,
  Receipt,
  Cpu,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { dashboardApi } from '../../services/api';
import { DashboardStats } from '../../types';
import { formatINR, formatDateTime, getStatusColor } from '../../utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      try {
        const res = await dashboardApi.getStats();
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="space-y-8">
        <div className="h-10 bg-slate-200 rounded-xl w-64 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-3xl border border-gray-100 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Visual Palette for charts
  const CATEGORY_COLORS = ['#0d9488', '#4f46e5', '#3b82f6', '#f59e0b', '#ec4899', '#10b981'];

  const categoryChartData = stats.bookingsByCategory?.map((c) => ({
    name: c.category,
    value: Number(c.count),
  })) || [
    { name: 'Car', value: 5 },
    { name: 'SUV', value: 4 },
    { name: 'Motorcycle', value: 3 },
  ];

  const monthlyChartData = stats.monthlyRevenue?.map((m) => ({
    name: m.month,
    revenue: Number(m.revenue),
    bookings: Number(m.bookings),
  })) || [
    { name: 'Jan', revenue: 12000, bookings: 3 },
    { name: 'Feb', revenue: 18000, bookings: 5 },
    { name: 'Mar', revenue: 24000, bookings: 7 },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Fleet Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Real-time analytics derived directly from MySQL database tables.
          </p>
        </div>

        <Link
          to="/admin/dsa-lab"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors"
        >
          <Cpu className="w-4 h-4" />
          <span>Launch DSA Lab</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Fleet */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
              Total Fleet
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {stats.totalVehicles}
            </span>
            <div className="flex items-center gap-2 text-[10px] text-teal-700 font-semibold mt-1">
              <span>{stats.availableVehicles} Available</span>
              <span>•</span>
              <span>{stats.rentedVehicles} On Road</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Car className="w-6 h-6" />
          </div>
        </div>

        {/* Active Rentals */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
              Active Rentals
            </span>
            <span className="text-2xl font-black text-indigo-900 mt-1 block">
              {stats.activeRentals}
            </span>
            <p className="text-[10px] text-gray-600 mt-1">Currently checked out</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <KeyRound className="w-6 h-6" />
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
              Total Bookings
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {stats.totalBookings}
            </span>
            <p className="text-[10px] text-gray-600 mt-1">Across all Bengaluru hubs</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Gross Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
              Gross Revenue
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {formatINR(Number(stats.totalRevenue || 0))}
            </span>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">Paid Invoices (INR)</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Fleet Status Breakdown Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <div>
            <span className="text-xs text-gray-600 block">Available</span>
            <span className="text-lg font-black text-gray-900">{stats.availableVehicles} Vehicles</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <div>
            <span className="text-xs text-gray-600 block">Rented</span>
            <span className="text-lg font-black text-gray-900">{stats.rentedVehicles} Vehicles</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <div>
            <span className="text-xs text-gray-600 block">Reserved</span>
            <span className="text-lg font-black text-gray-900">{stats.reservedVehicles || 0} Vehicles</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <div>
            <span className="text-xs text-gray-600 block">Maintenance</span>
            <span className="text-lg font-black text-gray-900">{stats.maintenanceVehicles || 0} Vehicles</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Revenue & Booking Trends</h2>
            <span className="text-xs text-gray-600">Last 6 Months (INR)</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#0d9488" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-gray-900">Bookings by Category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Recent Booking Activity</h2>
          <Link
            to="/admin/bookings"
            className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-6">Reference</th>
                <th className="py-3 px-6">Vehicle</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Dates</th>
                <th className="py-3 px-6">Tariff</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.slice(0, 5).map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-gray-900">{b.booking_reference}</td>
                    <td className="py-3.5 px-6 font-semibold">{b.vehicle_name || 'Vehicle'}</td>
                    <td className="py-3.5 px-6">{b.customer_name || 'Customer'}</td>
                    <td className="py-3.5 px-6 text-gray-600">
                      {formatDateTime(b.pickup_datetime)}
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-600">
                    No recent booking activity recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
