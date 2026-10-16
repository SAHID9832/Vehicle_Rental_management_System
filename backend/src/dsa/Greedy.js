/**
 * Phase 4: Greedy Vehicle Recommendation
 * Optimally selects the lowest-rate available vehicle satisfying customer budget, duration, and capacity constraints.
 */

function greedyVehicleRecommendation({ vehicles, budget, days, passengers, preferredBranchId }) {
  const b = parseFloat(budget);
  const d = parseInt(days, 10);
  const p = passengers ? parseInt(passengers, 10) : 1;
  const maxDailyBudget = b / d;

  const candidateTrace = [];

  // Filter eligible vehicles
  const eligible = vehicles.filter((v) => {
    const isAvail = v.status === 'Available';
    const rateFits = Number(v.daily_rate) <= maxDailyBudget;
    const seatsFit = v.seating_capacity ? v.seating_capacity >= p : true;
    const branchFits = preferredBranchId ? String(v.branch_id) === String(preferredBranchId) : true;

    candidateTrace.push({
      vehicle_id: v.id,
      name: `${v.make || v.brand || ''} ${v.model || v.name || ''}`.trim(),
      daily_rate: Number(v.daily_rate),
      total_cost: Number(v.daily_rate) * d,
      checks: {
        is_available: isAvail,
        fits_daily_budget: rateFits,
        fits_seating: seatsFit,
        matches_branch: branchFits,
      },
      is_eligible: isAvail && rateFits && seatsFit && branchFits,
    });

    return isAvail && rateFits && seatsFit && branchFits;
  });

  // Greedy choice: sort ascending by total cost / daily rate to pick the minimum
  eligible.sort((a, b) => Number(a.daily_rate) - Number(b.daily_rate));

  const recommended = eligible.length > 0 ? eligible[0] : null;

  return {
    strategy: 'Greedy Choice Property: Minimize Daily Tariff Subject to Feasibility Constraints',
    constraints: {
      totalBudget: b,
      days: d,
      maxDailyBudget: parseFloat(maxDailyBudget.toFixed(2)),
      minPassengers: p,
      preferredBranchId: preferredBranchId || null,
    },
    totalEvaluated: vehicles.length,
    eligibleCount: eligible.length,
    candidates: candidateTrace,
    recommended: recommended
      ? {
          ...recommended,
          total_rental_cost: Number(recommended.daily_rate) * d,
          savings: parseFloat((b - Number(recommended.daily_rate) * d).toFixed(2)),
        }
      : null,
  };
}

module.exports = {
  greedyVehicleRecommendation,
};
