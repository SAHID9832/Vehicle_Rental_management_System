import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({
  label,
  text,
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  const displayText = text || label || 'Loading...';
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-14 h-14 border-4',
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center py-12 space-y-3 ${className}`}>
      <div
        className={`${sizeClasses} border-teal-600 border-t-transparent rounded-full animate-spin`}
      />
      {displayText && <p className="text-xs font-medium text-gray-500 animate-pulse">{displayText}</p>}
    </div>
  );
}
