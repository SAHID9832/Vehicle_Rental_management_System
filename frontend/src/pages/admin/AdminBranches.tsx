import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Route,
  Phone,
  Mail,
  User,
  Car,
  Trash2,
  Share2,
  Cpu,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { branchesApi } from '../../services/api';
import { Branch, BranchConnection } from '../../types';

export default function AdminBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [connections, setConnections] = useState<BranchConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Branch Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: '',
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    phone: '+91 80 4968 2000',
    email: 'hub@vektor.in',
    manager_name: 'Branch Manager',
    latitude: 12.9716,
    longitude: 77.5946,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [branchRes, connRes] = await Promise.all([
        branchesApi.getAll(),
        branchesApi.getConnections(),
      ]);
      setBranches(branchRes.data.data || []);
      setConnections(connRes.data.data || []);
    } catch (err) {
      console.error('Failed to load branches and graph network:', err);
      toast.error('Failed to load branch graph data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await branchesApi.create(newBranch);
      toast.success('New hub created successfully!');
      setAddModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add branch.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Hubs & Network Graph
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Manage Bengaluru rental branches and graph edges representing inter-hub travel distances.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Hub</span>
        </button>
      </div>

      {/* Network Graph Visual Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Bengaluru Multi-Hub Graph (Adjacency List)
              </h2>
              <p className="text-xs text-gray-600">
                {branches.length} Nodes (Hubs) • {connections.length} Weighted Edges (Routes)
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            Phase 2 Graph DSA
          </span>
        </div>

        {/* Visual Hub Chips & Routes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((b) => {
            // Find edges connected to this branch
            const connectedEdges = connections.filter(
              (c) => c.from_branch_id === b.id || (c as any).branch_id_a === b.id
            );
            return (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                      {b.id}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{b.name}</h3>
                      <p className="text-[11px] text-gray-600">{b.city}, {b.pincode}</p>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-gray-600 space-y-1 pt-1 border-t border-gray-200/60">
                  <p className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>Manager: {b.manager_name}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{b.phone}</span>
                  </p>
                </div>

                {/* Connected Routes */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block mb-1">
                    Direct Connections ({connectedEdges.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {connectedEdges.map((e, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-white border border-gray-200 text-[10px] font-semibold text-gray-700"
                      >
                        → {e.to_branch_name || `Node ${e.to_branch_id || (e as any).branch_id_b}`} ({e.distance_km}km)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Graph Edges / Connections Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Branch Route Connections (Graph Edges)</h2>
          <span className="text-xs text-gray-600">{connections.length} routes registered</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-6">Route Edge</th>
                <th className="py-3 px-6">Origin Hub</th>
                <th className="py-3 px-6">Destination Hub</th>
                <th className="py-3 px-6">Distance</th>
                <th className="py-3 px-6">Est. Travel Time</th>
                <th className="py-3 px-6">Graph Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {connections.map((c, idx) => (
                <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-6 font-mono font-bold text-teal-700">
                    E({c.from_branch_id || (c as any).branch_id_a} ↔ {c.to_branch_id || (c as any).branch_id_b})
                  </td>
                  <td className="py-3 px-6 font-semibold">
                    {c.from_branch_name || `Branch #${c.from_branch_id || (c as any).branch_id_a}`}
                  </td>
                  <td className="py-3 px-6 font-semibold">
                    {c.to_branch_name || `Branch #${c.to_branch_id || (c as any).branch_id_b}`}
                  </td>
                  <td className="py-3 px-6 font-bold text-gray-900">{c.distance_km} km</td>
                  <td className="py-3 px-6 text-gray-600">{c.travel_time_mins || (c as any).travel_time_min} mins</td>
                  <td className="py-3 px-6">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      Bidirectional
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
