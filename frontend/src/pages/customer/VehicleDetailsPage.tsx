import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Car,
  MapPin,
  Users,
  Fuel,
  Gauge,
  Shield,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Cpu,
} from 'lucide-react';
import { vehiclesApi } from '../../services/api';
import { Vehicle } from '../../types';
import { formatINR, getStatusColor, getVehicleImageUrl, getVehicleImageViews } from '../../utils';
import { evaluateRentalCost } from '../../dsa/Stack';

export default function VehicleDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Interactive Rental Days Estimate Calculator
  const [estimateDays, setEstimateDays] = useState(3);

  useEffect(() => {
    async function loadVehicle() {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await vehiclesApi.getById(Number(id));
        setVehicle(res.data.data);
      } catch (err) {
        console.error('Failed to load vehicle details:', err);
        setErrorMsg('Vehicle details could not be found.');
      } finally {
        setIsLoading(false);
      }
    }
    loadVehicle();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mx-auto"></div>
        <p className="text-sm text-gray-600 mt-4">Loading vehicle specifications...</p>
      </div>
    );
  }

  if (!vehicle || errorMsg) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-black text-gray-900">Vehicle Not Found</h2>
        <p className="text-sm text-gray-600">The requested vehicle record could not be loaded.</p>
        <Link
          to="/vehicles"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Fleet Catalog</span>
        </Link>
      </div>
    );
  }

  const isAvailable = vehicle.status === 'Available';
  const defaultImage = getVehicleImageUrl(vehicle);
  const availableViews = getVehicleImageViews(vehicle);

  // Evaluate cost using Stack DSA
  const costEval = evaluateRentalCost(estimateDays, Number(vehicle.daily_rate), 0, 0);

  // Features list safe parse
  let features: string[] = [];
  try {
    if (Array.isArray(vehicle.features)) {
      features = vehicle.features;
    } else if (typeof vehicle.features === 'string') {
      features = JSON.parse(vehicle.features);
    }
  } catch {
    features = ['AC', 'Airbags', 'ABS', 'Touchscreen Infotainment'];
  }

  const currentDisplayImage =
    availableViews.length > 0 && availableViews[selectedImageIndex]
      ? availableViews[selectedImageIndex].path
      : defaultImage;

  const currentViewMeta =
    availableViews.length > 0 && availableViews[selectedImageIndex]
      ? availableViews[selectedImageIndex]
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <Link to="/" className="hover:text-teal-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link to="/vehicles" className="hover:text-teal-600">Vehicles</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-semibold text-gray-900">{vehicle.name}</span>
      </div>

      {/* Main Grid: Details & Booking Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Photography & Specifications */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Visual & Multi-View Carousel */}
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xs relative">
            <div className="h-96 sm:h-[450px] bg-slate-100 relative overflow-hidden group">
              <img
                src={currentDisplayImage}
                alt={vehicle.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const fallback = getVehicleImageUrl({
                    name: vehicle.name,
                    brand: vehicle.brand,
                    model: vehicle.model,
                    category_name: vehicle.category_name,
                  });
                  if (target.src !== fallback) {
                    target.src = fallback;
                  } else {
                    target.src =
                      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80';
                  }
                }}
              />

              <div className="absolute top-4 left-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md ${getStatusColor(
                    vehicle.status
                  )}`}
                >
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {vehicle.status}
                </span>
              </div>

              <div className="absolute top-4 right-4 flex items-center gap-2">
                {currentViewMeta?.view && (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-teal-900/80 text-teal-200 backdrop-blur-md">
                    {currentViewMeta.view} View
                  </span>
                )}
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900/80 text-white backdrop-blur-md">
                  {vehicle.vehicle_id}
                </span>
              </div>
            </div>

            {/* Multi-angle Thumbnail Bar */}
            {availableViews.length > 1 && (
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3 overflow-x-auto">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 pl-1">
                  Angles ({availableViews.length}):
                </span>
                {availableViews.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all shrink-0 w-20 h-14 ${
                      selectedImageIndex === i
                        ? 'border-teal-600 ring-2 ring-teal-600/30 scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={v.path} alt={v.view} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[10px] text-white font-semibold text-center capitalize py-0.5">
                      {v.view}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Attribution note if available */}
            {currentViewMeta?.attribution && (
              <div className="px-6 py-2 bg-slate-50 text-[11px] text-gray-500 border-t border-gray-100 flex items-center justify-between">
                <span>Photo: {currentViewMeta.attribution}</span>
                {currentViewMeta.license && <span>License: {currentViewMeta.license}</span>}
              </div>
            )}

            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                    {vehicle.category_name} • {vehicle.brand}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {vehicle.name}
                  </h1>
                </div>
                {vehicle.branch_name && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    <span>Stationed at {vehicle.branch_name}</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">{vehicle.description}</p>
            </div>
          </div>

          {/* Specifications Grid */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
            <h2 className="text-lg font-black text-gray-900 tracking-tight">Technical Specifications</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <Users className="w-5 h-5 text-teal-600 mb-2" />
                <span className="text-[11px] text-gray-600 block">Seating Capacity</span>
                <span className="text-base font-bold text-gray-900">{vehicle.seating_capacity} Persons</span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <Fuel className="w-5 h-5 text-teal-600 mb-2" />
                <span className="text-[11px] text-gray-600 block">Fuel Type</span>
                <span className="text-base font-bold text-gray-900">{vehicle.fuel_type}</span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <Gauge className="w-5 h-5 text-teal-600 mb-2" />
                <span className="text-[11px] text-gray-600 block">Transmission</span>
                <span className="text-base font-bold text-gray-900">{vehicle.transmission}</span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <Sparkles className="w-5 h-5 text-teal-600 mb-2" />
                <span className="text-[11px] text-gray-600 block">Mileage / Range</span>
                <span className="text-base font-bold text-gray-900">{vehicle.mileage} km/l</span>
              </div>
            </div>

            {/* Features Chips */}
            <div className="pt-2">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                Key Vehicle Features
              </h3>
              <div className="flex flex-wrap gap-2">
                {features.map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-100"
                  >
                    <CheckCircle className="w-3 h-3 text-teal-600" />
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Rental Policies & Security */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h2 className="text-lg font-black text-gray-900 tracking-tight">Rental Terms & Security Policy</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600 leading-relaxed">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <p className="font-bold text-gray-900">Security Deposit</p>
                <p>
                  A fully refundable deposit of {formatINR(Number(vehicle.security_deposit || 5000))} is
                  pre-authorized at pickup and returned within 2 hours of vehicle drop-off.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <p className="font-bold text-gray-900">Valid Identification</p>
                <p>
                  Must hold an unexpired Indian Driving License (minimum 1 year holding) and original Aadhaar / Passport.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Pricing Breakdown & Booking Action */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xl sticky top-24 space-y-6">
            <div>
              <span className="text-xs text-gray-600 block">Daily Standard Tariff</span>
              <div className="text-3xl font-black text-gray-900 mt-1">
                {formatINR(Number(vehicle.daily_rate))}
                <span className="text-xs font-normal text-gray-600"> /24hr day</span>
              </div>
            </div>

            {/* Interactive Quick Estimate Simulator */}
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-teal-900">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-teal-600" />
                  Stack Evaluator Estimate
                </span>
                <span>{estimateDays} Days</span>
              </div>

              <input
                type="range"
                min="1"
                max="14"
                value={estimateDays}
                onChange={(e) => setEstimateDays(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />

              <div className="text-[11px] text-teal-800 space-y-1 pt-1 border-t border-teal-200/60">
                <div className="flex justify-between">
                  <span>{estimateDays} days × {formatINR(Number(vehicle.daily_rate))}</span>
                  <span>{formatINR(costEval.breakdown.subtotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-teal-950 pt-1">
                  <span>Estimated Total</span>
                  <span>{formatINR(costEval.result)}</span>
                </div>
              </div>
            </div>

            {/* Rates Table */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100 text-gray-600">
                <span>Weekly Rate (7+ Days)</span>
                <span className="font-bold text-gray-900">{formatINR(Number(vehicle.weekly_rate || vehicle.daily_rate * 6))}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 text-gray-600">
                <span>Monthly Rate (30+ Days)</span>
                <span className="font-bold text-gray-900">{formatINR(Number(vehicle.monthly_rate || vehicle.daily_rate * 22))}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 text-gray-600">
                <span>Refundable Deposit</span>
                <span className="font-bold text-emerald-600">{formatINR(Number(vehicle.security_deposit || 5000))}</span>
              </div>
            </div>

            {/* Action CTA */}
            {isAvailable ? (
              <button
                onClick={() => navigate(`/booking/${vehicle.id}`)}
                className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-sm shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <span>Proceed to Reserve Vehicle</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  disabled
                  className="w-full py-4 rounded-2xl bg-gray-100 text-gray-400 font-bold text-sm text-center cursor-not-allowed"
                >
                  Currently {vehicle.status}
                </button>
                <p className="text-[11px] text-center text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  This vehicle is currently rented or reserved. Please choose another vehicle or check alternative hubs.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
