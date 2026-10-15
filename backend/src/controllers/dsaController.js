const pool = require('../config/database');
const { success, error } = require('../utils/response');
const { calculateRentalCost } = require('../utils/helpers');

// ─────────────────────────────────────────────
// 1. LINKED LIST — vehicles ordered by created_at
// ─────────────────────────────────────────────
const getVehicleLinkedList = async (req, res) => {
  try {
    const [vehicles] = await pool.query(
      `SELECT id, make, model, registration_number, status, daily_rate, created_at
       FROM vehicles
       ORDER BY created_at ASC`
    );

    const nodes = vehicles.map((v, index) => ({
      node_id: index + 1,
      vehicle_id: v.id,
      name: `${v.make} ${v.model}`,
      registration_number: v.registration_number,
      status: v.status,
      daily_rate: v.daily_rate,
      data: v,
      next: index < vehicles.length - 1 ? index + 2 : null,
    }));

    return success(res, {
      structure: 'Singly Linked List',
      description: 'Vehicles ordered by registration date, each node points to the next.',
      head: nodes.length > 0 ? nodes[0].node_id : null,
      length: nodes.length,
      nodes,
    });
  } catch (err) {
    console.error('getVehicleLinkedList error:', err);
    return error(res, 'Failed to fetch vehicle linked list.', 500);
  }
};

// ─────────────────────────────────────────────
// 2. STACK — recent operations (last 10 rentals)
// ─────────────────────────────────────────────
const getRecentOperationsStack = async (req, res) => {
  try {
    const [rentals] = await pool.query(
      `SELECT r.id, r.status, r.created_at AS timestamp,
              CASE
                WHEN r.status = 'Completed' THEN 'RETURN'
                ELSE 'PICKUP'
              END AS operation_type,
              v.make, v.model, v.registration_number,
              c.name AS customer_name,
              bk.booking_reference
       FROM rentals r
       JOIN vehicles v ON v.id = r.vehicle_id
       JOIN customers c ON c.id = r.customer_id
       JOIN bookings bk ON bk.id = r.booking_id
       ORDER BY r.created_at DESC
       LIMIT 10`
    );

    const stackItems = rentals.map((item, index) => ({
      stack_position: index,
      is_top: index === 0,
      rental_id: item.id,
      operation: item.operation_type,
      vehicle: `${item.make} ${item.model} (${item.registration_number})`,
      customer: item.customer_name,
      booking_reference: item.booking_reference,
      timestamp: item.timestamp,
    }));

    return success(res, {
      structure: 'Stack (LIFO)',
      description: 'Last 10 rental operations. Most recent operation is at the top (index 0).',
      top: stackItems.length > 0 ? stackItems[0] : null,
      size: stackItems.length,
      items: stackItems,
    });
  } catch (err) {
    console.error('getRecentOperationsStack error:', err);
    return error(res, 'Failed to fetch operations stack.', 500);
  }
};

// ─────────────────────────────────────────────
// 3. QUEUE — waiting queue (FIFO)
// ─────────────────────────────────────────────
const getWaitingQueue = async (req, res) => {
  try {
    const [queueItems] = await pool.query(
      `SELECT * FROM waiting_queue ORDER BY created_at ASC`
    ).catch(() => [[]]);

    // Fallback: use Pending bookings as queue if no waiting_queue table
    let queue = queueItems;
    if (queue.length === 0) {
      const [pendingBookings] = await pool.query(
        `SELECT bk.id, bk.booking_reference AS reference, bk.created_at,
                c.name AS customer_name, v.make, v.model
         FROM bookings bk
         JOIN customers c ON c.id = bk.customer_id
         JOIN vehicles v ON v.id = bk.vehicle_id
         WHERE bk.status = 'Pending'
         ORDER BY bk.created_at ASC
         LIMIT 20`
      );

      queue = pendingBookings.map((b, i) => ({
        queue_position: i + 1,
        is_front: i === 0,
        id: b.id,
        reference: b.booking_reference || b.reference,
        customer_name: b.customer_name,
        vehicle: b.make ? `${b.make} ${b.model}` : 'N/A',
        enqueued_at: b.created_at,
      }));

      return success(res, {
        structure: 'Queue (FIFO)',
        description: 'Pending bookings waiting for confirmation. First in, first served.',
        front: queue.length > 0 ? queue[0] : null,
        rear: queue.length > 0 ? queue[queue.length - 1] : null,
        size: queue.length,
        items: queue,
      });
    }

    const formattedQueue = queue.map((item, i) => ({
      queue_position: i + 1,
      is_front: i === 0,
      ...item,
    }));

    return success(res, {
      structure: 'Queue (FIFO)',
      description: 'Customer waiting queue. First customer in line is served first.',
      front: formattedQueue.length > 0 ? formattedQueue[0] : null,
      rear: formattedQueue.length > 0 ? formattedQueue[formattedQueue.length - 1] : null,
      size: formattedQueue.length,
      items: formattedQueue,
    });
  } catch (err) {
    console.error('getWaitingQueue error:', err);
    return error(res, 'Failed to fetch waiting queue.', 500);
  }
};

