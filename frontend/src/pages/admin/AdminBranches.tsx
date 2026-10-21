import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Plus,
  Route,
  Phone,
  Mail,
  User,
  Car,
  Trash2,
  Cpu,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  Navigation,
  Clock,
  Building2,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { branchesApi, dsaApi } from '../../services/api';
import { Branch, BranchConnection } from '../../types';

export default function AdminBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [connections, setConnections] = useState<BranchConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // View state: 'hubs' | 'routes' | 'simulator'
  const [activeTab, setActiveTab] = useState<'hubs' | 'routes' | 'simulator'>('hubs');

  // Filters & Search
  const [selectedState, setSelectedState] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add Branch Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: '',
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    phone: '+91 92500 35555',
    email: '',
    manager_name: 'Branch Manager',
    latitude: 12.9716,
    longitude: 77.5946,
  });

  // Add Connection Modal
  const [addConnModalOpen, setAddConnModalOpen] = useState(false);
  const [newConn, setNewConn] = useState({
    from_branch_id: '',
    to_branch_id: '',
    distance_km: '',
    travel_time_mins: '',
  });

  // Graph Traversal / Route Simulator State
  const [simOriginId, setSimOriginId] = useState<number | ''>('');
  const [simDestId, setSimDestId] = useState<number | ''>('');
  const [traversalResult, setTraversalResult] = useState<{
    traversal_order?: Array<{ id: number; name: string; city: string }>;
    total_visited?: number;
    steps?: string[];
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [branchRes, connRes] = await Promise.all([
        branchesApi.getAll(),
        branchesApi.getConnections(),
      ]);
      const connData = connRes.data.data;
      const edgesList = Array.isArray(connData)
        ? connData
        : (connData?.edges || []);

      const branchList = Array.isArray(branchRes.data.data) ? branchRes.data.data : [];
      setBranches(branchList);
      setConnections(edgesList);

      if (branchList.length > 0 && !simOriginId) {
        setSimOriginId(branchList[0].id);
      }
      if (branchList.length > 1 && !simDestId) {
        setSimDestId(branchList[1].id);
      }
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

  // Sync CSV Action
  const handleSyncCsv = async () => {
    setIsSyncing(true);
    try {
      const res = await branchesApi.syncCsv();
      const meta = res.data?.data;
      toast.success(
        `All-India network synced: ${meta?.totalHubs || 73} Hubs across ${meta?.statesCovered || 25} States/UTs with ${meta?.totalEdges || 176} Routes!`
      );
      await loadData();
    } catch (err: any) {
      console.error('CSV sync error:', err);
      toast.error(err.response?.data?.message || 'Failed to sync CSV network.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Create new Branch
  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.name.trim()) {
      toast.error('Hub name is required.');
      return;
    }
    try {
      await branchesApi.create(newBranch);
      toast.success(`Hub '${newBranch.name}' created successfully!`);
      setAddModalOpen(false);
      setNewBranch({
        name: '',
        address: '',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        phone: '+91 92500 35555',
        email: '',
        manager_name: 'Branch Manager',
        latitude: 12.9716,
        longitude: 77.5946,
      });
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add branch.');
    }
  };

  // Create new Route Connection (Graph Edge)
  const handleAddConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConn.from_branch_id || !newConn.to_branch_id) {
      toast.error('Please select both Origin and Destination hubs.');
      return;
    }
    if (newConn.from_branch_id === newConn.to_branch_id) {
      toast.error('Origin and Destination hubs cannot be the same.');
      return;
    }

    try {
      await branchesApi.addConnection({
        from_branch_id: Number(newConn.from_branch_id),
        to_branch_id: Number(newConn.to_branch_id),
        distance_km: parseFloat(newConn.distance_km) || 50,
        travel_time_mins: parseInt(newConn.travel_time_mins, 10) || 60,
      });
      toast.success('Inter-hub route edge created successfully!');
      setAddConnModalOpen(false);
      setNewConn({
        from_branch_id: '',
        to_branch_id: '',
        distance_km: '',
        travel_time_mins: '',
      });
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add route connection.');
    }
  };

  // Remove Route Connection
  const handleDeleteConnection = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this highway route edge?')) {
      return;
    }
    try {
      await branchesApi.removeConnection(id);
      toast.success('Route connection removed.');
      setConnections((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete route edge.');
    }
  };

  // Run Graph BFS Traversal
  const handleRunSimulator = async () => {
    if (!simOriginId) {
      toast.error('Please select an origin hub.');
      return;
    }
    setIsSimulating(true);
    try {
      const res = await dsaApi.runBFS(Number(simOriginId));
      setTraversalResult(res.data.data);
      toast.success(`BFS Traversal explored ${res.data.data.total_visited} connected hubs!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to run BFS simulator.');
    } finally {
      setIsSimulating(false);
    }
  };

  // Distinct States List for Filter Dropdown
  const uniqueStates = useMemo(() => {
    const set = new Set<string>();
    branches.forEach((b) => {
      if (b.state) set.add(b.state);
    });
    return Array.from(set).sort();
  }, [branches]);

  // Filtered branches
  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const matchesState = selectedState === 'All' || b.state === selectedState;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        b.state.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q);
      return matchesState && matchesQuery;
    });
  }, [branches, selectedState, searchQuery]);

  // Filtered connections
  const filteredConnections = useMemo(() => {
    return connections.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q && selectedState === 'All') return true;

      const fromName = (c.from_branch_name || '').toLowerCase();
      const toName = (c.to_branch_name || '').toLowerCase();
      const fromCity = (c.from_city || '').toLowerCase();
      const toCity = (c.to_city || '').toLowerCase();
      const fromState = (c.from_state || '').toLowerCase();
      const toState = (c.to_state || '').toLowerCase();

      const matchesState =
        selectedState === 'All' ||
        fromState === selectedState.toLowerCase() ||
        toState === selectedState.toLowerCase();

      const matchesQuery =
        !q ||
        fromName.includes(q) ||
        toName.includes(q) ||
        fromCity.includes(q) ||
        toCity.includes(q);

      return matchesState && matchesQuery;
    });
  }, [connections, selectedState, searchQuery]);

  // Summary Metrics
  const avgDistance = useMemo(() => {
    if (connections.length === 0) return 0;
    const sum = connections.reduce((acc, c) => acc + Number(c.distance_km || 0), 0);
    return Math.round(sum / connections.length);
  }, [connections]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
              Pan-India Highway Network
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1.5">
            All-India Hubs & Network Graph
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-3xl">
            Manage nationwide rental branches, regional hubs across 25+ states and union territories, and graph edges representing inter-hub travel distances and estimated transit times.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSyncCsv}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
            title="Synchronize database hubs and inter-hub road connections from all_india_vehicle_rental_network_combined.csv"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing CSV...' : 'Sync CSV Network'}</span>
          </button>

          <button
            onClick={() => setAddConnModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs shadow-xs transition-colors"
          >
            <Route className="w-3.5 h-3.5 text-indigo-600" />
            <span>Add Route Edge</span>
          </button>

          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Hub</span>
          </button>
        </div>
      </div>

      {/* Network Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">Total Hubs</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-gray-900 tracking-tight">{branches.length}</div>
          <p className="text-[11px] text-gray-600 mt-1">Operational rental branches</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">Inter-Hub Edges</span>
            <Route className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-gray-900 tracking-tight">{connections.length}</div>
          <p className="text-[11px] text-gray-600 mt-1">Weighted highway routes</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">States & UTs</span>
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-gray-900 tracking-tight">{uniqueStates.length}</div>
          <p className="text-[11px] text-gray-600 mt-1">Pan-India coverage footprint</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">Avg Route Distance</span>
            <Navigation className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-gray-900 tracking-tight">{avgDistance} km</div>
          <p className="text-[11px] text-gray-600 mt-1">Calculated highway transit</p>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setActiveTab('hubs')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'hubs'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Hubs Directory ({filteredBranches.length})
            </button>
            <button
              onClick={() => setActiveTab('routes')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'routes'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Route Edges ({filteredConnections.length})
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'simulator'
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              BFS Route Simulator
            </button>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, hub, address..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-teal-500 focus:bg-white transition-all"
              />
            </div>

            {/* State Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 focus:outline-hidden focus:border-teal-500 focus:bg-white text-gray-700 font-semibold"
              >
                <option value="All">All States ({branches.length} hubs)</option>
                {uniqueStates.map((st) => (
                  <option key={st} value={st}>
                    {st} ({branches.filter((b) => b.state === st).length})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab 1: Hubs Directory Grid */}
        {activeTab === 'hubs' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-gray-600">Loading All-India rental hubs...</div>
            ) : filteredBranches.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-600">No hubs found matching your criteria.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredBranches.map((b) => {
                  const connectedEdges = connections.filter(
                    (c) => c.from_branch_id === b.id || (c as any).branch_id_a === b.id
                  );
                  return (
                    <div
                      key={b.id}
                      className="p-5 rounded-2xl bg-gray-50/70 hover:bg-gray-50 border border-gray-200/80 transition-all space-y-3.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                            {b.id}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm leading-snug">{b.name}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                                {b.city}
                              </span>
                              <span className="text-[11px] text-gray-600">
                                {b.state} • {b.pincode}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-gray-200 text-gray-700 shrink-0">
                          {b.vehicle_count !== undefined ? `${b.vehicle_count} Cars` : 'Hub'}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                        {b.address}
                      </p>

                      <div className="text-[11px] text-gray-600 space-y-1 pt-2 border-t border-gray-200/70">
                        <p className="flex items-center gap-1.5 truncate">
                          <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="font-medium text-gray-700">Manager:</span> {b.manager_name}
                        </p>
                        <p className="flex items-center gap-1.5 truncate">
                          <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="font-medium text-gray-700">Phone:</span> {b.phone}
                        </p>
                        <p className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="font-medium text-gray-700">Email:</span> {b.email}
                        </p>
                      </div>

                      {/* Connected Highway Routes */}
                      <div className="pt-2 border-t border-gray-200/70">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                            Direct Routes ({connectedEdges.length})
                          </span>
                        </div>
                        {connectedEdges.length === 0 ? (
                          <span className="text-[11px] text-gray-400 italic">No connected routes registered</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {connectedEdges.slice(0, 5).map((e, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[10px] font-semibold text-gray-700 shadow-2xs"
                              >
                                <ArrowRight className="w-2.5 h-2.5 text-teal-600" />
                                <span>{e.to_branch_name?.split(' - ')[0] || `Hub #${e.to_branch_id}`}</span>
                                <span className="text-gray-400 font-mono">({e.distance_km}km)</span>
                              </span>
                            ))}
                            {connectedEdges.length > 5 && (
                              <span className="px-1.5 py-0.5 text-[10px] text-gray-600 font-medium">
                                +{connectedEdges.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Route Edges Table */}
        {activeTab === 'routes' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Edge ID</th>
                  <th className="py-3 px-4">Origin Hub</th>
                  <th className="py-3 px-4">Origin State</th>
                  <th className="py-3 px-4">Destination Hub</th>
                  <th className="py-3 px-4">Dest. State</th>
                  <th className="py-3 px-4">Distance</th>
                  <th className="py-3 px-4">Est. Travel Time</th>
                  <th className="py-3 px-4">Route Type</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredConnections.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-600">
                      No highway routes match the current filter.
                    </td>
                  </tr>
                ) : (
                  filteredConnections.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-teal-700">
                        E({c.from_branch_id} ↔ {c.to_branch_id})
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {c.from_branch_name || `Branch #${c.from_branch_id}`}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {c.from_state || '-'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {c.to_branch_name || `Branch #${c.to_branch_id}`}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {c.to_state || '-'}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        {c.distance_km} km
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-medium">
                        {Math.floor(Number(c.travel_time_mins || 60) / 60)}h {(Number(c.travel_time_mins || 60) % 60)}m ({c.travel_time_mins} mins)
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          National Highway
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteConnection(c.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete route edge"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Graph BFS & Shortest Route Simulator */}
        {activeTab === 'simulator' && (
          <div className="space-y-6 pt-2">
            <div className="p-6 rounded-2xl bg-linear-to-br from-teal-500/10 via-indigo-500/5 to-transparent border border-teal-100 space-y-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-teal-700" />
                <h3 className="font-bold text-gray-900 text-sm">
                  Interactive Network Graph Traversal (Breadth-First Search)
                </h3>
              </div>
              <p className="text-xs text-gray-600 max-w-2xl leading-relaxed">
                Test the graph data structure by running BFS traversal from any origin hub across the Indian highway network. The algorithm will discover all reachable rental nodes level-by-level using the underlying adjacency list.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="w-full sm:w-80">
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Select Origin Hub (BFS Root Node)
                  </label>
                  <select
                    value={simOriginId}
                    onChange={(e) => setSimOriginId(Number(e.target.value))}
                    className="w-full text-xs bg-white border border-gray-300 rounded-xl py-2 px-3 focus:outline-hidden focus:border-teal-500 font-semibold"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        #{b.id} - {b.name} ({b.city}, {b.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:self-end">
                  <button
                    onClick={handleRunSimulator}
                    disabled={isSimulating}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors disabled:opacity-50"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{isSimulating ? 'Traversing Graph...' : 'Execute BFS Traversal'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Traversal Results Display */}
            {traversalResult && (
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                      BFS Traversal Results ({traversalResult.total_visited} Visited Nodes)
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    Live Highway Route
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-gray-600 block">
                    Discovered Node Sequence:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {traversalResult.traversal_order?.map((node, i) => (
                      <React.Fragment key={node.id}>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                          <span className="w-5 h-5 rounded-md bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="font-bold text-gray-900">{node.city}</span>
                          <span className="text-gray-600 text-[10px]">({node.name.split(' - ')[0]})</span>
                        </div>
                        {i < (traversalResult.traversal_order?.length || 0) - 1 && (
                          <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {traversalResult.steps && traversalResult.steps.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-[11px] font-bold text-gray-600 block mb-2">
                      Queue Exploration Steps:
                    </span>
                    <div className="max-h-48 overflow-y-auto space-y-1 text-[11px] font-mono text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      {traversalResult.steps.slice(0, 20).map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-gray-400 select-none">{idx + 1}.</span>
                          <span>{step}</span>
                        </div>
                      ))}
                      {traversalResult.steps.length > 20 && (
                        <div className="text-gray-400 italic pt-1">
                          ... and {traversalResult.steps.length - 20} more traversal transitions
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Add New Hub */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900">Add New Regional Hub</h2>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBranch} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Hub Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kolkata - Salt Lake Central Hub"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newBranch.city}
                    onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">State / UT</label>
                  <input
                    type="text"
                    required
                    value={newBranch.state}
                    onChange={(e) => setNewBranch({ ...newBranch, state: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  required
                  placeholder="Official address or transit terminal location"
                  value={newBranch.address}
                  onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={newBranch.pincode}
                    onChange={(e) => setNewBranch({ ...newBranch, pincode: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Manager Name</label>
                  <input
                    type="text"
                    required
                    value={newBranch.manager_name}
                    onChange={(e) => setNewBranch({ ...newBranch, manager_name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={newBranch.phone}
                    onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="hub.city@vektor.in"
                    value={newBranch.email}
                    onChange={(e) => setNewBranch({ ...newBranch, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newBranch.latitude}
                    onChange={(e) => setNewBranch({ ...newBranch, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newBranch.longitude}
                    onChange={(e) => setNewBranch({ ...newBranch, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  Save Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Route Edge */}
      {addConnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900">Add Route Connection (Graph Edge)</h2>
              <button
                onClick={() => setAddConnModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddConnection} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Origin Hub (Node A)</label>
                <select
                  required
                  value={newConn.from_branch_id}
                  onChange={(e) => setNewConn({ ...newConn, from_branch_id: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-teal-500 focus:bg-white font-semibold"
                >
                  <option value="">Select origin hub</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      #{b.id} - {b.name} ({b.city}, {b.state})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Destination Hub (Node B)</label>
                <select
                  required
                  value={newConn.to_branch_id}
                  onChange={(e) => setNewConn({ ...newConn, to_branch_id: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-teal-500 focus:bg-white font-semibold"
                >
                  <option value="">Select destination hub</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      #{b.id} - {b.name} ({b.city}, {b.state})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Distance (km)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="e.g. 345"
                    value={newConn.distance_km}
                    onChange={(e) => setNewConn({ ...newConn, distance_km: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Travel Time (mins)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 360"
                    value={newConn.travel_time_mins}
                    onChange={(e) => setNewConn({ ...newConn, travel_time_mins: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAddConnModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  Connect Hubs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
