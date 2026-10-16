/**
 * Phase 3C: Merge Sort from Scratch O(n log n)
 * Recursive divide-and-conquer sorting algorithm with recursion and merge trace steps.
 */

function mergeSortVehiclesByPrice(vehicles, order = 'asc') {
  const steps = [];
  let stepCount = 0;

  function merge(left, right) {
    const result = [];
    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
      const leftRate = Number(left[i].daily_rate);
      const rightRate = Number(right[j].daily_rate);

      const condition = order === 'asc' ? leftRate <= rightRate : leftRate >= rightRate;
      if (condition) {
        result.push(left[i++]);
      } else {
        result.push(right[j++]);
      }
    }

    return [...result, ...left.slice(i), ...right.slice(j)];
  }

  function sort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = sort(arr.slice(0, mid));
    const right = sort(arr.slice(mid));
    const merged = merge(left, right);

    if (stepCount < 20) {
      stepCount++;
      steps.push({
        step: stepCount,
        action: `Merge [${left.map((v) => Number(v.daily_rate)).join(', ')}] + [${right.map((v) => Number(v.daily_rate)).join(', ')}]`,
        result: merged.map((v) => Number(v.daily_rate)),
      });
    }

    return merged;
  }

  const sorted = sort([...vehicles]);

  return {
    order,
    sortKey: 'daily_rate',
    timeComplexity: 'O(n log n)',
    totalItems: vehicles.length,
    original: vehicles,
    sorted,
    steps,
  };
}

module.exports = {
  mergeSortVehiclesByPrice,
};