// ─────────────────────────────────────────────
// 4. GRAPH — branch graph with adjacency list
// ─────────────────────────────────────────────
const getBranchGraph = async (req, res) => {
  try {
    const [branches] = await pool.query(
      'SELECT id, name, city, latitude, longitude FROM branches WHERE is_active = 1 ORDER BY name ASC'
    );

    const [connections] = await pool.query(
      `SELECT bc.*, ba.name AS from_name, bb.name AS to_name
       FROM branch_connections bc
       JOIN branches ba ON ba.id = bc.branch_id_a
       JOIN branches bb ON bb.id = bc.branch_id_b`
    );

    // Build adjacency list
    const adjacencyList = {};
    branches.forEach((b) => {
      adjacencyList[b.id] = [];
    });

    connections.forEach((c) => {
      adjacencyList[c.branch_id_a].push({
        id: c.branch_id_b,
        name: c.to_name,
        weight: c.distance_km,
        distance_km: c.distance_km,
        travel_time_min: c.travel_time_min,
        edge_id: c.id,
      });
      if (!c.is_directed) {
        adjacencyList[c.branch_id_b].push({
          id: c.branch_id_a,
          name: c.from_name,
          weight: c.distance_km,
          distance_km: c.distance_km,
          travel_time_min: c.travel_time_min,
          edge_id: c.id,
        });
      }
    });

    return success(res, {
      structure: 'Undirected Weighted Graph',
      description: 'Branch network. Nodes = branches, Edges = routes with distance weights.',
      node_count: branches.length,
      edge_count: connections.length,
      nodes: branches,
      edges: connections,
      adjacencyList,
    });
  } catch (err) {
    console.error('getBranchGraph error:', err);
    return error(res, 'Failed to fetch branch graph.', 500);
  }
};

// ─────────────────────────────────────────────
// 5. EXPRESSION EVALUATOR — stack-based evaluation
// ─────────────────────────────────────────────
const evaluateRentalExpression = async (req, res) => {
  try {
    const days = req.body.days;
    const dailyRate = req.body.dailyRate || req.body.daily_rate;
    const discount = req.body.discount ?? req.body.discount_pct ?? 0;
    const additionalCharges = req.body.additionalCharges ?? req.body.insurance ?? req.body.additional_charges ?? 0;

    if (!days || !dailyRate) {
      return error(res, 'days and dailyRate are required.', 400);
    }

    const d = parseFloat(days);
    const r = parseFloat(dailyRate);
    const disc = parseFloat(discount);
    const extra = parseFloat(additionalCharges);

    // Simulate stack-based evaluation of: (days * dailyRate) - discount + additionalCharges
    const steps = [];
    const stack = [];

    steps.push({ step: 1, action: 'PUSH days', value: d, stack: [d] });
    stack.push(d);

    steps.push({ step: 2, action: 'PUSH dailyRate', value: r, stack: [...stack, r] });
    stack.push(r);

    const subtotal = d * r;
    stack.pop(); stack.pop();
    stack.push(subtotal);
    steps.push({ step: 3, action: 'MUL (days × dailyRate)', value: subtotal, stack: [...stack] });

    stack.push(disc);
    steps.push({ step: 4, action: 'PUSH discount', value: disc, stack: [...stack] });

    const afterDiscount = subtotal - disc;
    stack.pop(); stack.pop();
    stack.push(afterDiscount);
    steps.push({ step: 5, action: 'SUB (subtotal - discount)', value: afterDiscount, stack: [...stack] });

    stack.push(extra);
    steps.push({ step: 6, action: 'PUSH additionalCharges', value: extra, stack: [...stack] });

    const total = afterDiscount + extra;
    stack.pop(); stack.pop();
    stack.push(total);
    steps.push({ step: 7, action: 'ADD (afterDiscount + additionalCharges)', value: total, stack: [...stack] });

    steps.push({ step: 8, action: 'POP result', value: total, stack: [] });

    return success(res, {
      structure: 'Stack-Based Expression Evaluator',
      expression: `(${days} × ${dailyRate}) - ${discount} + ${additionalCharges}`,
      infix: `(days * dailyRate) - discount + additionalCharges`,
      inputs: { days: d, dailyRate: r, discount: disc, additionalCharges: extra },
      result: parseFloat(Math.max(0, total).toFixed(2)),
      steps,
    });
  } catch (err) {
    console.error('evaluateRentalExpression error:', err);
    return error(res, 'Failed to evaluate expression.', 500);
  }
};

