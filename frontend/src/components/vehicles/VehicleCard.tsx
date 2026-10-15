import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Fuel, Gauge, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Vehicle } from '../../types';
import { formatINR, getStatusColor, getVehicleImageUrl } from '../../utils';

interface VehicleCardProps {
  vehicle: Vehicle;
  onBookNow?: (vehicle: Vehicle) => void;
}

export default function VehicleCard({ vehicle, onBookNow }: VehicleCardProps) {
  const isAvailable = vehicle.status === 'Available';

  const defaultImage = getVehicleImageUrl(vehicle);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
      {/* Top Image & Status */}
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        <img
          src={defaultImage}
          alt={vehicle.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80';
          }}
        />

        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${getStatusColor(
              vehicle.status
            )}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            {vehicle.status}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900/80 text-white backdrop-blur-md">
            {vehicle.vehicle_id}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Branch */}
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
            <span className="font-semibold text-teal-600 uppercase tracking-wide">
              {vehicle.category_name || 'Vehicle'}
            </span>
            {vehicle.branch_name && (
              <span className="flex items-center gap-1 truncate max-w-[150px]">
                <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                {vehicle.branch_name}
              </span>
            )}
          </div>

          {/* Name & Model */}
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-1">
            {vehicle.name}
          </h3>
          <p className="text-xs text-gray-600 mb-4">{vehicle.brand} • {vehicle.year}</p>

          {/* Specs Grid */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 mb-4 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{vehicle.seating_capacity} Seats</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{vehicle.fuel_type}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{vehicle.transmission}</span>
            </div>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <span className="text-xs text-gray-600">Daily Rental</span>
              <div className="text-xl font-black text-gray-900">
                {formatINR(Number(vehicle.daily_rate))}
                <span className="text-xs font-normal text-gray-600"> /day</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-gray-600 block">Deposit</span>
              <span className="text-xs font-semibold text-gray-700">
                {formatINR(Number(vehicle.security_deposit || 5000))}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/vehicles/${vehicle.id}`}
              className="w-full py-2.5 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold text-center transition-colors"
            >
              View Details
            </Link>

            {isAvailable ? (
              <Link
                to={`/booking/${vehicle.id}`}
                className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold text-center transition-colors shadow-sm shadow-teal-600/20 flex items-center justify-center gap-1.5"
              >
                <span>Book Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                disabled
                className="w-full py-2.5 px-3 rounded-xl bg-gray-100 text-gray-400 text-xs font-semibold text-center cursor-not-allowed"
              >
                Unavailable
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
