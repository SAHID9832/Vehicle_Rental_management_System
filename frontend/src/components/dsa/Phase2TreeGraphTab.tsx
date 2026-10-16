import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { BinaryTree, BinarySearchTree } from '../../dsa/BinaryTree';
import { dsaApi } from '../../services/api';

interface Phase2TreeGraphTabProps {
  rawVehicles: any[];
  rawBranches: any[];
}

export const Phase2TreeGraphTab: React.FC<Phase2TreeGraphTabProps> = ({
  rawVehicles,
  rawBranches,
}) => {
  // 2A/B. Binary Tree
  const [treeTraversal, setTreeTraversal] = useState<'preorder' | 'inorder' | 'postorder'>('preorder');
  const [traversalResult, setTraversalResult] = useState<any | null>(null);

  // 2C. Binary Search Tree
  const [bst, setBst] = useState<BinarySearchTree>(new BinarySearchTree());
  const [bstSearchKey, setBstSearchKey] = useState<number>(3);
  const [bstSearchResult, setBstSearchResult] = useState<any | null>(null);

  // 2D/E. Graph & BFS
  const [startBranchId, setStartBranchId] = useState<number>(1);
  const [bfsResult, setBfsResult] = useState<any | null>(null);

  useEffect(() => {
    if (rawVehicles.length > 0) {
      // Build BST from vehicles
      const bstInstance = BinarySearchTree.fromVehicles(
        rawVehicles.map((v) => ({
          vehicle_id: v.vehicle_id,
          name: v.name,
          numeric_key: v.id,
        }))
      );
      setBst(bstInstance);

      // Build Binary Tree for categories
      const categoriesTree = new BinaryTree<{ name: string; id: number }>();
      const cats = [
        { name: 'Fleet Root', id: 0 },
        { name: 'Sedans & Hatchbacks', id: 1 },
        { name: 'SUVs & Vans', id: 2 },
        { name: 'Economy Cars', id: 3 },
        { name: 'Luxury Sedans', id: 4 },
        { name: 'Compact SUVs', id: 5 },
        { name: '7-Seater MPVs', id: 6 },
      ];
      cats.forEach((c) => categoriesTree.insert(c));
      const initTrav = categoriesTree.preorder();
      setTraversalResult(initTrav);
    }
  }, [rawVehicles]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 2A/B. Binary Tree & Traversals */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
              Phase 2A & 2B • Hierarchical Structure
            </span>
            <h2 className="text-lg font-black text-gray-900">
              Binary Tree Category Hierarchy & Traversals
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full w-fit">
            Preorder • Inorder • Postorder
          </span>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          Organizes vehicle categories into a Binary Tree with Root, Left Child, and Right Child hierarchy.
          Demonstrates <strong>Preorder</strong> (Root → Left → Right), <strong>Inorder</strong> (Left → Root → Right), and <strong>Postorder</strong> (Left → Right → Root).
        </p>

        {/* Traversal Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {(['preorder', 'inorder', 'postorder'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setTreeTraversal(mode);
                const tree = new BinaryTree<{ name: string; id: number }>();
                const cats = [
                  { name: 'Fleet Root', id: 0 },
                  { name: 'Sedans & Hatchbacks', id: 1 },
                  { name: 'SUVs & Vans', id: 2 },
                  { name: 'Economy Cars', id: 3 },
                  { name: 'Luxury Sedans', id: 4 },
                  { name: 'Compact SUVs', id: 5 },
                  { name: '7-Seater MPVs', id: 6 },
                ];
                cats.forEach((c) => tree.insert(c));
                const res = tree[mode]();
                setTraversalResult(res);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                treeTraversal === mode
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mode} Traversal
            </button>
          ))}
        </div>

        {/* Traversal Sequence Result */}
        {traversalResult && (
          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
            <span className="text-xs font-bold text-teal-900 uppercase tracking-wider block">
              {treeTraversal} Traversal Sequence:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {traversalResult.order.map((item: any, i: number) => (
                <React.Fragment key={i}>
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-teal-300 text-teal-900 font-bold text-xs shadow-xs">
                    {item.name}
                  </span>
                  {i < traversalResult.order.length - 1 && (
                    <span className="text-teal-500 font-bold">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2C. Binary Search Tree (BST) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
              Phase 2C • Search Tree Structure
            </span>
            <h2 className="text-lg font-black text-gray-900">
              Binary Search Tree (BST) by Vehicle Numeric Key
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full w-fit">
            Search: O(log n) avg, O(n) worst
          </span>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          Locates vehicle records using numeric key comparison: left subtree contains keys &lt; root, right subtree contains keys &gt; root.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="number"
            min="1"
            placeholder="Search Numeric Key (1-18)"
            value={bstSearchKey}
            onChange={(e) => setBstSearchKey(Number(e.target.value))}
            className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
          <button
            onClick={() => {
              const res = bst.search(bstSearchKey);
              setBstSearchResult(res);
              if (res.found) toast.success(`Found vehicle in ${res.comparisons} comparisons`);
              else toast.error('Key not found in BST');
            }}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-sm"
          >
            Search BST Key
          </button>
        </div>

        {/* BST Result Box */}
        {bstSearchResult && (
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">
                Search Result: {bstSearchResult.found ? 'FOUND ✓' : 'NOT FOUND ✗'}
              </span>
              <span className="font-mono text-teal-700 font-bold">
                Comparisons: {bstSearchResult.comparisons}
              </span>
            </div>
            {bstSearchResult.found && bstSearchResult.node && (
              <p className="text-teal-900 font-bold">
                Vehicle: {bstSearchResult.node.name} (Key: {bstSearchResult.node.key}, Ref: {bstSearchResult.node.vehicleId})
              </p>
            )}
            <p className="text-[11px] text-gray-600">
              Search Traversal Path: {bstSearchResult.path.join(' → ')}
            </p>
          </div>
        )}
      </div>

      {/* 2D & 2E. Graph of Rental Locations & BFS Traversal */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
              Phase 2D & 2E • Mandatory Graph Traversal
            </span>
            <h2 className="text-lg font-black text-gray-900">
              Bengaluru Hub Graph & Breadth-First Search (BFS)
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full w-fit">
            BFS with Queue • Time: O(V + E)
          </span>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          Traverses connected rental branches level by level using our custom <strong>Queue</strong>.
          Visits all direct neighbors of the selected hub before advancing to the next hop level.
        </p>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-bold text-gray-700">Start BFS Hub:</label>
          <select
            value={startBranchId}
            onChange={(e) => setStartBranchId(Number(e.target.value))}
            className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 bg-white"
          >
            {rawBranches.map((b) => (
              <option key={b.id} value={b.id}>
                Node {b.id}: {b.name}
              </option>
            ))}
          </select>

          <button
            onClick={async () => {
              try {
                const res = await dsaApi.runBFS(startBranchId);
                setBfsResult(res.data.data);
                toast.success('BFS traversal completed with Queue operations');
              } catch (err) {
                toast.error('Failed to run BFS');
              }
            }}
            className="px-5 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run BFS Traversal</span>
          </button>
        </div>

        {/* BFS Output Display */}
        {bfsResult && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 space-y-2">
              <span className="font-bold uppercase tracking-wider block">
                BFS Visit Order (Level by Level):
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {bfsResult.traversal_order?.map((b: any, idx: number) => (
                  <React.Fragment key={b.id}>
                    <span className="px-3 py-1 rounded-xl bg-white border border-teal-300 font-bold text-teal-900">
                      Hop #{idx + 1}: {b.name}
                    </span>
                    {idx < bfsResult.traversal_order.length - 1 && (
                      <span className="text-teal-600 font-bold">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs space-y-1.5 max-h-56 overflow-y-auto">
              <span className="text-teal-400 font-bold block mb-2 font-sans">
                Queue Step Trace:
              </span>
              {bfsResult.steps?.map((step: any, i: number) => (
                <div key={i} className="text-slate-300">
                  <span className="text-teal-400">Step {i + 1}:</span> {step.action} • Queue: [
                  {step.queue?.join(', ') || ''}]
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