// ─────────────────────────────────────────────
// 6. BST — vehicles by vehicle_id
// ─────────────────────────────────────────────
const getBSTVehicles = async (req, res) => {
  try {
    const [vehicles] = await pool.query(
      `SELECT id, make, model, daily_rate, status
       FROM vehicles
       WHERE status != 'Inactive'
       ORDER BY id ASC`
    );

    // Build BST insertion order (insert median first for balanced structure)
    const buildBSTArray = (arr) => {
      if (arr.length === 0) return [];
      const mid = Math.floor(arr.length / 2);
      return [arr[mid], ...buildBSTArray(arr.slice(0, mid)), ...buildBSTArray(arr.slice(mid + 1))];
    };

    const bstOrder = buildBSTArray(vehicles);

    // Build visual BST structure
    const buildBSTNode = (arr, start, end, depth = 0) => {
      if (start > end) return null;
      const mid = Math.floor((start + end) / 2);
      const item = arr[mid];
      return {
        key: item.id,
        value: `${item.make} ${item.model}`,
        daily_rate: item.daily_rate,
        status: item.status,
        depth,
        left: buildBSTNode(arr, start, mid - 1, depth + 1),
        right: buildBSTNode(arr, mid + 1, end, depth + 1),
      };
    };

    const sortedVehicles = [...vehicles].sort((a, b) => a.id - b.id);
    const root = buildBSTNode(sortedVehicles, 0, sortedVehicles.length - 1);

    return success(res, {
      structure: 'Binary Search Tree (BST)',
      description: 'Vehicles organised as a BST keyed on vehicle ID for O(log n) search.',
      total_nodes: vehicles.length,
      insertion_order: bstOrder.map((v) => ({ id: v.id, label: `${v.make} ${v.model}` })),
      root,
    });
  } catch (err) {
    console.error('getBSTVehicles error:', err);
    return error(res, 'Failed to fetch BST vehicles.', 500);
  }
};

// ─────────────────────────────────────────────
// 7. BFS — branch graph traversal
// ─────────────────────────────────────────────
const runBFS = async (req, res) => {
  try {
    const startBranchId = req.body.startBranchId || req.body.start_branch_id || req.body.branchId || req.body.branch_id;

    if (!startBranchId) {
      return error(res, 'startBranchId is required.', 400);
    }

    const [branches] = await pool.query(
      'SELECT id, name, city FROM branches WHERE is_active = 1'
    );

    const [connections] = await pool.query(
      'SELECT branch_id_a, branch_id_b, distance_km FROM branch_connections'
    );

    const branchMap = {};
    const adjacency = {};

    branches.forEach((b) => {
      branchMap[b.id] = b;
      adjacency[b.id] = [];
    });

    connections.forEach((c) => {
      adjacency[c.branch_id_a].push({ id: c.branch_id_b, weight: c.distance_km });
      adjacency[c.branch_id_b].push({ id: c.branch_id_a, weight: c.distance_km });
    });

    // Check start branch exists
    if (!branchMap[startBranchId]) {
      return error(res, `Branch with id ${startBranchId} not found.`, 404);
    }

    // BFS algorithm
    const visited = new Set();
    const queue = [startBranchId];
    const traversalOrder = [];
    const steps = [];

    visited.add(startBranchId);

    while (queue.length > 0) {
      const current = queue.shift();
      const currentBranch = branchMap[current];
      traversalOrder.push(current);

      const neighbors = adjacency[current] || [];
      const newNeighbors = [];

      neighbors.forEach((n) => {
        if (!visited.has(n.id)) {
          visited.add(n.id);
          queue.push(n.id);
          newNeighbors.push(n.id);
        }
      });

      steps.push({
        step: traversalOrder.length,
        visited_node: current,
        node_name: currentBranch ? `${currentBranch.name} (${currentBranch.city})` : `Branch ${current}`,
        queue_after: [...queue],
        neighbors_discovered: newNeighbors,
      });
    }

    return success(res, {
      structure: 'BFS (Breadth-First Search)',
      start_branch: { id: startBranchId, ...branchMap[startBranchId] },
      traversal_order: traversalOrder.map((id) => ({
        id,
        name: branchMap[id]?.name || `Branch ${id}`,
        city: branchMap[id]?.city || 'Unknown',
      })),
      total_visited: traversalOrder.length,
      steps,
    });
  } catch (err) {
    console.error('runBFS error:', err);
    return error(res, 'Failed to run BFS.', 500);
  }
};

