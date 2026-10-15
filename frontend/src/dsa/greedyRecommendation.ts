// ============================================================
// DSA Phase 4A - Greedy Vehicle Recommendation Algorithm
// Selects the cheapest eligible vehicle for a customer's criteria
// Time Complexity: O(n log n) for sort + O(n) for filter = O(n log n)
// Space Complexity: O(n)
// ============================================================

export interface Vehicle {
  id: number;
  vehicle_id: string;
  name: string;
  brand: string;
  model: string;
  category_id: number;
  category_name: string;
  branch_id: number;
  branch_name: string;
  seating_capacity: number;
  fuel_type: string;
  transmission: string;
  daily_rate: number;
  status: string;
  image_url?: string;
}

export interface GreedyInput {
  budget: number;           // Total budget in INR
  categoryId?: number;      // Preferred category (optional)
  categoryName?: string;    // Preferred category name
  minSeating: number;       // Minimum required seats
  rentalDays: number;       // Number of rental days
  branchId?: number;        // Preferred pickup branch (optional)
  fuelType?: string;        // Preferred fuel type (optional)
}

export interface GreedyStep {
  stepNumber: number;
  description: string;
  vehiclesConsidered: number;
  vehiclesRemaining: number;
  action: string;
}

export interface GreedyResult {
  recommendation: Vehicle | null;
  estimatedCost: number;
  steps: GreedyStep[];
  candidatesAfterFilter: Vehicle[];
  reason: string;
  pseudocode: string;
  explanation: string;
}

const GREEDY_PSEUDOCODE = `
GREEDY_RECOMMEND(vehicles, budget, category, minSeats, days, branch):
  // Step 1: Filter by availability
  candidates ← FILTER(vehicles, status == "Available")
  
  // Step 2: Filter by category (if specified)
  IF category IS NOT NULL:
    candidates ← FILTER(candidates, category == preferredCategory)
  
  // Step 3: Filter by seating capacity
  candidates ← FILTER(candidates, seating >= minSeats)
  
  // Step 4: Filter by branch (if specified)
  IF branch IS NOT NULL:
    candidates ← FILTER(candidates, branch == preferredBranch)
  
  // Step 5: Calculate estimated cost for each candidate
  FOR EACH vehicle IN candidates:
    vehicle.estimatedCost ← days × vehicle.dailyRate
  
  // Step 6: Filter by budget
  candidates ← FILTER(candidates, estimatedCost <= budget)
  
  // Step 7: GREEDY CHOICE — select minimum cost (cheapest eligible)
  IF candidates IS EMPTY:
    RETURN "No vehicle found within budget"
  
  SORT candidates BY estimatedCost ASC
  RETURN candidates[0]  // Greedy: pick the cheapest eligible option
`;

/**
 * Greedy Vehicle Recommendation
 * Makes locally optimal choice: cheapest vehicle that satisfies ALL constraints
 */
