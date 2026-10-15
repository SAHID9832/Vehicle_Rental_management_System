import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Users,
  CalendarCheck,
  KeyRound,
  MapPin,
  Wrench,
  Receipt,
  Cpu,
  Settings,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Fleet Inventory', path: '/admin/vehicles', icon: Car },
    { name: 'Customer Directory', path: '/admin/customers', icon: Users },
    { name: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
    { name: 'Rentals & Returns', path: '/admin/rentals', icon: KeyRound },
    { name: 'Hubs & Network Graph', path: '/admin/branches', icon: MapPin },
    { name: 'Maintenance Logs', path: '/admin/maintenance', icon: Wrench },
    { name: 'Billing & Invoices', path: '/admin/invoices', icon: Receipt },
    { name: 'DSA Algorithm Lab', path: '/admin/dsa-lab', icon: Cpu, highlight: true },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shrink-0">
      {/* Brand header */}
      <div className="p-5 border-b border-slate-800">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white font-bold">
            <Car className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-lg font-black tracking-tight text-white">VEKTOR</span>
              <span className="text-lg font-light tracking-tight text-teal-400">ADMIN</span>
            </div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Fleet Operations
            </p>
          </div>
        </Link>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white font-semibold shadow-sm shadow-teal-600/30'
                    : item.highlight
                    ? 'text-teal-400 hover:bg-slate-800 hover:text-teal-300 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
              {item.highlight && (
                <span className="ml-auto text-[10px] uppercase bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-bold">
                  DSA
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom user footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-800 text-teal-200 flex items-center justify-center font-bold text-xs">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate w-32">{user?.name}</p>
              <p className="text-[10px] text-teal-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <Link
          to="/"
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Customer Site
        </Link>
      </div>
    </aside>
  );
}
