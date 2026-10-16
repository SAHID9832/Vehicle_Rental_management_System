import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { linearSearch, binarySearch } from '../../dsa/searching';
import { sortVehiclesByPrice } from '../../dsa/mergeSort';

interface Phase3SearchSortTabProps {
  rawVehicles: any[];
}

export const Phase3SearchSortTab: React.FC<Phase3SearchSortTabProps> = ({ rawVehicles }) => {
  const [searchTarget, setSearchTarget] = useState('Swift');
  const [searchMethod, setSearchMethod] = useState<'linear' | 'binary'>('linear');
  const [searchOutput, setSearchOutput] = useState<any | null>(null);

  const [mergeSortOrder, setMergeSortOrder] = useState<'asc' | 'desc'>('asc');
  const [mergeSortOutput, setMergeSortOutput] = useState<any | null>(null);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 3A & 3B. Linear Search vs Binary Search */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
              Phase 3A & 3B • Search Algorithms
            </span>
            <h2 className="text-lg font-black text-gray-900">
              Linear Search O(n) vs. Binary Search O(log n)
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full w-fit">
            Linear: O(n) • Binary: O(log n)
          </span>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          Demonstrates vehicle record location. <strong>Linear Search</strong> checks elements sequentially. <strong>Binary Search</strong> operates over a sorted array of vehicle keys, halving the search space each step.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search Target (e.g. Swift, Innova, 6)"
            value={searchTarget}
            onChange={(e) => setSearchTarget(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />

          <div className="flex rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => setSearchMethod('linear')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                searchMethod === 'linear' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
              }`}
            >
              Linear O(n)
            </button>
            <button
              onClick={() => setSearchMethod('binary')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                searchMethod === 'binary' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
              }`}
            >
              Binary O(log n)
            </button>
          </div>

          <button
            onClick={() => {
              if (searchMethod === 'linear') {
                const res = linearSearch(rawVehicles, searchTarget, 'name');
                setSearchOutput(res);
              } else {
                // Sort vehicles first by ID for binary search
                const sortedVehicles = [...rawVehicles].sort((a, b) => a.id - b.id);
                const targetKey = parseInt(searchTarget) || 1;
                const res = binarySearch(sortedVehicles, targetKey, 'id');
                setSearchOutput(res);
              }
              toast.success(`Search completed using ${searchMethod} method`);
            }}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-sm"
          >
            Execute Search
          </button>
        </div>

        {/* Search Trace Result */}
        {searchOutput && (
          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
              <span className="font-bold text-gray-900">
                Result: {searchOutput.found ? 'MATCH FOUND ✓' : 'NOT FOUND ✗'}
              </span>
              <span className="font-bold text-teal-700">
                Total Comparisons: {searchOutput.comparisons}
              </span>
              <span className="font-mono text-gray-600 text-[11px]">
                Complexity: {searchOutput.timeComplexity}
              </span>
            </div>

            <div className="space-y-1 max-h-48 overflow-y-auto">
              {searchOutput.steps.map((st: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border text-[11px] ${
                    st.match
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                      : 'bg-white border-gray-100 text-gray-600'
                  }`}
                >
                  Step {idx + 1}: {st.action}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3C. Merge Sort Implementation */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
              Phase 3C • Mandatory Sorting
            </span>
            <h2 className="text-lg font-black text-gray-900">
              Merge Sort from Scratch (Daily Rental Tariff)
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full w-fit">
            Time Complexity: O(n log n) • All Cases
          </span>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          Implements Merge Sort recursively without relying on JavaScript's built-in <code>Array.prototype.sort</code>.
          Splits the vehicle list into halves, sorts sublists recursively, and merges sorted halves.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setMergeSortOrder('asc');
              const res = sortVehiclesByPrice(rawVehicles, 'asc');
              setMergeSortOutput(res);
              toast.success('Merge Sort (Ascending) completed');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
              mergeSortOrder === 'asc' && mergeSortOutput
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Sort Ascending (Low to High)
          </button>

          <button
            onClick={() => {
              setMergeSortOrder('desc');
              const res = sortVehiclesByPrice(rawVehicles, 'desc');
              setMergeSortOutput(res);
              toast.success('Merge Sort (Descending) completed');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
              mergeSortOrder === 'desc' && mergeSortOutput
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Sort Descending (High to Low)
          </button>
        </div>

        {/* Merge Sort Stage Display */}
        {mergeSortOutput && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 flex justify-between">
              <span>Total Comparisons: <strong>{mergeSortOutput.comparisons}</strong></span>
              <span>Merge Passes: <strong>{mergeSortOutput.passes}</strong></span>
              <span>Array Size: <strong>{mergeSortOutput.sorted.length} Vehicles</strong></span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono max-h-56 overflow-y-auto space-y-1">
              <p className="text-[11px] text-teal-400 font-bold mb-2 font-sans">
                Divide & Merge Step Log:
              </p>
              {mergeSortOutput.steps.map((st: any, idx: number) => (
                <div key={idx} className="text-[11px] text-slate-300">
                  [{st.stage.toUpperCase()}] {st.description}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