export function greedyRecommend(vehicles: Vehicle[], input: GreedyInput): GreedyResult {
  const steps: GreedyStep[] = [];
  let candidates = [...vehicles];

  // Step 1: Filter available vehicles
  const beforeAvail = candidates.length;
  candidates = candidates.filter(v => v.status === 'Available');
  steps.push({
    stepNumber: 1,
    description: 'Filter available vehicles only',
    vehiclesConsidered: beforeAvail,
    vehiclesRemaining: candidates.length,
    action: `Excluded ${beforeAvail - candidates.length} unavailable vehicles. ${candidates.length} available.`,
  });

  // Step 2: Filter by category
  if (input.categoryId) {
    const before = candidates.length;
    candidates = candidates.filter(v => v.category_id === input.categoryId);
    steps.push({
      stepNumber: 2,
      description: `Filter by category: ${input.categoryName || input.categoryId}`,
      vehiclesConsidered: before,
      vehiclesRemaining: candidates.length,
      action: `Excluded ${before - candidates.length} vehicles not matching category. ${candidates.length} remain.`,
    });
  } else {
    steps.push({
      stepNumber: 2,
      description: 'Category filter: skipped (no preference)',
      vehiclesConsidered: candidates.length,
      vehiclesRemaining: candidates.length,
      action: 'No category preference specified. Considering all categories.',
    });
  }

  // Step 3: Filter by seating capacity
  const beforeSeating = candidates.length;
  candidates = candidates.filter(v => v.seating_capacity >= input.minSeating);
  steps.push({
    stepNumber: 3,
    description: `Filter by seating capacity ≥ ${input.minSeating}`,
    vehiclesConsidered: beforeSeating,
    vehiclesRemaining: candidates.length,
    action: `Excluded ${beforeSeating - candidates.length} vehicles with insufficient seats. ${candidates.length} remain.`,
  });

  // Step 4: Filter by branch
  if (input.branchId) {
    const before = candidates.length;
    candidates = candidates.filter(v => v.branch_id === input.branchId);
    steps.push({
      stepNumber: 4,
      description: `Filter by pickup branch ID: ${input.branchId}`,
      vehiclesConsidered: before,
      vehiclesRemaining: candidates.length,
      action: `Excluded ${before - candidates.length} vehicles at other branches. ${candidates.length} remain.`,
    });
  } else {
    steps.push({
      stepNumber: 4,
      description: 'Branch filter: skipped (any branch)',
      vehiclesConsidered: candidates.length,
      vehiclesRemaining: candidates.length,
      action: 'No branch preference. Considering all branches.',
    });
  }

  // Step 5: Calculate estimated cost
  const withCost = candidates.map(v => ({
    ...v,
    estimatedCost: input.rentalDays * v.daily_rate,
  }));

  steps.push({
    stepNumber: 5,
    description: `Calculate estimated cost for ${input.rentalDays} rental day(s)`,
    vehiclesConsidered: candidates.length,
    vehiclesRemaining: candidates.length,
    action: `Computed: estimatedCost = ${input.rentalDays} × daily_rate for each vehicle.`,
  });

  // Step 6: Filter by budget
  const beforeBudget = withCost.length;
  const withinBudget = withCost.filter(v => v.estimatedCost <= input.budget);
  steps.push({
    stepNumber: 6,
    description: `Filter by budget ≤ ₹${input.budget.toLocaleString('en-IN')}`,
    vehiclesConsidered: beforeBudget,
    vehiclesRemaining: withinBudget.length,
    action: `Excluded ${beforeBudget - withinBudget.length} vehicles exceeding budget. ${withinBudget.length} within budget.`,
  });

  if (withinBudget.length === 0) {
    return {
      recommendation: null,
      estimatedCost: 0,
      steps,
      candidatesAfterFilter: [],
      reason: `No vehicle found within ₹${input.budget.toLocaleString('en-IN')} for ${input.rentalDays} day(s) with the given criteria.`,
      pseudocode: GREEDY_PSEUDOCODE,
      explanation: 'The greedy algorithm exhausted all filter stages and found no eligible vehicle within budget.',
    };
  }

  // Step 7: GREEDY CHOICE — sort by estimated cost, pick cheapest
  withinBudget.sort((a, b) => a.estimatedCost - b.estimatedCost);
  const best = withinBudget[0];

  steps.push({
    stepNumber: 7,
    description: 'Greedy Choice: Select the cheapest eligible vehicle',
    vehiclesConsidered: withinBudget.length,
    vehiclesRemaining: 1,
    action: `SELECTED: "${best.name}" at ₹${best.daily_rate.toLocaleString('en-IN')}/day → Total: ₹${best.estimatedCost.toLocaleString('en-IN')} for ${input.rentalDays} days.`,
  });

  return {
    recommendation: best,
    estimatedCost: best.estimatedCost,
    steps,
    candidatesAfterFilter: withinBudget.map(v => v as unknown as Vehicle),
    reason: `Best match: ${best.name} at ₹${best.daily_rate.toLocaleString('en-IN')}/day. Total for ${input.rentalDays} days: ₹${best.estimatedCost.toLocaleString('en-IN')}.`,
    pseudocode: GREEDY_PSEUDOCODE,
    explanation: `The Greedy algorithm makes a locally optimal choice at each step: 
    (1) Filter constraints, (2) compute costs, (3) select the minimum-cost option. 
    This gives the cheapest vehicle satisfying all constraints, but is not globally optimal 
    for multi-objective problems (e.g., minimizing total trips across a fleet).`,
  };
}
