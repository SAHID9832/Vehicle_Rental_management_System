import React from 'react';
import { Cpu, Layers, GitBranch, Search, Sparkles } from 'lucide-react';

export type DSAPhase = 'phase1' | 'phase2' | 'phase3' | 'phase4';

interface DSALabHeaderProps {
  activeTab: DSAPhase;
  onTabChange: (tab: DSAPhase) => void;
}

export const DSALabHeader: React.FC<DSALabHeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="space-y-6">
      {/* Page Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
              <Cpu className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Interactive DSA Laboratory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Live execution, visual step-by-step traces, and time-complexity proofs for all four project phases.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
          MCA Capstone Evaluation Suite
        </span>
      </div>

      {/* Phase Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl border border-gray-100 shadow-xs">
        <button
          onClick={() => onTabChange('phase1')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'phase1'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Phase 1: Linear Structures</span>
        </button>

        <button
          onClick={() => onTabChange('phase2')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'phase2'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Phase 2: Trees & Graphs</span>
        </button>

        <button
          onClick={() => onTabChange('phase3')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'phase3'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Phase 3: Search & Sort</span>
        </button>

        <button
          onClick={() => onTabChange('phase4')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'phase4'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Phase 4: Greedy Algorithm</span>
        </button>
      </div>
    </div>
  );
};
