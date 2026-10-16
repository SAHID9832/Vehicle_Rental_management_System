import React, { useState, useEffect } from 'react';
import { RotateCcw, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { SinglyLinkedList } from '../../dsa/LinkedList';
import { Stack, evaluateRentalCost } from '../../dsa/Stack';
import { Queue } from '../../dsa/Queue';

interface Phase1LinearTabProps {
  rawVehicles: any[];
}

export const Phase1LinearTab: React.FC<Phase1LinearTabProps> = ({ rawVehicles }) => {
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

  useEffect(() => {
    if (rawVehicles.length > 0) {
      // Linked list initialization
      const ll = new SinglyLinkedList();
      rawVehicles.slice(0, 5).forEach((v) => ll.insertAtTail(v));
      setLinkedList(ll);
      setLLSnapshot(ll.traverse());

      // Stack initialization
      const st = new Stack<string>();
      st.push('Rental #1 Started: Swift VKT-SW-001');
      st.push('Rental #2 Started: Innova VKT-INN-006');
      st.push('Return #1 Completed: City VKT-HOC-003');
      setRentalStack(st);
      setStackSnapshot(st.display());

      // Queue initialization
      const qu = new Queue<string>();
      qu.enqueue('Customer A: Waiting for Luxury BMW');
      qu.enqueue('Customer B: Waiting for 7-Seater Innova');
      qu.enqueue('Customer C: Waiting for Nexon EV');
      setWaitingQueue(qu);
      setQueueSnapshot(qu.display());
    }
  }, [rawVehicles]);

  return (
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
                toast.success('Enqueued customer (FIFO)');
              }}
              className="px-3.5 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs"
            >
              Enqueue
            </button>
            <button
              onClick={() => {
                const deq = waitingQueue.dequeue();
                setQueueSnapshot(waitingQueue.display());
                if (deq) toast.success(`Served: ${deq}`);
                else toast.error('Queue is empty');
              }}
              className="px-3.5 py-2 rounded-xl border border-teal-200 text-teal-700 font-bold text-xs hover:bg-teal-50"
            >
              Dequeue
            </button>
          </div>

          {/* Queue Visual Pipeline */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 max-h-56 overflow-y-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block text-center">
              FRONT OF QUEUE ➔ (SERVED FIRST)
            </span>
            {queueSnapshot.map((item, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-xs font-semibold ${
                  idx === 0
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                <span className="text-[10px] text-gray-600 block">Position [{idx + 1}]</span>
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
  );
};
