/**
 * Phase 3A: Linear Search O(n)
 * Phase 3B: Binary Search O(log n)
 * Searching algorithms with step-by-step audit logging and comparison counters.
 */

/**
 * Linear Search O(n)
 * Evaluates each element sequentially.
 */
function linearSearchVehicles(vehicles, query) {
  const searchTerm = String(query).toLowerCase().trim();
  const comparisons = [];
  let found = null;

  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    const name = (v.name || '').toLowerCase();
    const make = (v.make || v.brand || '').toLowerCase();
    const model = (v.model || '').toLowerCase();
    const reg = (v.registration_number || v.vehicle_id || '').toLowerCase();

    const match =
      name.includes(searchTerm) ||
      make.includes(searchTerm) ||
      model.includes(searchTerm) ||
      reg.includes(searchTerm);

    comparisons.push({
      step: i + 1,
      index: i,
      vehicle: `${v.name || `${v.make || v.brand} ${v.model}`} (${v.registration_number || v.vehicle_id})`,
      match,
    });

    if (match && !found) {
      found = v;
    }
  }

  return {
    method: 'linear',
    timeComplexity: 'O(n)',
    totalComparisons: comparisons.length,
    found,
    comparisons,
  };
}

/**
 * Binary Search O(log n)
 * Searches a sorted collection by numeric key or ID, halving the search space each step.
 */
function binarySearchVehicles(vehicles, targetId) {
  const id = parseInt(targetId, 10);
  if (isNaN(id)) {
    throw new Error('Binary search requires a numeric vehicle ID.');
  }

  // Ensure vehicles are sorted by ID
  const sorted = [...vehicles].sort((a, b) => a.id - b.id);
  const comparisons = [];
  let left = 0;
  let right = sorted.length - 1;
  let steps = 0;
  let found = null;

  while (left <= right) {
    steps++;
    const mid = Math.floor((left + right) / 2);
    const midVehicle = sorted[mid];

    const result =
      midVehicle.id === id
        ? 'FOUND'
        : midVehicle.id < id
        ? 'GO RIGHT'
        : 'GO LEFT';

    comparisons.push({
      step: steps,
      low: left,
      high: right,
      mid,
      compared_id: midVehicle.id,
      compared_vehicle: `${midVehicle.make || midVehicle.brand} ${midVehicle.model}`,
      result,
    });

    if (midVehicle.id === id) {
      found = midVehicle;
      break;
    } else if (midVehicle.id < id) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return {
    method: 'binary',
    timeComplexity: 'O(log n)',
    totalComparisons: comparisons.length,
    found,
    comparisons,
  };
}

module.exports = {
  linearSearchVehicles,
  binarySearchVehicles,
};
