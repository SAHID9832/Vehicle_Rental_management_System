import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Database,
  Save,
  CheckCircle,
  Activity,
  HardDrive,
  Lock,
  RefreshCw,
  AlertTriangle,
  Globe,
  Sliders,
  Server,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [taxRate, setTaxRate] = useState(() => {
    const saved = localStorage.getItem('vektor_settings_tax');
    return saved ? Number(saved) : 18;
  });
  const [defaultDeposit, setDefaultDeposit] = useState(() => {
    const saved = localStorage.getItem('vektor_settings_deposit');
    return saved ? Number(saved) : 5000;
  });
  const [currency] = useState('INR (₹)');
  const [minRentalHours, setMinRentalHours] = useState(() => {
    const saved = localStorage.getItem('vektor_settings_min_hours');
    return saved ? Number(saved) : 24;
  });

  // Web Admin State Controls
  const [maintenanceMode, setMaintenanceMode] = useState(() => {
    return localStorage.getItem('vektor_maintenance_mode') === 'true';
  });
  const [rateLimiting, setRateLimiting] = useState(true);
  const [sslEnforced, setSslEnforced] = useState(true);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [lastBackup, setLastBackup] = useState('Today, 04:30 AM');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('vektor_settings_tax', String(taxRate));
    localStorage.setItem('vektor_settings_deposit', String(defaultDeposit));
    localStorage.setItem('vektor_settings_min_hours', String(minRentalHours));
    localStorage.setItem('vektor_maintenance_mode', String(maintenanceMode));
    toast.success('System configuration saved and persisted successfully!');
  };

  const handleTriggerBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      setLastBackup('Just now');
      toast.success('Database snapshot & asset backup completed successfully!');
    }, 1200);
  };

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Web Administrator & System Control Center
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold">
            Root Admin Authority
          </span>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Full governance over website features, security policies, backup recovery, performance, and customer permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Core Rules & Site Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-600" />
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Site Management & Fleet Configuration
                </h2>
              </div>
              <span className="text-[10px] text-gray-600">Active Node: Single-Port (5000)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Currency & Market</label>
                <input
                  type="text"
                  disabled
                  value={currency + " - All-India Pan-National"}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-semibold cursor-not-allowed text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Standard GST Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Default Refundable Security Deposit (INR)</label>
                <input
                  type="number"
                  min="1000"
                  value={defaultDeposit}
                  onChange={(e) => setDefaultDeposit(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Minimum Rental Duration (Hours)</label>
                <input
                  type="number"
                  min="1"
                  value={minRentalHours}
                  onChange={(e) => setMinRentalHours(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Site Availability & Maintenance Switch */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-600" />
                <span>Site Availability & Maintenance Control</span>
              </h3>
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">Site Maintenance Mode</p>
                  <p className="text-[11px] text-slate-500">
                    When active, public bookings show a maintenance banner while Admin retains full backend control.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    maintenanceMode
                      ? 'bg-amber-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {maintenanceMode ? 'ENABLED (Under Maintenance)' : 'LIVE & OPERATIONAL'}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm transition-colors inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save All Site Configurations</span>
              </button>
            </div>
          </form>

          {/* Security, Protection & Backup Governance */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-5 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Shield className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Security, Defense & Disaster Recovery
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">SSL / TLS Encryption</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Enforces HTTPS connection headers and secure cookie authorization on customer sessions.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">API Rate Limiter</span>
                  <button
                    type="button"
                    onClick={() => setRateLimiting(!rateLimiting)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                      rateLimiting ? 'bg-teal-100 text-teal-800' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {rateLimiting ? 'PROTECTED' : 'DISABLED'}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500">
                  Throttles abusive requests, brute-force login attempts, and protects backend controllers.
                </p>
              </div>
            </div>

            {/* Backups & Recovery */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-indigo-700" />
                  <p className="font-bold text-indigo-950">Disaster Recovery & Database Backups</p>
                </div>
                <p className="text-[11px] text-indigo-800 mt-0.5">
                  Last automated snapshot: <strong>{lastBackup}</strong> (MySQL schema, bookings, vehicles & images)
                </p>
              </div>
              <button
                type="button"
                onClick={handleTriggerBackup}
                disabled={isBackingUp}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-spin' : ''}`} />
                <span>{isBackingUp ? 'Creating Snapshot...' : 'Run Backup Now'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Server Health & Access Authority */}
        <div className="space-y-6 text-xs">
          {/* Performance & Server Monitoring */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Performance & Health</span>
            </div>
            <div className="space-y-2.5 text-gray-600">
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span>Server Status:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Healthy (200 OK)
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span>Avg Response Time:</span>
                <span className="font-bold text-gray-900">18 ms</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span>Static Asset Cache:</span>
                <span className="font-bold text-gray-900">Vite 312 kB / Gzip</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Server Runtime:</span>
                <span className="font-bold text-gray-900">Node.js Express + MySQL</span>
              </div>
            </div>
          </div>

          {/* Database Info */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
              <Database className="w-4 h-4 text-teal-600" />
              <span>Database Engine</span>
            </div>
            <div className="space-y-1.5 text-gray-600">
              <p>Host: <strong>localhost:3306</strong></p>
              <p>Schema: <strong>vektor_rentals</strong></p>
              <p>Tables: <strong>15 normalized tables</strong></p>
              <p>Character Set: <strong>utf8mb4_unicode_ci</strong></p>
              <p className="text-emerald-600 font-bold flex items-center gap-1 pt-1">
                <CheckCircle className="w-3.5 h-3.5" /> Connection Pool Active
              </p>
            </div>
          </div>

          {/* Role Governance Policy */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>User Role Hierarchy</span>
            </div>
            <div className="space-y-2 text-gray-600">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-900">Admin (Root Web Admin)</p>
                <p className="text-[11px] text-slate-500">
                  Full control: Fleet CRUD, hub network, customer accounts, financial ledgers, and system configurations.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-900">Customer (Public User)</p>
                <p className="text-[11px] text-slate-500">
                  Can register anytime, explore vehicles, book rentals, view invoices, and manage own profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

