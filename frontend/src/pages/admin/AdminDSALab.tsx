import React, { useState, useEffect } from 'react';
import { vehiclesApi, branchesApi } from '../../services/api';
import { LoadingSpinner } from '../../components/ui';
import {
  DSALabHeader,
  DSAPhase,
  Phase1LinearTab,
  Phase2TreeGraphTab,
  Phase3SearchSortTab,
  Phase4GreedyTab,
} from '../../components/dsa';

export default function AdminDSALab() {
  const [activeTab, setActiveTab] = useState<DSAPhase>('phase1');
  const [rawVehicles, setRawVehicles] = useState<any[]>([]);
  const [rawBranches, setRawBranches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load backend data for DSA demonstrations
  useEffect(() => {
    async function initDSAData() {
      setIsLoading(true);
      try {
        const [vehRes, branchRes] = await Promise.all([
          vehiclesApi.getAll({ limit: 100 }),
          branchesApi.getAll(),
        ]);
        setRawVehicles(vehRes.data.data?.data || vehRes.data.data || []);
        setRawBranches(branchRes.data.data || []);
      } catch (err) {
        console.error('Failed to load DSA lab data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initDSAData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner text="Initializing DSA Laboratory Fleet & Graph Data..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header & Navigation Tabs */}
      <DSALabHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab 1: Phase 1 — Linear Structures */}
      {activeTab === 'phase1' && <Phase1LinearTab rawVehicles={rawVehicles} />}

      {/* Tab 2: Phase 2 — Trees & Graphs */}
      {activeTab === 'phase2' && (
        <Phase2TreeGraphTab rawVehicles={rawVehicles} rawBranches={rawBranches} />
      )}

      {/* Tab 3: Phase 3 — Search & Sort */}
      {activeTab === 'phase3' && <Phase3SearchSortTab rawVehicles={rawVehicles} />}

      {/* Tab 4: Phase 4 — Greedy Recommendation */}
      {activeTab === 'phase4' && <Phase4GreedyTab rawVehicles={rawVehicles} />}
    </div>
  );
}
