import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  GitBranch,
  Search,
  Sparkles,
  ArrowRight,
  Play,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Info,
  ChevronRight,
  Clock,
  ArrowUpDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { dsaApi, vehiclesApi, branchesApi } from '../../services/api';
import { SinglyLinkedList } from '../../dsa/LinkedList';
import { Stack, evaluateRentalCost } from '../../dsa/Stack';
import { Queue } from '../../dsa/Queue';
import { BinaryTree, BinarySearchTree } from '../../dsa/BinaryTree';
import { Graph } from '../../dsa/Graph';
import { linearSearch, binarySearch } from '../../dsa/searching';
import { sortVehiclesByPrice } from '../../dsa/mergeSort';
import { greedyRecommend } from '../../dsa/greedyRecommendation';
import { formatINR } from '../../utils';

export default function AdminDSALab() {
  const [activeTab, setActiveTab] = useState<'phase1' | 'phase2' | 'phase3' | 'phase4'>('phase1');
  const [rawVehicles, setRawVehicles] = useState<any[]>([]);
  const [rawBranches, setRawBranches] = useState<any[]>([]);
  const [rawConnections, setRawConnections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load backend data for DSA demonstrations
  useEffect(() => {
    async function initDSAData() {
      setIsLoading(true);
      try {
        const [vehRes, branchRes, graphRes] = await Promise.all([
          vehiclesApi.getAll({ limit: 100 }),
          branchesApi.getAll(),
          dsaApi.getGraph(),
        ]);
        setRawVehicles(vehRes.data.data?.data || vehRes.data.data || []);
        setRawBranches(branchRes.data.data || []);
        setRawConnections(graphRes.data.data?.edges || []);
      } catch (err) {
        console.error('Failed to load DSA lab data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initDSAData();
  }, []);

  // ==========================================
  // PHASE 1 STATES
  // ==========================================
  // 1A. Linked List
  const [linkedList, setLinkedList] = useState<SinglyLinkedList<any>>(new SinglyLinkedList());
  const [llSnapshot, setLLSnapshot] = useState<any[]>([]);
  const [newVehicleName, setNewVehicleName] = useState('Tata Harrier');

  // 1B. Stack
  const [rentalStack, setRentalStack] = useState<Stack<string>>(new Stack());
  const [stackSnapshot, setStackSnapshot] = useState<string[]>([]);
  const [stackInput, setStackInput] = useState('Customer #101 Picked up Swift (VKT-SW-001)');

  // 1C. Queue
  const [waitingQueue, setWaitingQueue] = useState<Queue<string>>(new Queue());
  const [queueSnapshot, setQueueSnapshot] = useState<string[]>([]);
  const [queueInput, setQueueInput] = useState('Rahul Verma (Waiting for SUV)');

  // 1D. Stack Expression Evaluator
  const [evalDays, setEvalDays] = useState(4);
  const [evalDailyRate, setEvalDailyRate] = useState(2500);
  const [evalDiscount, setEvalDiscount] = useState(500);
  const [evalCharges, setEvalCharges] = useState(200);
  const [expressionResult, setExpressionResult] = useState<any | null>(null);

  // Initialize Phase 1 data once vehicles load
  useEffect(() => {
    if (rawVehicles.length > 0) {
      // Linked list
      const ll = new SinglyLinkedList();
      rawVehicles.slice(0, 5).forEach((v) => ll.insertAtTail(v));
      setLinkedList(ll);
      setLLSnapshot(ll.traverse());

      // Stack
      const st = new Stack<string>();
      st.push('Rental #1 Started: Swift VKT-SW-001');
      st.push('Rental #2 Started: Innova VKT-INN-006');
      st.push('Return #1 Completed: City VKT-HOC-003');
      setRentalStack(st);
      setStackSnapshot(st.display());

      // Queue
      const qu = new Queue<string>();
      qu.enqueue('Customer A: Waiting for Luxury BMW');
      qu.enqueue('Customer B: Waiting for 7-Seater Innova');
      qu.enqueue('Customer C: Waiting for Nexon EV');
      setWaitingQueue(qu);
      setQueueSnapshot(qu.display());
    }
  }, [rawVehicles]);

  // ==========================================
  // PHASE 2 STATES
  // ==========================================
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

  // ==========================================
  // PHASE 3 STATES
  // ==========================================
  const [searchTarget, setSearchTarget] = useState('Swift');
  const [searchMethod, setSearchMethod] = useState<'linear' | 'binary'>('linear');
  const [searchOutput, setSearchOutput] = useState<any | null>(null);

  const [mergeSortOrder, setMergeSortOrder] = useState<'asc' | 'desc'>('asc');
  const [mergeSortOutput, setMergeSortOutput] = useState<any | null>(null);

  // ==========================================
  // PHASE 4 STATES
  // ==========================================
  const [greedyBudget, setGreedyBudget] = useState(6000);
  const [greedyDays, setGreedyDays] = useState(3);
  const [greedySeats, setGreedySeats] = useState(5);
  const [greedyResult, setGreedyResult] = useState<any | null>(null);

  return (
    <div className="space-y-8">
      {/* Page Header */}
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
          onClick={() => setActiveTab('phase1')}
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
          onClick={() => setActiveTab('phase2')}
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
          onClick={() => setActiveTab('phase3')}
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
          onClick={() => setActiveTab('phase4')}
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

      {/* =========================================================================
          TAB 1: PHASE 1 — LINEAR DATA STRUCTURES
          ========================================================================= */}
      {activeTab === 'phase1' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* 1A. Singly Linked List */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                  Phase 1A • Linear Structure
                </span>
                <h2 className="text-lg font-black text-gray-900">
                  Custom Singly Linked List for Vehicle Records
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full w-fit">
                Insert: O(1) head, O(n) tail • Search: O(n)
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Demonstrates our custom <code>SinglyLinkedList</code> class where each node stores a vehicle entity and a pointer to the next vehicle node in memory.
            </p>

            {/* Input Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Vehicle Model Name"
                value={newVehicleName}
                onChange={(e) => setNewVehicleName(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (!newVehicleName.trim()) return;
                  linkedList.insertAtHead({ id: Date.now(), name: newVehicleName.trim(), status: 'Available' });
                  setLLSnapshot(linkedList.traverse());
                  setNewVehicleName('');
                  toast.success('Inserted vehicle at Linked List Head (O(1))');
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-colors"
              >
                Insert at Head O(1)
              </button>
              <button
                onClick={() => {
                  if (!newVehicleName.trim()) return;
                  linkedList.insertAtTail({ id: Date.now(), name: newVehicleName.trim(), status: 'Available' });
                  setLLSnapshot(linkedList.traverse());
                  setNewVehicleName('');
                  toast.success('Inserted vehicle at Linked List Tail (O(n))');
                }}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors"
              >
                Insert at Tail O(n)
              </button>
              <button
                onClick={() => {
                  const ll = new SinglyLinkedList();
                  rawVehicles.slice(0, 5).forEach((v) => ll.insertAtTail(v));
                  setLinkedList(ll);
                  setLLSnapshot(ll.traverse());
                  toast.success('Reset linked list from database');
                }}
                className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs hover:bg-gray-50 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Visual Node Diagram */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-max py-2">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                  HEAD
                </span>
                <span className="text-gray-400 font-bold">→</span>

                {llSnapshot.map((node, i) => (
                  <React.Fragment key={node.id || i}>
                    <div className="p-3 rounded-2xl bg-white border-2 border-teal-400 shadow-xs text-xs font-semibold text-gray-900 flex flex-col items-center min-w-[130px]">
                      <span className="text-[10px] text-teal-600 font-mono font-bold">
                        Node [{i}]
                      </span>
                      <span className="font-bold text-gray-900 truncate max-w-[120px]">
                        {node.name}
                      </span>
                      <span className="text-[10px] text-gray-600">
                        {node.vehicle_id || `ID: ${node.id}`}
                      </span>
                      <button
                        onClick={() => {
                          linkedList.deleteById(node.id);
                          setLLSnapshot(linkedList.traverse());
                          toast.success(`Deleted node ${node.name}`);
                        }}
                        className="text-[10px] text-red-500 hover:text-red-700 mt-1 font-bold"
                      >
                        [Delete]
                      </button>
                    </div>

                    {i < llSnapshot.length - 1 ? (
                      <span className="text-teal-500 font-black text-lg">→</span>
                    ) : (
                      <>
                        <span className="text-teal-500 font-black text-lg">→</span>
                        <span className="text-xs font-bold text-gray-600 bg-gray-200 px-2 py-1 rounded-lg">
                          NULL
                        </span>
                      </>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* 1B & 1C: Stack and Queue Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 1B. Stack (Recent Operations - LIFO) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-5">
              <div className="border-b border-gray-100 pb-3">
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                  Phase 1B • LIFO Structure
                </span>
                <h3 className="text-base font-black text-gray-900">
                  Stack Using Linked List (Recent Operations)
                </h3>
                <span className="text-[11px] font-mono text-gray-600 block mt-0.5">
                  Push: O(1) • Pop: O(1) • Peek: O(1)
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={stackInput}
                  onChange={(e) => setStackInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (!stackInput.trim()) return;
                    rentalStack.push(stackInput.trim());
                    setStackSnapshot(rentalStack.display());
                    toast.success('Pushed to Stack (LIFO)');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs"
                >
                  Push
                </button>
                <button
                  onClick={() => {
                    const popped = rentalStack.pop();
                    setStackSnapshot(rentalStack.display());
                    if (popped) toast.success(`Popped: ${popped}`);
                    else toast.error('Stack is empty');
                  }}
                  className="px-3.5 py-2 rounded-xl border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50"
                >
                  Pop
                </button>
              </div>

              {/* Stack Visual Pillar */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 max-h-56 overflow-y-auto">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block text-center">
                  ▲ TOP OF STACK (LIFO)
                </span>
                {stackSnapshot.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs font-semibold ${
                      idx === 0
                        ? 'bg-teal-50 border-teal-300 text-teal-900 shadow-xs'
                        : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  >
                    <span className="text-[10px] text-gray-600 block">Slot [{idx}]</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* 1C. Queue (Waiting Customers - FIFO) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-5">
              <div className="border-b border-gray-100 pb-3">
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                  Phase 1C • FIFO Structure
                </span>
                <h3 className="text-base font-black text-gray-900">
                  Queue Using Linked List (Waiting Customers)
                </h3>
                <span className="text-[11px] font-mono text-gray-600 block mt-0.5">
                  Enqueue: O(1) • Dequeue: O(1) • Peek: O(1)
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={queueInput}
                  onChange={(e) => setQueueInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (!queueInput.trim()) return;
                    waitingQueue.enqueue(queueInput.trim());
                    setQueueSnapshot(waitingQueue.display());
                    toast.success('Enqueued customer to rear (FIFO)');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs"
                >
                  Enqueue
                </button>
                <button
                  onClick={() => {
                    const dequeued = waitingQueue.dequeue();
                    setQueueSnapshot(waitingQueue.display());
                    if (dequeued) toast.success(`Served: ${dequeued}`);
                    else toast.error('Queue is empty');
                  }}
                  className="px-3.5 py-2 rounded-xl border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50"
                >
                  Dequeue
                </button>
              </div>

              {/* Queue Visual Pipeline */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 max-h-56 overflow-y-auto">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  <span>← FRONT (Served First)</span>
                  <span>REAR (Enqueued Here) →</span>
                </div>
                {queueSnapshot.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs font-semibold ${
                      idx === 0
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                        : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  >
                    <span className="text-[10px] text-gray-600 block">Position #{idx + 1}</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 1D. Stack-Based Rental Cost Expression Evaluator */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                Phase 1D • Arithmetic Stack Evaluation
              </span>
              <h3 className="text-lg font-black text-gray-900">
                Stack-Based Rental Cost Expression Evaluator
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Evaluates rental expressions using Shunting-yard conversion to postfix and stack-based operand reduction:
                <code> total = (days * dailyRate) - discount + additionalCharges </code>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Rental Days</label>
                <input
                  type="number"
                  min="1"
                  value={evalDays}
                  onChange={(e) => setEvalDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Daily Tariff (INR)</label>
                <input
                  type="number"
                  min="100"
                  value={evalDailyRate}
                  onChange={(e) => setEvalDailyRate(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Discount (INR)</label>
                <input
                  type="number"
                  min="0"
                  value={evalDiscount}
                  onChange={(e) => setEvalDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Extra Surcharges (INR)</label>
                <input
                  type="number"
                  min="0"
                  value={evalCharges}
                  onChange={(e) => setEvalCharges(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>
            </div>

            <button
              onClick={() => {
                const res = evaluateRentalCost(evalDays, evalDailyRate, evalDiscount, evalCharges);
                setExpressionResult(res);
                toast.success('Expression evaluated via stack algorithm');
              }}
              className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Evaluate Expression Using Stack</span>
            </button>

            {/* Expression Steps Output */}
            {expressionResult && (
              <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 text-xs font-mono">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3 font-sans">
                  <div>
                    <span className="text-[10px] text-teal-400 font-bold uppercase block">
                      Infix Expression
                    </span>
                    <span className="font-bold text-sm text-white">{expressionResult.expression}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-teal-400 font-bold uppercase block">
                      Generated Postfix (RPN)
                    </span>
                    <span className="font-bold text-sm text-teal-300">{expressionResult.postfix}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-teal-400 font-bold uppercase block">
                      Evaluated Result
                    </span>
                    <span className="text-lg font-black text-emerald-400">
                      ₹{expressionResult.result.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pt-2">
                  <p className="text-[11px] text-slate-400 font-bold">Step-by-Step Stack Execution:</p>
                  {expressionResult.steps.map((step: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 text-slate-300">
                      <span className="text-teal-400">Step {idx + 1}:</span>
                      <span>{step.action}</span>
                      <span className="text-slate-400 ml-auto font-bold">
                        Stack: [{step.stackState.join(', ')}]
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PHASE 2 — TREES AND GRAPHS
          ========================================================================= */}
      {activeTab === 'phase2' && (
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
      )}

      {/* =========================================================================
          TAB 3: PHASE 3 — SEARCHING AND SORTING
          ========================================================================= */}
      {activeTab === 'phase3' && (
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
      )}

      {/* =========================================================================
          TAB 4: PHASE 4 — GREEDY VEHICLE RECOMMENDATION
          ========================================================================= */}
      {activeTab === 'phase4' && (
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
      )}
    </div>
  );
}
