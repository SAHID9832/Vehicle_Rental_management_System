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

// ─────────────────────────────────────────────────────────────
// 1. LINKED LIST TEST
// ─────────────────────────────────────────────────────────────
class ListNode {
  constructor(data, next = null) {
    this.data = data;
    this.next = next;
  }
}

class SinglyLinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }
  insertAtHead(data) {
    this.head = new ListNode(data, this.head);
    this.size++;
  }
  insertAtTail(data) {
    const node = new ListNode(data);
    if (!this.head) {
      this.head = node;
    } else {
      let cur = this.head;
      while (cur.next) cur = cur.next;
      cur.next = node;
    }
    this.size++;
  }
  deleteById(id) {
    if (!this.head) return false;
    if (this.head.data.id === id) {
      this.head = this.head.next;
      this.size--;
      return true;
    }
    let cur = this.head;
    while (cur.next) {
      if (cur.next.data.id === id) {
        cur.next = cur.next.next;
        this.size--;
        return true;
      }
      cur = cur.next;
    }
    return false;
  }
  traverse() {
    const res = [];
    let cur = this.head;
    while (cur) {
      res.push(cur.data);
      cur = cur.next;
    }
    return res;
  }
}

runTest('Phase 1A: Singly Linked List Operations', () => {
  const list = new SinglyLinkedList();
  assert.strictEqual(list.size, 0);

  list.insertAtHead({ id: 2, name: 'Hyundai i20' });
  list.insertAtHead({ id: 1, name: 'Maruti Swift' });
  list.insertAtTail({ id: 3, name: 'Honda City' });

  assert.strictEqual(list.size, 3);
  const elements = list.traverse();
  assert.strictEqual(elements[0].name, 'Maruti Swift');
  assert.strictEqual(elements[1].name, 'Hyundai i20');
  assert.strictEqual(elements[2].name, 'Honda City');

  const deleted = list.deleteById(2);
  assert.strictEqual(deleted, true);
  assert.strictEqual(list.size, 2);
  const afterDelete = list.traverse();
  assert.strictEqual(afterDelete[0].name, 'Maruti Swift');
  assert.strictEqual(afterDelete[1].name, 'Honda City');
});

// ─────────────────────────────────────────────────────────────
// 2. STACK TEST (LIFO)
// ─────────────────────────────────────────────────────────────
class Stack {
  constructor() {
    this.top = null;
    this.size = 0;
  }
  push(data) {
    this.top = { data, next: this.top };
    this.size++;
  }
  pop() {
    if (!this.top) return null;
    const val = this.top.data;
    this.top = this.top.next;
    this.size--;
    return val;
  }
  peek() {
    return this.top ? this.top.data : null;
  }
}

