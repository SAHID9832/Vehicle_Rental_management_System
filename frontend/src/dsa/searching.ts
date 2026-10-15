// ============================================================
// DSA Phase 3A/B - Linear Search & Binary Search
// Used for searching vehicles by ID or name
// ============================================================

export interface SearchResult<T> {
  found: boolean;
  index: number;
  item: T | null;
  comparisons: number;
  steps: Array<{
    index: number;
    item: T;
    compared: string;
    action: string;
    match: boolean;
  }>;
  algorithm: 'linear' | 'binary';
  timeComplexity: string;
}

/**
 * Linear Search — O(n)
 * Checks each element one by one
 */
export function linearSearch<T extends Record<string, unknown>>(
  arr: T[],
  target: string,
  key: keyof T
): SearchResult<T> {
  const steps: SearchResult<T>['steps'] = [];
  let comparisons = 0;

  for (let i = 0; i < arr.length; i++) {
    comparisons++;
    const value = String(arr[i][key]).toLowerCase();
    const match = value === target.toLowerCase() || value.includes(target.toLowerCase());

    steps.push({
      index: i,
      item: arr[i],
      compared: String(arr[i][key]),
      action: match
        ? `✓ Match found at index ${i}: "${arr[i][key]}"`
        : `✗ No match at index ${i}: "${arr[i][key]}" ≠ "${target}"`,
      match,
    });

    if (match) {
      return {
        found: true,
        index: i,
        item: arr[i],
        comparisons,
        steps,
        algorithm: 'linear',
        timeComplexity: 'O(n) — checks each element until match found',
      };
    }
  }

  return {
    found: false,
    index: -1,
    item: null,
    comparisons,
    steps,
    algorithm: 'linear',
    timeComplexity: 'O(n) — checked all elements, not found',
  };
}

/**
 * Binary Search — O(log n)
 * Array MUST be sorted by the given key before calling this.
 * Uses exact match on numeric or string keys.
 */
export function binarySearch<T extends Record<string, unknown>>(
  sortedArr: T[],
  target: string | number,
  key: keyof T
): SearchResult<T> {
  const steps: SearchResult<T>['steps'] = [];
  let low = 0;
  let high = sortedArr.length - 1;
  let comparisons = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    comparisons++;
    const value = sortedArr[mid][key];
    const numericTarget = typeof target === 'number' ? target : Number(target);
    const numericValue = Number(value);

    const action = `low=${low}, high=${high}, mid=${mid} → Compare "${value}" with "${target}"`;

    if (numericValue === numericTarget || String(value).toLowerCase() === String(target).toLowerCase()) {
      steps.push({
        index: mid,
        item: sortedArr[mid],
        compared: String(value),
        action: `✓ ${action} — MATCH at index ${mid}`,
        match: true,
      });
      return {
        found: true,
        index: mid,
        item: sortedArr[mid],
        comparisons,
        steps,
        algorithm: 'binary',
        timeComplexity: 'O(log n) — search space halved each step',
      };
    } else if (numericValue < numericTarget) {
      steps.push({
        index: mid,
        item: sortedArr[mid],
        compared: String(value),
        action: `${action} — value < target, search RIGHT half (low = ${mid + 1})`,
        match: false,
      });
      low = mid + 1;
    } else {
      steps.push({
        index: mid,
        item: sortedArr[mid],
        compared: String(value),
        action: `${action} — value > target, search LEFT half (high = ${mid - 1})`,
        match: false,
      });
      high = mid - 1;
    }
  }

  return {
    found: false,
    index: -1,
    item: null,
    comparisons,
    steps,
    algorithm: 'binary',
    timeComplexity: 'O(log n) — all halves exhausted, not found',
  };
}
