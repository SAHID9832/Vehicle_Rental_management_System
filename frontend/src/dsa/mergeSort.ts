// ============================================================
// DSA Phase 3C - Merge Sort (from scratch)
// Used for sorting vehicles by daily rental price
// Time Complexity: O(n log n) — all cases
// Space Complexity: O(n)
// ============================================================

export interface MergeSortStep<T> {
  stage: 'divide' | 'merge';
  description: string;
  leftPart?: T[];
  rightPart?: T[];
  mergedPart?: T[];
  depth: number;
}

export interface MergeSortResult<T> {
  sorted: T[];
  steps: MergeSortStep<T>[];
  originalOrder: T[];
  comparisons: number;
  passes: number;
}

let globalComparisons = 0;
let globalPasses = 0;
const globalSteps: MergeSortStep<unknown>[] = [];

function merge<T>(
  left: T[],
  right: T[],
  comparator: (a: T, b: T) => number,
  depth: number
): T[] {
  const result: T[] = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    globalComparisons++;
    if (comparator(left[i], right[j]) <= 0) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }

  while (i < left.length) result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);

  (globalSteps as MergeSortStep<T>[]).push({
    stage: 'merge',
    description: `Merge [${left.map(x => getKey(x)).join(', ')}] + [${right.map(x => getKey(x)).join(', ')}] → [${result.map(x => getKey(x)).join(', ')}]`,
    leftPart: left,
    rightPart: right,
    mergedPart: result,
    depth,
  });

  globalPasses++;
  return result;
}

function getKey<T>(item: T): string {
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>;
    return String(obj.daily_rate ?? obj.name ?? obj.id ?? item);
  }
  return String(item);
}

function mergeSortRecursive<T>(
  arr: T[],
  comparator: (a: T, b: T) => number,
  depth: number
): T[] {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);

  (globalSteps as MergeSortStep<T>[]).push({
    stage: 'divide',
    description: `Divide [${arr.map(x => getKey(x)).join(', ')}] → Left:[${left.map(x => getKey(x)).join(', ')}] | Right:[${right.map(x => getKey(x)).join(', ')}]`,
    leftPart: left,
    rightPart: right,
    depth,
  });

  const sortedLeft = mergeSortRecursive(left, comparator, depth + 1);
  const sortedRight = mergeSortRecursive(right, comparator, depth + 1);
  return merge(sortedLeft, sortedRight, comparator, depth);
}

/**
 * Custom Merge Sort — DO NOT use Array.prototype.sort as substitute
 * @param arr - Array to sort
 * @param comparator - comparison function (a, b) => number
 * @param order - 'asc' or 'desc'
 */
export function mergeSort<T>(
  arr: T[],
  comparator: (a: T, b: T) => number,
  order: 'asc' | 'desc' = 'asc'
): MergeSortResult<T> {
  globalComparisons = 0;
  globalPasses = 0;
  (globalSteps as MergeSortStep<T>[]).length = 0;

  const originalOrder = [...arr];

  const effectiveComparator = order === 'desc'
    ? (a: T, b: T) => -comparator(a, b)
    : comparator;

  const sorted = mergeSortRecursive([...arr], effectiveComparator, 0);

  return {
    sorted,
    steps: [...(globalSteps as MergeSortStep<T>[])],
    originalOrder,
    comparisons: globalComparisons,
    passes: globalPasses,
  };
}

/** Comparator for vehicles by daily_rate */
export function byDailyRate(
  a: { daily_rate: number },
  b: { daily_rate: number }
): number {
  return a.daily_rate - b.daily_rate;
}

/** Sort vehicles by price using Merge Sort */
export function sortVehiclesByPrice<T extends { daily_rate: number }>(
  vehicles: T[],
  order: 'asc' | 'desc' = 'asc'
): MergeSortResult<T> {
  return mergeSort(vehicles, byDailyRate, order);
}