// ─────────────────────────────────────────────
// 8. SEARCH — linear or binary on vehicles
// ─────────────────────────────────────────────
const searchVehicles = async (req, res) => {
  try {
    const { query, method = 'linear' } = req.body;

    if (!query) {
      return error(res, 'query is required.', 400);
    }

    const [vehicles] = await pool.query(
      `SELECT id, make, model, registration_number, daily_rate, status
       FROM vehicles WHERE status != 'Inactive' ORDER BY id ASC`
    );

    const comparisons = [];
    let found = null;
    const searchTerm = String(query).toLowerCase();

    if (method === 'binary') {
      // Binary search by vehicle ID (assumes sorted by id)
      const targetId = parseInt(query, 10);
      if (isNaN(targetId)) {
        return error(res, 'Binary search requires a numeric vehicle ID.', 400);
      }

      let left = 0;
      let right = vehicles.length - 1;
      let steps = 0;

      while (left <= right) {
        steps++;
        const mid = Math.floor((left + right) / 2);
        const midVehicle = vehicles[mid];
        comparisons.push({
          step: steps,
          low: left,
          high: right,
          mid,
          compared_id: midVehicle.id,
          compared_vehicle: `${midVehicle.make} ${midVehicle.model}`,
          result: midVehicle.id === targetId ? 'FOUND' : midVehicle.id < targetId ? 'GO RIGHT' : 'GO LEFT',
        });

        if (midVehicle.id === targetId) {
          found = midVehicle;
          break;
        } else if (midVehicle.id < targetId) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
    } else {
      // Linear search
      for (let i = 0; i < vehicles.length; i++) {
        const v = vehicles[i];
        const match =
          v.make.toLowerCase().includes(searchTerm) ||
          v.model.toLowerCase().includes(searchTerm) ||
          v.registration_number.toLowerCase().includes(searchTerm);

        comparisons.push({
          step: i + 1,
          index: i,
          vehicle: `${v.make} ${v.model} (${v.registration_number})`,
          match,
        });

        if (match && !found) {
          found = v;
        }
      }
    }

    return success(res, {
      structure: method === 'binary' ? 'Binary Search' : 'Linear Search',
      description:
        method === 'binary'
          ? 'O(log n) — searches sorted array by ID, halving the search space each step.'
          : 'O(n) — checks each vehicle sequentially until a match is found.',
      query,
      method,
      total_vehicles: vehicles.length,
      total_comparisons: comparisons.length,
      found: found || null,
      comparisons,
    });
  } catch (err) {
    console.error('searchVehicles error:', err);
    return error(res, 'Failed to search vehicles.', 500);
  }
};

// ─────────────────────────────────────────────
// 9. SORT — merge sort vehicles by daily_rate
// ─────────────────────────────────────────────
const sortVehicles = async (req, res) => {
  try {
    const { order = 'asc' } = req.body;

    const [vehicles] = await pool.query(
      `SELECT id, make, model, daily_rate, status
       FROM vehicles WHERE status != 'Inactive'`
    );

    const steps = [];
    let stepCount = 0;

    const merge = (left, right) => {
      const result = [];
      let i = 0;
      let j = 0;
      while (i < left.length && j < right.length) {
        const cmp =
          order === 'asc'
            ? left[i].daily_rate <= right[j].daily_rate
            : left[i].daily_rate >= right[j].daily_rate;
        if (cmp) {
          result.push(left[i++]);
        } else {
          result.push(right[j++]);
        }
      }
      return [...result, ...left.slice(i), ...right.slice(j)];
    };

    const mergeSort = (arr) => {
      if (arr.length <= 1) return arr;
      const mid = Math.floor(arr.length / 2);
      const left = mergeSort(arr.slice(0, mid));
      const right = mergeSort(arr.slice(mid));
      const merged = merge(left, right);

      if (stepCount < 20) {
        steps.push({
          step: ++stepCount,
          action: `Merge [${left.map((v) => v.daily_rate).join(', ')}] + [${right.map((v) => v.daily_rate).join(', ')}]`,
          result: merged.map((v) => v.daily_rate),
        });
      }

      return merged;
    };

    const sorted = mergeSort([...vehicles]);

    return success(res, {
      structure: 'Merge Sort',
      description: 'O(n log n) — divides array recursively then merges in sorted order.',
      order,
      sort_key: 'daily_rate',
      total_items: vehicles.length,
      original: vehicles.map((v) => ({ id: v.id, name: `${v.make} ${v.model}`, daily_rate: v.daily_rate })),
      sorted: sorted.map((v) => ({ id: v.id, name: `${v.make} ${v.model}`, daily_rate: v.daily_rate })),
      steps,
    });
  } catch (err) {
    console.error('sortVehicles error:', err);
    return error(res, 'Failed to sort vehicles.', 500);
  }
};

// ─────────────────────────────────────────────
// 10. GREEDY RECOMMENDATION
// ─────────────────────────────────────────────
const greedyRecommend = async (req, res) => {
  try {
    const { budget, category, seating, days, branchId } = req.body;

    if (!budget || !days) {
      return error(res, 'budget and days are required.', 400);
    }

    const maxDailyRate = parseFloat(budget) / parseInt(days, 10);
    const conditions = ["v.status = 'Available'", 'v.daily_rate <= ?'];
    const params = [maxDailyRate];

    if (category) { conditions.push('vc.name = ?'); params.push(category); }
    if (seating) { conditions.push('v.seating_capacity >= ?'); params.push(parseInt(seating, 10)); }
    if (branchId) { conditions.push('v.branch_id = ?'); params.push(branchId); }

    const [eligible] = await pool.query(
      `SELECT v.*, vc.name AS category_name, b.name AS branch_name
       FROM vehicles v
       LEFT JOIN vehicle_categories vc ON vc.id = v.category_id
       LEFT JOIN branches b ON b.id = v.branch_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY v.daily_rate DESC`,
      params
    );

    const steps = [];
    let selected = null;

    // Greedy: pick the best value (highest daily_rate within budget)
    for (let i = 0; i < eligible.length; i++) {
      const v = eligible[i];
      const totalCost = v.daily_rate * parseInt(days, 10);
      const withinBudget = totalCost <= parseFloat(budget);

      steps.push({
        step: i + 1,
        vehicle: `${v.make} ${v.model}`,
        daily_rate: v.daily_rate,
        total_cost: totalCost,
        within_budget: withinBudget,
        decision: !selected && withinBudget ? 'SELECTED (best value within budget)' : 'SKIPPED',
      });

      if (!selected && withinBudget) {
        selected = v;
        selected.estimated_total = totalCost;
      }
    }

    return success(res, {
      structure: 'Greedy Algorithm',
      description:
        'Selects the vehicle with the highest daily rate that still fits within the total budget — maximising value greedily.',
      inputs: { budget: parseFloat(budget), days: parseInt(days, 10), category, seating, branchId },
      max_daily_rate: maxDailyRate,
      eligible_vehicles: eligible.length,
      recommendation: selected,
      steps,
    });
  } catch (err) {
    console.error('greedyRecommend error:', err);
    return error(res, 'Failed to run greedy recommendation.', 500);
  }
};

module.exports = {
  getVehicleLinkedList,
  getRecentOperationsStack,
  getWaitingQueue,
  getBranchGraph,
  evaluateRentalExpression,
  getBSTVehicles,
  runBFS,
  searchVehicles,
  sortVehicles,
  greedyRecommend,
};
