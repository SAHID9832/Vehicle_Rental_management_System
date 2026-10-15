import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Car,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { vehiclesApi, branchesApi } from '../../services/api';
import { Vehicle, Branch, VehicleCategory } from '../../types';
import VehicleCard from '../../components/vehicles/VehicleCard';
import { formatINR } from '../../utils';
import { sortVehiclesByPrice } from '../../dsa/mergeSort';
import { linearSearch } from '../../dsa/searching';

export default function BrowseVehiclesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBranch, setSelectedBranch] = useState(searchParams.get('branch') || '');
  const [selectedFuel, setSelectedFuel] = useState('');
  const [selectedTransmission, setSelectedTransmission] = useState('');
  const [selectedSeats, setSelectedSeats] = useState<number | ''>('');
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(15000);

  // DSA Sort metadata
  const [mergeSortInfo, setMergeSortInfo] = useState<{
    comparisons: number;
    passes: number;
    active: boolean;
  }>({ comparisons: 0, passes: 0, active: false });

  // Load initial catalog & filter options
  useEffect(() => {
    async function initCatalog() {
      setIsLoading(true);
      try {
        const [vehRes, branchRes, catRes] = await Promise.all([
          vehiclesApi.getAll({ limit: 100 }), // fetch full catalog for client DSA sorting & filtering
          branchesApi.getAll(),
          vehiclesApi.getCategories(),
        ]);

        const allVehicles = vehRes.data.data?.data || vehRes.data.data || [];
        setVehicles(allVehicles);
        setBranches(branchRes.data.data || []);
        setCategories(catRes.data.data || []);
      } catch (err) {
        console.error('Failed to load fleet catalog:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initCatalog();
  }, []);

  // Filter and DSA Sort pipeline
  const filteredVehicles = useMemo(() => {
    let result = [...vehicles];

    // 1. Text Search using Linear Search algorithm
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.vehicle_id.toLowerCase().includes(q)
      );
    }

    // 2. Category filter
    if (selectedCategory) {
      result = result.filter(
        (v) =>
          v.category_name?.toLowerCase() === selectedCategory.toLowerCase() ||
          String(v.category_id) === selectedCategory
      );
    }

    // 3. Branch filter
    if (selectedBranch) {
      result = result.filter((v) => String(v.branch_id) === selectedBranch);
    }

    // 4. Fuel type
    if (selectedFuel) {
      result = result.filter((v) => v.fuel_type === selectedFuel);
    }

    // 5. Transmission
    if (selectedTransmission) {
      result = result.filter((v) => v.transmission === selectedTransmission);
    }

    // 6. Seating capacity
    if (selectedSeats) {
      result = result.filter((v) => v.seating_capacity >= selectedSeats);
    }

    // 7. Max price filter
    if (maxPrice < 15000) {
      result = result.filter((v) => Number(v.daily_rate) <= maxPrice);
    }

    // 8. Availability status
    if (onlyAvailable) {
      result = result.filter((v) => v.status === 'Available');
    }

    // 9. Custom Merge Sort execution
    if (priceSort === 'asc' || priceSort === 'desc') {
      const sortResult = sortVehiclesByPrice(result, priceSort);
      result = sortResult.sorted;
    }

    return result;
  }, [
    vehicles,
    searchQuery,
    selectedCategory,
    selectedBranch,
    selectedFuel,
    selectedTransmission,
    selectedSeats,
    maxPrice,
    onlyAvailable,
    priceSort,
  ]);

  // Handle Sort button click with Merge Sort metadata update
  const handleSortChange = (order: 'asc' | 'desc') => {
    if (priceSort === order) {
      setPriceSort('none');
      setMergeSortInfo({ comparisons: 0, passes: 0, active: false });
    } else {
      setPriceSort(order);
      const res = sortVehiclesByPrice(filteredVehicles, order);
      setMergeSortInfo({
        comparisons: res.comparisons,
        passes: res.passes,
        active: true,
      });
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBranch('');
    setSelectedFuel('');
    setSelectedTransmission('');
    setSelectedSeats('');
    setPriceSort('none');
    setOnlyAvailable(false);
    setMaxPrice(15000);
    setSearchParams({});
    setMergeSortInfo({ comparisons: 0, passes: 0, active: false });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Browse Fleet Vehicles</h1>
          <p className="text-sm text-gray-600 mt-1">
            Search, filter, and sort all available vehicles across Bengaluru hubs.
          </p>
        </div>

        {/* DSA Merge Sort Notification Badge */}
        {mergeSortInfo.active && (
          <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-800 text-xs px-3.5 py-2 rounded-xl">
            <Cpu className="w-4 h-4 text-teal-600" />
            <span>
              <strong>Merge Sort:</strong> {mergeSortInfo.comparisons} comparisons, {mergeSortInfo.passes} merge passes • O(n log n)
            </span>
          </div>
        )}
      </div>

      {/* Main Filter and Catalog Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 font-bold text-gray-900 text-base">
                <SlidersHorizontal className="w-4 h-4 text-teal-600" />
                <span>Filters</span>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs text-gray-600 hover:text-red-600 flex items-center gap-1 font-medium transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Keyword Search */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Vehicle Search
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Swift, Creta, Fortuner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Hub / Branch */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Bengaluru Hub
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="">All Hubs</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Daily Price Range */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                <span>Max Daily Rate</span>
                <span className="text-teal-600 font-extrabold">{formatINR(maxPrice)}/day</span>
              </div>
              <input
                type="range"
                min="500"
                max="15000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-gray-600 font-medium">
                <span>₹500</span>
                <span>₹15,000+</span>
              </div>
            </div>

            {/* Fuel Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Fuel Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Petrol', 'Diesel', 'Electric', 'CNG'].map((fuel) => (
                  <button
                    key={fuel}
                    type="button"
                    onClick={() => setSelectedFuel(selectedFuel === fuel ? '' : fuel)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      selectedFuel === fuel
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {fuel}
                  </button>
                ))}
              </div>
            </div>

            {/* Transmission */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Transmission
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Manual', 'Automatic'].map((trans) => (
                  <button
                    key={trans}
                    type="button"
                    onClick={() => setSelectedTransmission(selectedTransmission === trans ? '' : trans)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      selectedTransmission === trans
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {trans}
                  </button>
                ))}
              </div>
            </div>

            {/* Seating Capacity */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Min Seating
              </label>
              <div className="flex gap-2">
                {[2, 5, 7, 8].map((seats) => (
                  <button
                    key={seats}
                    type="button"
                    onClick={() => setSelectedSeats(selectedSeats === seats ? '' : seats)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedSeats === seats
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {seats}+
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Checkbox */}
            <label className="flex items-center gap-2.5 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600"
              />
              <span className="text-xs font-bold text-gray-800">Only Available Vehicles</span>
            </label>
          </div>
        </div>

        {/* Vehicle Catalog Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Controls Bar: Sort, Count */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-bold text-gray-900">{filteredVehicles.length}</span> vehicles
            </div>

            {/* DSA Merge Sort Controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-teal-600" />
                Merge Sort:
              </span>
              <button
                onClick={() => handleSortChange('asc')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  priceSort === 'asc'
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Price: Low to High ↑
              </button>
              <button
                onClick={() => handleSortChange('desc')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  priceSort === 'desc'
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Price: High to Low ↓
              </button>
            </div>
          </div>

          {/* Vehicle Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-white rounded-2xl border border-gray-100 animate-pulse"></div>
              ))}
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 text-gray-400 flex items-center justify-center">
                <Car className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No Vehicles Match Your Criteria</h3>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                Try widening your price range, clearing some category filters, or selecting another pickup hub.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
