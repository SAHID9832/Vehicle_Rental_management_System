const pool = require('../config/database');
const { success, error } = require('../utils/response');
const {
  SinglyLinkedList,
  Stack,
  Queue,
  evaluateRentalCostExpression,
  BinarySearchTree,
  Graph,
  linearSearchVehicles,
  binarySearchVehicles,
  mergeSortVehiclesByPrice,
  greedyVehicleRecommendation,
} = require('../dsa');

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

    const sll = new SinglyLinkedList();
    vehicles.forEach((v) => sll.insertAtTail(v));
    const rawNodes = sll.toArray();

    const nodes = rawNodes.map((item) => ({
      node_id: item.node_id,
      vehicle_id: item.data.id,
      name: `${item.data.make} ${item.data.model}`,
      registration_number: item.data.registration_number,
      status: item.data.status,
      daily_rate: item.data.daily_rate,
      data: item.data,
      next: item.next,
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

    const stack = new Stack();
    // Push in reverse so that the most recent is on top
    [...rentals].reverse().forEach((item) => stack.push(item));

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

    const graph = new Graph(false);
    branches.forEach((b) => graph.addNode(b.id, b));
    connections.forEach((c) => {
      graph.addEdge(c.branch_id_a, c.branch_id_b, Number(c.distance_km), {
        travel_time_min: c.travel_time_min,
        to_name: c.to_name,
        from_name: c.from_name,
      });
    });

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
      description: 'Bengaluru rental hubs as vertices; road routes as weighted edges.',
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

    const evaluation = evaluateRentalCostExpression(days, dailyRate, discount, additionalCharges);

    return success(res, {
      structure: 'Stack-Based Expression Evaluator',
      ...evaluation,
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

    const root = BinarySearchTree.buildBalancedBST(vehicles);

    return success(res, {
      structure: 'Binary Search Tree (BST)',
      description: 'Vehicles organised as a BST keyed on vehicle ID for O(log n) search.',
      total_nodes: vehicles.length,
      insertion_order: vehicles.map((v) => ({ id: v.id, label: `${v.make} ${v.model}` })),
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

    const graph = new Graph(false);
    const branchMap = {};
    branches.forEach((b) => {
      branchMap[b.id] = b;
      graph.addNode(b.id, b);
    });

    connections.forEach((c) => {
      graph.addEdge(c.branch_id_a, c.branch_id_b, Number(c.distance_km));
    });

    const parsedStart = parseInt(startBranchId, 10);
    if (!branchMap[parsedStart]) {
      return error(res, `Branch with id ${startBranchId} not found.`, 404);
    }

    const bfsResult = graph.bfs(parsedStart);

    return success(res, {
      structure: 'BFS (Breadth-First Search)',
      start_branch: { id: parsedStart, ...branchMap[parsedStart] },
      traversal_order: bfsResult.traversalOrder.map((id) => ({
        id,
        name: branchMap[id]?.name || `Branch ${id}`,
        city: branchMap[id]?.city || 'Unknown',
      })),
      total_visited: bfsResult.totalVisited,
      steps: bfsResult.steps,
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

    let result;
    if (method === 'binary') {
      const targetId = parseInt(query, 10);
      if (isNaN(targetId)) {
        return error(res, 'Binary search requires a numeric vehicle ID.', 400);
      }
      result = binarySearchVehicles(vehicles, targetId);
    } else {
      result = linearSearchVehicles(vehicles, query);
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
      total_comparisons: result.totalComparisons,
      found: result.found || null,
      comparisons: result.comparisons,
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

    const sortResult = mergeSortVehiclesByPrice(vehicles, order);

    return success(res, {
      structure: 'Merge Sort',
      description: 'O(n log n) — divides array recursively then merges in sorted order.',
      order,
      sort_key: 'daily_rate',
      total_items: vehicles.length,
      original: vehicles.map((v) => ({ id: v.id, name: `${v.make} ${v.model}`, daily_rate: v.daily_rate })),
      sorted: sortResult.sorted.map((v) => ({ id: v.id, name: `${v.make} ${v.model}`, daily_rate: v.daily_rate })),
      steps: sortResult.steps,
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

    const [vehicles] = await pool.query(
      `SELECT v.*, vc.name AS category_name, b.name AS branch_name
       FROM vehicles v
       LEFT JOIN vehicle_categories vc ON vc.id = v.category_id
       LEFT JOIN branches b ON b.id = v.branch_id`
    );

    const recommendation = greedyVehicleRecommendation({
      vehicles,
      budget,
      days,
      passengers: seating,
      preferredBranchId: branchId,
    });

    return success(res, {
      structure: 'Greedy Fleet Recommendation',
      description: recommendation.strategy,
      ...recommendation,
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
