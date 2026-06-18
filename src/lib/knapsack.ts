import { CargoItem, TopsisResult, KnapsackResult } from "@/types";

const PRECISION = 10; // Scale factor: weight × PRECISION = integer DP index

/**
 * Phase 2: 0/1 Knapsack with Dynamic Programming
 * Selects optimal cargo subset maximizing total TOPSIS score within weight capacity.
 */
export function runKnapsack(
  items: CargoItem[],
  topsisResults: TopsisResult[],
  maxCapacity: number,
  includeTable = false
): KnapsackResult {
  if (items.length === 0) {
    return {
      selectedItems: [],
      excludedItems: [],
      totalWeight: 0,
      totalPriorityScore: 0,
      remainingCapacity: maxCapacity,
      utilizationPercent: 0,
    };
  }

  // Map TOPSIS CC scores back to items (keyed by item id)
  const ccMap = new Map<string, number>(
    topsisResults.map((r) => [r.item.id, r.closenessCoefficient])
  );

  const n = items.length;
  const W = Math.round(maxCapacity * PRECISION); // scaled capacity

  // Build DP table: dp[i][w] = max CC score using first i items, capacity w
  // Use scaled integer weights
  const scaledWeights = items.map((item) => Math.round(item.weight * PRECISION));
  // CC values scaled to integers × 1e6 for precision
  const CC_SCALE = 1e6;
  const ccValues = items.map((item) => Math.round((ccMap.get(item.id) ?? 0) * CC_SCALE));

  // Allocate DP table (1D rolling for memory, but keep 2D for traceback)
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const wi = scaledWeights[i - 1];
    const vi = ccValues[i - 1];
    for (let w = 0; w <= W; w++) {
      if (wi > w) {
        dp[i][w] = dp[i - 1][w]; // can't include item i
      } else {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - wi] + vi);
      }
    }
  }

  // Traceback to find selected items
  const selected: boolean[] = new Array(n).fill(false);
  let w = W;
  for (let i = n; i >= 1; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected[i - 1] = true;
      w -= scaledWeights[i - 1];
    }
  }

  const selectedItems = items.filter((_, i) => selected[i]);
  const excludedItems = items.filter((_, i) => !selected[i]);
  const totalWeight = selectedItems.reduce((sum, item) => sum + item.weight, 0);
  const totalPriorityScore = selectedItems.reduce(
    (sum, item) => sum + (ccMap.get(item.id) ?? 0),
    0
  );
  const remainingCapacity = maxCapacity - totalWeight;
  const utilizationPercent = (totalWeight / maxCapacity) * 100;

  return {
    selectedItems,
    excludedItems,
    totalWeight,
    totalPriorityScore,
    remainingCapacity,
    utilizationPercent,
    dpTable: includeTable ? dp : undefined,
  };
}

/**
 * Naive (heaviest-first greedy) strategy for control test comparison.
 * Selects heaviest items that fit — no priority optimization.
 */
export function runNaiveLoading(
  items: CargoItem[],
  topsisResults: TopsisResult[],
  maxCapacity: number
): { selectedItems: CargoItem[]; totalPriorityScore: number; totalWeight: number } {
  const ccMap = new Map<string, number>(
    topsisResults.map((r) => [r.item.id, r.closenessCoefficient])
  );

  // Sort by weight descending (heaviest first — naive greedy)
  const sorted = [...items].sort((a, b) => b.weight - a.weight);

  const selected: CargoItem[] = [];
  let remaining = maxCapacity;

  for (const item of sorted) {
    if (item.weight <= remaining) {
      selected.push(item);
      remaining -= item.weight;
    }
  }

  return {
    selectedItems: selected,
    totalPriorityScore: selected.reduce((sum, item) => sum + (ccMap.get(item.id) ?? 0), 0),
    totalWeight: selected.reduce((sum, item) => sum + item.weight, 0),
  };
}
