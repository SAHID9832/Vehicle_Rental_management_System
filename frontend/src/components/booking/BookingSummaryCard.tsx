import React from 'react';
import { Calendar, Shield, CreditCard } from 'lucide-react';
import { Vehicle } from '../../types';
import { formatINR, formatDateTime, getVehicleImageUrl } from '../../utils';

interface BookingSummaryCardProps {
  vehicle: Vehicle;
  pickupDateTime: string;
  returnDateTime: string;
  totalDays: number;
  subtotal: number;
  discount?: number;
  additionalCharges?: number;
  totalAmount: number;
}

export default function BookingSummaryCard({
  vehicle,
  pickupDateTime,
  returnDateTime,
  totalDays,
  subtotal,
  discount = 0,
  additionalCharges = 0,
  totalAmount,
}: BookingSummaryCardProps) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
        <img
          src={getVehicleImageUrl(vehicle)}
          alt={vehicle.name}
          className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-gray-100 shadow-xs"
        />
        <div>
          <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wide">
            {vehicle.category_name}
          </span>
          <h3 className="text-base font-bold text-gray-900">{vehicle.name}</h3>
          <p className="text-xs text-gray-500">
            {vehicle.brand} • {vehicle.fuel_type} • {vehicle.transmission}
          </p>
        </div>
      </div>

      {/* Date Overview */}
      <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-50 text-xs">
        <div>
          <span className="text-gray-500 block text-[11px]">Pickup</span>
          <span className="font-bold text-gray-900">
            {pickupDateTime ? formatDateTime(pickupDateTime) : 'Not selected'}
          </span>
        </div>
        <div>
          <span className="text-gray-500 block text-[11px]">Return</span>
          <span className="font-bold text-gray-900">
            {returnDateTime ? formatDateTime(returnDateTime) : 'Not selected'}
          </span>
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-2 text-xs border-b border-gray-100 pb-5">
        <div className="flex justify-between text-gray-600">
          <span>
            Tariff ({totalDays} {totalDays === 1 ? 'day' : 'days'} × {formatINR(Number(vehicle.daily_rate))})
          </span>
          <span className="font-semibold text-gray-900">{formatINR(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Special Promotional Discount</span>
            <span className="font-semibold">-{formatINR(discount)}</span>
          </div>
        )}

        {additionalCharges > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Insurance & Platform Fee</span>
            <span className="font-semibold text-gray-900">+{formatINR(additionalCharges)}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-600 pt-1">
          <span>Refundable Security Deposit</span>
          <span className="font-semibold text-gray-900">
            {formatINR(Number(vehicle.security_deposit || 5000))}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-baseline justify-between pt-1">
        <div>
          <span className="text-xs text-gray-500 block">Total Payable Now</span>
          <span className="text-2xl font-black text-gray-900">{formatINR(totalAmount)}</span>
        </div>
        <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
          Stack DSA Evaluated
        </span>
      </div>
    </div>
  );
}
