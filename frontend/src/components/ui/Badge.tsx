import React from 'react';
import { getStatusColor } from '../../utils';

interface BadgeProps {
  status: string;
  className?: string;
  showDot?: boolean;
}

export default function Badge({ status, className = '', showDot = true }: BadgeProps) {
  const colorClasses = getStatusColor(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${colorClasses} ${className}`}
    >
      {showDot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      <span>{status}</span>
    </span>
  );
}
