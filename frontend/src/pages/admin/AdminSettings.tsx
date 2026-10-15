import React, { useState } from 'react';
import { Settings, Shield, Database, Save, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [taxRate, setTaxRate] = useState(18);
  const [defaultDeposit, setDefaultDeposit] = useState(5000);
  const [currency, setCurrency] = useState('INR (₹)');
  const [minRentalHours, setMinRentalHours] = useState(24);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('System configuration saved successfully!');
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          System Configuration & Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Tune operational parameters, taxation policies, and fleet defaults.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-5 text-xs">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">
              Operational Fleet Rules
            </h2>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-700">Currency & Symbol</label>
              <input
                type="text"
                disabled
                value={currency}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-semibold cursor-not-allowed"
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

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm transition-colors"
            >
              Save Configuration
            </button>
          </form>
        </div>

        {/* Database & Environment Info */}
        <div className="space-y-6 text-xs">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
              <Database className="w-4 h-4 text-teal-600" />
              <span>Database Status</span>
            </div>
            <div className="space-y-1.5 text-gray-600">
              <p>Engine: <strong>MySQL 8.0.46</strong></p>
              <p>Schema: <strong>vektor_rentals</strong></p>
              <p>Tables: <strong>15 normalized tables</strong></p>
              <p>Character Set: <strong>utf8mb4_unicode_ci</strong></p>
              <p className="text-emerald-600 font-bold flex items-center gap-1 pt-1">
                <CheckCircle className="w-3.5 h-3.5" /> Persistent connection active
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Security & Roles</span>
            </div>
            <div className="space-y-1.5 text-gray-600">
              <p>JWT Algorithm: <strong>HS256 (7d expiry)</strong></p>
              <p>Password Hash: <strong>Bcrypt (Salt 10)</strong></p>
              <p>RBAC: <strong>Admin, Manager, Agent, Customer</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
