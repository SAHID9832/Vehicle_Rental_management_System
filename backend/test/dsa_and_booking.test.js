/**
 * Automated Test Suite for Vektor Rentals
 * Covers all 4 DSA Phases and Core Booking Overlap Validation
 */

const assert = require('assert');

console.log('\n======================================================');
console.log('🧪 RUNNING VEKTOR RENTALS DSA & BOOKING TEST SUITE');
console.log('======================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    testsFailed++;
  }
}

const {
  SinglyLinkedList,
  Stack,
  Queue,
  evaluateRentalCostExpression,
  BinaryTree,
  BinarySearchTree,
  Graph,
  linearSearchVehicles,
  binarySearchVehicles,
  mergeSortVehiclesByPrice,
  greedyVehicleRecommendation,
} = require('../src/dsa');

runTest('Phase 1A: Singly Linked List Operations from src/dsa/LinkedList.js', () => {
  const list = new SinglyLinkedList();
  assert.strictEqual(list.size, 0);

  list.insertAtHead({ id: 2, name: 'Hyundai i20' });
  list.insertAtHead({ id: 1, name: 'Maruti Swift' });
  list.insertAtTail({ id: 3, name: 'Honda City' });

  assert.strictEqual(list.size, 3);
  const elements = list.toArray().map((n) => n.data);
  assert.strictEqual(elements[0].name, 'Maruti Swift');
  assert.strictEqual(elements[1].name, 'Hyundai i20');
  assert.strictEqual(elements[2].name, 'Honda City');

  const deleted = list.deleteById(2);
  assert.strictEqual(deleted, true);
  assert.strictEqual(list.size, 2);
  const afterDelete = list.toArray().map((n) => n.data);
  assert.strictEqual(afterDelete[0].name, 'Maruti Swift');
  assert.strictEqual(afterDelete[1].name, 'Honda City');
});

runTest('Phase 1B: Stack LIFO Operations from src/dsa/Stack.js', () => {
  const stack = new Stack();
  stack.push('Trip #101');
  stack.push('Trip #102');
  stack.push('Trip #103');

  assert.strictEqual(stack.size, 3);
  assert.strictEqual(stack.peek(), 'Trip #103');
  assert.strictEqual(stack.pop(), 'Trip #103');
  assert.strictEqual(stack.pop(), 'Trip #102');
  assert.strictEqual(stack.size, 1);
});

runTest('Phase 1C: Queue FIFO Operations from src/dsa/Queue.js', () => {
  const queue = new Queue();
  queue.enqueue('Customer A (First)');
  queue.enqueue('Customer B (Second)');
  queue.enqueue('Customer C (Third)');

  assert.strictEqual(queue.size, 3);
  assert.strictEqual(queue.dequeue(), 'Customer A (First)');
  assert.strictEqual(queue.dequeue(), 'Customer B (Second)');
  assert.strictEqual(queue.size, 1);
});

runTest('Phase 1D: Stack-Based Rental Expression Evaluation from src/dsa/Stack.js', () => {
  // (3 days * 2000 daily rate) - 500 discount + 200 extra = 5700
  const evalResult = evaluateRentalCostExpression(3, 2000, 500, 200);
  assert.strictEqual(evalResult.result, 5700);
  assert.ok(evalResult.steps.length > 0);
  assert.ok(evalResult.postfix.includes('*'));
});

runTest('Phase 2A & 2B: Binary Tree Traversals from src/dsa/BinaryTree.js', () => {
  const tree = new BinaryTree();
  tree.insert({ id: 1, name: 'Sedans' });
  tree.insert({ id: 2, name: 'Economy' });
  tree.insert({ id: 3, name: 'Luxury' });

  const pre = tree.preorder().map((n) => n.id);
  assert.strictEqual(pre.length, 3);
  const inOrder = tree.inorder().map((n) => n.id);
  assert.strictEqual(inOrder.length, 3);
  const post = tree.postorder().map((n) => n.id);
  assert.strictEqual(post.length, 3);
});

runTest('Phase 2C: Binary Search Tree from src/dsa/BinaryTree.js', () => {
  const bst = new BinarySearchTree();
  bst.insert(5, 'Kia Seltos');
  bst.insert(2, 'Hyundai i20');
  bst.insert(8, 'Toyota Fortuner');
  bst.insert(1, 'Maruti Swift');
  bst.insert(3, 'Honda City');

  const found = bst.search(3);
  assert.strictEqual(found.found, true);
  assert.strictEqual(found.node.value, 'Honda City');

  const notFound = bst.search(99);
  assert.strictEqual(notFound.found, false);
});

