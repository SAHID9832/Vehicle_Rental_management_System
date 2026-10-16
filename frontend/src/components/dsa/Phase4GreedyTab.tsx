import React, { useState } from 'react';
import { Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { greedyRecommend } from '../../dsa/greedyRecommendation';
import { formatINR } from '../../utils';

interface Phase4GreedyTabProps {
  rawVehicles: any[];
}

export const Phase4GreedyTab: React.FC<Phase4GreedyTabProps> = ({ rawVehicles }) => {
  const [greedyBudget, setGreedyBudget] = useState(6000);
  const [greedyDays, setGreedyDays] = useState(3);
  const [greedySeats, setGreedySeats] = useState(5);
  const [greedyResult, setGreedyResult] = useState<any | null>(null);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
              Phase 4A • Algorithmic Problem Solving
            </span>
            <h2 className="text-lg font-black text-gray-900">
              Greedy Vehicle Recommendation Algorithm
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full w-fit">
            Greedy Choice Strategy • O(n log n)
          </span>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          Applies a greedy selection strategy: filters candidate fleet by availability, seats, and hub, computes total estimated rental costs, and selects the minimum-cost eligible vehicle.
        </p>

        {/* Input Criteria */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-gray-700">Customer Budget (INR)</label>
            <input
              type="number"
              min="500"
              step="500"
              value={greedyBudget}
              onChange={(e) => setGreedyBudget(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-700">Rental Days</label>
            <input
              type="number"
              min="1"
              max="30"
              value={greedyDays}
              onChange={(e) => setGreedyDays(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-700">Min Seating Required</label>
            <select
              value={greedySeats}
              onChange={(e) => setGreedySeats(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
            >
              <option value={2}>2+ (Bikes, Compact)</option>
              <option value={5}>5+ (Hatchback / Sedan / SUV)</option>
              <option value={7}>7+ (Innova, XUV700, Ertiga)</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => {
            const res = greedyRecommend(rawVehicles, {
              budget: greedyBudget,
              rentalDays: greedyDays,
              minSeating: greedySeats,
            });
            setGreedyResult(res);
            if (res.recommendation) {
              toast.success(`Greedy match: ${res.recommendation.name}`);
            } else {
              toast.error(res.reason);
            }
          }}
          className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run Greedy Recommendation</span>
        </button>

        {/* Output Card */}
        {greedyResult && (
          <div className="space-y-4">
            {greedyResult.recommendation ? (
              <div className="p-6 rounded-2xl bg-teal-50 border border-teal-200 space-y-3">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                  Greedy Choice Winner
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xl font-black text-teal-950">
                      {greedyResult.recommendation.name}
                    </h4>
                    <p className="text-xs text-teal-800">
                      {greedyResult.recommendation.brand} • {greedyResult.recommendation.seating_capacity} Seats • {greedyResult.recommendation.fuel_type}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-teal-700 block">Total for {greedyDays} Days</span>
                    <span className="text-2xl font-black text-teal-950">
                      {formatINR(greedyResult.estimatedCost)}
                    </span>
                    <span className="text-[10px] text-teal-700 block">
                      Within budget of {formatINR(greedyBudget)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                {greedyResult.reason}
              </div>
            )}

            {/* Steps Trace */}
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
              <span className="font-bold text-gray-900 uppercase tracking-wider block mb-2">
                Algorithm Step-by-Step Decisions:
              </span>
              {greedyResult.steps.map((st: any) => (
                <div key={st.stepNumber} className="flex items-start gap-2 text-gray-700">
                  <span className="font-bold text-teal-600">Step {st.stepNumber}:</span>
                  <span>{st.action}</span>
                </div>
              ))}
            </div>

            {/* Pseudocode & Academic Note */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2 text-xs font-mono">
              <span className="text-teal-400 font-bold block font-sans">
                Greedy Strategy Pseudocode:
              </span>
              <pre className="text-[11px] text-slate-300 whitespace-pre-wrap">
                {greedyResult.pseudocode}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
