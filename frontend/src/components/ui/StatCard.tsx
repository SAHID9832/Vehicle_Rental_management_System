import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'teal' | 'indigo' | 'emerald' | 'amber' | 'slate';
  change?: string;
  isPositive?: boolean;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'teal',
  change,
  isPositive = true,
}: StatCardProps) {
  const colorMap = {
    teal: 'bg-teal-50 text-teal-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-100 text-slate-700',
  }[color];

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex items-center justify-between gap-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        {change && (
          <p
            className={`text-[11px] font-bold ${
              isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isPositive ? '↑' : '↓'} {change}
          </p>
        )}
      </div>

      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${colorMap}`}>
        <Icon className="w-6 h-6 stroke-[2]" />
      </div>
    </div>
  );
}