runTest('Phase 1B: Stack LIFO Operations', () => {
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

// ─────────────────────────────────────────────────────────────
// 3. QUEUE TEST (FIFO)
// ─────────────────────────────────────────────────────────────
class Queue {
  constructor() {
    this.front = null;
    this.rear = null;
    this.size = 0;
  }
  enqueue(data) {
    const node = { data, next: null };
    if (!this.rear) {
      this.front = this.rear = node;
    } else {
      this.rear.next = node;
      this.rear = node;
    }
    this.size++;
  }
  dequeue() {
    if (!this.front) return null;
    const val = this.front.data;
    this.front = this.front.next;
    if (!this.front) this.rear = null;
    this.size--;
    return val;
  }
}

runTest('Phase 1C: Queue FIFO Operations for Waiting Customers', () => {
  const queue = new Queue();
  queue.enqueue('Customer A (First)');
  queue.enqueue('Customer B (Second)');
  queue.enqueue('Customer C (Third)');

  assert.strictEqual(queue.size, 3);
  assert.strictEqual(queue.dequeue(), 'Customer A (First)');
  assert.strictEqual(queue.dequeue(), 'Customer B (Second)');
  assert.strictEqual(queue.size, 1);
});

// ─────────────────────────────────────────────────────────────
// 4. STACK-BASED EXPRESSION EVALUATOR TEST
// ─────────────────────────────────────────────────────────────
runTest('Phase 1D: Stack-Based Rental Expression Evaluation', () => {
  // Evaluates postfix: "3 2000 * 500 - 200 +"
  // (3 * 2000) - 500 + 200 = 6000 - 500 + 200 = 5700
  const stack = [];
  const tokens = ['3', '2000', '*', '500', '-', '200', '+'];

  for (const token of tokens) {
    if (!isNaN(Number(token))) {
      stack.push(Number(token));
    } else {
      const b = stack.pop();
      const a = stack.pop();
      if (token === '*') stack.push(a * b);
      else if (token === '-') stack.push(a - b);
      else if (token === '+') stack.push(a + b);
    }
  }

  assert.strictEqual(stack.length, 1);
  assert.strictEqual(stack[0], 5700);
});

// ─────────────────────────────────────────────────────────────
// 5. BINARY TREE TRAVERSALS TEST
// ─────────────────────────────────────────────────────────────
class BTreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

runTest('Phase 2A & 2B: Binary Tree Preorder, Inorder, Postorder Traversals', () => {
  //        1 (Sedans)
  //       / \
  //      2   3 (Economy, Luxury)
  const root = new BTreeNode(1, new BTreeNode(2), new BTreeNode(3));

  const preorder = [];
  const traversePre = (n) => {
    if (!n) return;
    preorder.push(n.val);
    traversePre(n.left);
    traversePre(n.right);
  };
  traversePre(root);
  assert.deepStrictEqual(preorder, [1, 2, 3]);

  const inorder = [];
  const traverseIn = (n) => {
    if (!n) return;
    traverseIn(n.left);
    inorder.push(n.val);
    traverseIn(n.right);
  };
  traverseIn(root);
  assert.deepStrictEqual(inorder, [2, 1, 3]);

  const postorder = [];
  const traversePost = (n) => {
    if (!n) return;
    traversePost(n.left);
    traversePost(n.right);
    postorder.push(n.val);
  };
  traversePost(root);
  assert.deepStrictEqual(postorder, [2, 3, 1]);
});

// ─────────────────────────────────────────────────────────────
// 6. BINARY SEARCH TREE TEST
// ─────────────────────────────────────────────────────────────
class BSTNode {
  constructor(key, val) {
    this.key = key;
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

class BST {
  constructor() {
    this.root = null;
  }
  insert(key, val) {
    const node = new BSTNode(key, val);
    if (!this.root) {
      this.root = node;
      return;
    }
    let cur = this.root;
    while (true) {
      if (key < cur.key) {
        if (!cur.left) {
          cur.left = node;
          return;
        }
        cur = cur.left;
      } else if (key > cur.key) {
        if (!cur.right) {
          cur.right = node;
          return;
        }
        cur = cur.right;
      } else return;
    }
  }
  search(key) {
    let cur = this.root;
    let comparisons = 0;
    while (cur) {
      comparisons++;
      if (key === cur.key) return { found: true, val: cur.val, comparisons };
      if (key < cur.key) cur = cur.left;
      else cur = cur.right;
    }
    return { found: false, val: null, comparisons };
  }
}

runTest('Phase 2C: Binary Search Tree Insert and Lookup', () => {
  const bst = new BST();
  bst.insert(5, 'Kia Seltos');
  bst.insert(2, 'Hyundai i20');
  bst.insert(8, 'Toyota Fortuner');
  bst.insert(1, 'Maruti Swift');
  bst.insert(3, 'Honda City');

  const found = bst.search(3);
  assert.strictEqual(found.found, true);
  assert.strictEqual(found.val, 'Honda City');
  assert.ok(found.comparisons <= 3);

  const notFound = bst.search(99);
  assert.strictEqual(notFound.found, false);
});

// ─────────────────────────────────────────────────────────────
// 7. GRAPH & BFS TRAVERSAL TEST
// ─────────────────────────────────────────────────────────────
runTest('Phase 2D & 2E: Branch Graph & BFS Level-by-Level Traversal', () => {
  // Graph: 1 (MG Road) connected to 2 (Airport) and 3 (Indiranagar)
  // 3 connected to 4 (Whitefield)
  const adj = {
    1: [2, 3],
    2: [1],
    3: [1, 4],
    4: [3],
  };

  const visited = new Set();
  const queue = [1];
  visited.add(1);
  const order = [];

  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);
    for (const neighbor of adj[node] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  assert.deepStrictEqual(order, [1, 2, 3, 4]);
});

// ─────────────────────────────────────────────────────────────
// 8. LINEAR SEARCH TEST
// ─────────────────────────────────────────────────────────────
runTest('Phase 3A: Linear Search O(n)', () => {
  const arr = ['Swift', 'i20', 'City', 'Creta', 'Innova'];
  let comparisons = 0;
  let foundIndex = -1;

  for (let i = 0; i < arr.length; i++) {
    comparisons++;
    if (arr[i] === 'Creta') {
      foundIndex = i;
      break;
    }
  }

  assert.strictEqual(foundIndex, 3);
  assert.strictEqual(comparisons, 4);
});

// ─────────────────────────────────────────────────────────────
// 9. BINARY SEARCH TEST
// ─────────────────────────────────────────────────────────────
runTest('Phase 3B: Binary Search O(log n)', () => {
  const sortedKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // sorted keys
  let low = 0, high = sortedKeys.length - 1;
  let target = 7;
  let found = false;
  let comparisons = 0;

  while (low <= high) {
    comparisons++;
    const mid = Math.floor((low + high) / 2);
    if (sortedKeys[mid] === target) {
      found = true;
      break;
    } else if (sortedKeys[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  assert.strictEqual(found, true);
  assert.ok(comparisons <= 4); // log2(10) ≈ 3.32 -> max 4 comparisons
});

// ─────────────────────────────────────────────────────────────
// 10. MERGE SORT TEST
// ─────────────────────────────────────────────────────────────
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i].daily_rate <= right[j].daily_rate) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  while (i < left.length) result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);
  return result;
}

runTest('Phase 3C: Merge Sort from Scratch O(n log n)', () => {
  const fleet = [
    { name: 'Fortuner', daily_rate: 4000 },
    { name: 'Kwid', daily_rate: 800 },
    { name: 'BMW', daily_rate: 8000 },
    { name: 'Swift', daily_rate: 900 },
    { name: 'Innova', daily_rate: 2500 },
  ];

  const sorted = mergeSort(fleet);
  assert.strictEqual(sorted[0].name, 'Kwid');
  assert.strictEqual(sorted[1].name, 'Swift');
  assert.strictEqual(sorted[2].name, 'Innova');
  assert.strictEqual(sorted[3].name, 'Fortuner');
  assert.strictEqual(sorted[4].name, 'BMW');
});

// ─────────────────────────────────────────────────────────────
// 11. GREEDY RECOMMENDATION TEST
// ─────────────────────────────────────────────────────────────
runTest('Phase 4A: Greedy Vehicle Allocation', () => {
  const fleet = [
    { name: 'Activa', daily_rate: 400, seats: 2, status: 'Available' },
    { name: 'Swift', daily_rate: 900, seats: 5, status: 'Available' },
    { name: 'City', daily_rate: 1400, seats: 5, status: 'Available' },
    { name: 'Innova', daily_rate: 2500, seats: 7, status: 'Available' },
    { name: 'Fortuner', daily_rate: 4000, seats: 7, status: 'Available' },
  ];

  // Requirements: budget 5000, 3 days, min 5 seats
  const budget = 5000;
  const days = 3;
  const minSeats = 5;

  // Filter candidates
  const eligible = fleet
    .filter((v) => v.status === 'Available' && v.seats >= minSeats)
    .map((v) => ({ ...v, totalCost: v.daily_rate * days }))
    .filter((v) => v.totalCost <= budget);

  // Greedy choice: sort by cost ascending, pick first (cheapest meeting criteria)
  eligible.sort((a, b) => a.totalCost - b.totalCost);

  assert.strictEqual(eligible.length, 2); // Swift (2700) and City (4200) fit in 5000
  assert.strictEqual(eligible[0].name, 'Swift');
  assert.strictEqual(eligible[0].totalCost, 2700);
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