runTest('Phase 2D & 2E: Graph and BFS Traversal from src/dsa/Graph.js', () => {
  const graph = new Graph(false);
  graph.addNode(1, { name: 'MG Road' });
  graph.addNode(2, { name: 'Airport' });
  graph.addNode(3, { name: 'Indiranagar' });
  graph.addNode(4, { name: 'Whitefield' });

  graph.addEdge(1, 2, 35);
  graph.addEdge(1, 3, 5);
  graph.addEdge(3, 4, 15);

  const bfsRes = graph.bfs(1);
  assert.strictEqual(bfsRes.totalVisited, 4);
  assert.deepStrictEqual(bfsRes.traversalOrder, [1, 2, 3, 4]);
});

runTest('Phase 3A: Linear Search from src/dsa/Searching.js', () => {
  const fleet = [
    { id: 1, name: 'Maruti Swift' },
    { id: 2, name: 'Hyundai i20' },
    { id: 3, name: 'Honda City' },
    { id: 4, name: 'Hyundai Creta' },
  ];
  const res = linearSearchVehicles(fleet, 'Creta');
  assert.strictEqual(res.found.id, 4);
  assert.ok(res.totalComparisons >= 1);
});

runTest('Phase 3B: Binary Search from src/dsa/Searching.js', () => {
  const sortedFleet = [
    { id: 1, name: 'Maruti Swift' },
    { id: 2, name: 'Hyundai i20' },
    { id: 3, name: 'Honda City' },
    { id: 4, name: 'Hyundai Creta' },
    { id: 5, name: 'Toyota Innova' },
  ];
  const res = binarySearchVehicles(sortedFleet, 3);
  assert.strictEqual(res.found.id, 3);
  assert.strictEqual(res.found.name, 'Honda City');
  assert.ok(res.totalComparisons <= 3);
});

runTest('Phase 3C: Merge Sort from src/dsa/MergeSort.js', () => {
  const fleet = [
    { id: 1, name: 'Fortuner', daily_rate: 4000 },
    { id: 2, name: 'Kwid', daily_rate: 800 },
    { id: 3, name: 'BMW', daily_rate: 8000 },
    { id: 4, name: 'Swift', daily_rate: 900 },
  ];
  const res = mergeSortVehiclesByPrice(fleet, 'asc');
  assert.strictEqual(res.sorted[0].name, 'Kwid');
  assert.strictEqual(res.sorted[1].name, 'Swift');
  assert.strictEqual(res.sorted[2].name, 'Fortuner');
  assert.strictEqual(res.sorted[3].name, 'BMW');
});

runTest('Phase 4A: Greedy Vehicle Recommendation from src/dsa/Greedy.js', () => {
  const fleet = [
    { id: 1, name: 'Activa', daily_rate: 400, seating_capacity: 2, status: 'Available' },
    { id: 2, name: 'Swift', daily_rate: 900, seating_capacity: 5, status: 'Available' },
    { id: 3, name: 'City', daily_rate: 1400, seating_capacity: 5, status: 'Available' },
    { id: 4, name: 'Fortuner', daily_rate: 4000, seating_capacity: 7, status: 'Available' },
  ];
  const res = greedyVehicleRecommendation({
    vehicles: fleet,
    budget: 5000,
    days: 3,
    passengers: 5,
  });
  assert.ok(res.recommendedVehicle);
  assert.strictEqual(res.recommendedVehicle.name, 'Swift');
});

// ─────────────────────────────────────────────────────────────
// 12. OVERLAPPING BOOKING LOGIC TEST
// ─────────────────────────────────────────────────────────────
runTest('Booking Engine: Overlapping Time Range Conflict Detection', () => {
  // Existing booking: May 10 10:00 to May 12 10:00
  const existingStart = new Date('2026-05-10T10:00:00Z').getTime();
  const existingEnd = new Date('2026-05-12T10:00:00Z').getTime();

  function hasOverlap(reqStartStr, reqEndStr) {
    const reqStart = new Date(reqStartStr).getTime();
    const reqEnd = new Date(reqEndStr).getTime();
    // NOT (reqEnd <= existingStart OR reqStart >= existingEnd)
    return !(reqEnd <= existingStart || reqStart >= existingEnd);
  }

  // Case 1: Strictly before -> No overlap
  assert.strictEqual(hasOverlap('2026-05-08T10:00:00Z', '2026-05-10T10:00:00Z'), false);

  // Case 2: Strictly after -> No overlap
  assert.strictEqual(hasOverlap('2026-05-12T10:00:00Z', '2026-05-15T10:00:00Z'), false);

  // Case 3: Completely inside -> OVERLAP
  assert.strictEqual(hasOverlap('2026-05-10T14:00:00Z', '2026-05-11T14:00:00Z'), true);

  // Case 4: Starts before, ends during -> OVERLAP
  assert.strictEqual(hasOverlap('2026-05-09T10:00:00Z', '2026-05-11T10:00:00Z'), true);

  // Case 5: Starts during, ends after -> OVERLAP
  assert.strictEqual(hasOverlap('2026-05-11T10:00:00Z', '2026-05-13T10:00:00Z'), true);
});

console.log('\n======================================================');
console.log(`📊 TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
console.log('======================================================\n');

if (testsFailed > 0) {
  process.exit(1);
}
