import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface RevenueChartProps {
  data: Array<{ name: string; revenue: number; bookings?: number }>;
  height?: number;
}

export default function RevenueChart({ data, height = 250 }: RevenueChartProps) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip
            formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
            contentStyle={{
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="revenue" fill="#0d9488" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
