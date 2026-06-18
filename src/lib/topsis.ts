import { CargoItem, TopsisWeights, TopsisResult } from "@/types";

/**
 * Phase 1: TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution)
 * Computes composite priority scores for cargo items based on three criteria.
 */
export function runTopsis(
  items: CargoItem[],
  weights: TopsisWeights
): TopsisResult[] {
  if (items.length === 0) return [];

  const n = items.length;

  // Step 1: Build decision matrix [n × 3] — columns: [urgency, worth, clientPriority]
  const matrix: number[][] = items.map((item) => [
    item.urgency,
    item.worth,
    item.clientPriority,
  ]);

  // Step 2: Vector normalization
  // r_ij = x_ij / sqrt(Σ x_ij²) for each column j
  const colSumOfSquares = [0, 1, 2].map((j) =>
    Math.sqrt(matrix.reduce((sum, row) => sum + row[j] ** 2, 0))
  );

  const normalizedMatrix: number[][] = matrix.map((row) =>
    row.map((val, j) => (colSumOfSquares[j] === 0 ? 0 : val / colSumOfSquares[j]))
  );

  // Step 3: Apply weights — v_ij = w_j × r_ij
  const w = [weights.urgency, weights.worth, weights.clientPriority];
  const weightedMatrix: number[][] = normalizedMatrix.map((row) =>
    row.map((val, j) => val * w[j])
  );

  // Step 4: Positive Ideal Solution (PIS) and Negative Ideal Solution (NIS)
  // All criteria are benefit criteria (higher = better)
  const PIS = [0, 1, 2].map((j) =>
    Math.max(...weightedMatrix.map((row) => row[j]))
  );
  const NIS = [0, 1, 2].map((j) =>
    Math.min(...weightedMatrix.map((row) => row[j]))
  );

  // Step 5: Euclidean distances from PIS and NIS
  const distancesPIS = weightedMatrix.map((row) =>
    Math.sqrt(row.reduce((sum, val, j) => sum + (val - PIS[j]) ** 2, 0))
  );
  const distancesNIS = weightedMatrix.map((row) =>
    Math.sqrt(row.reduce((sum, val, j) => sum + (val - NIS[j]) ** 2, 0))
  );

  // Step 6: Closeness Coefficient — CC_i = D⁻_i / (D⁺_i + D⁻_i)
  const closenessCoefficients = distancesPIS.map((dPlus, i) => {
    const dMinus = distancesNIS[i];
    const total = dPlus + dMinus;
    return total === 0 ? 0 : dMinus / total;
  });

  // Step 7: Rank by CC descending
  const ranked = items
    .map((item, i) => ({
      item,
      normalizedMatrix: normalizedMatrix[i],
      weightedMatrix: weightedMatrix[i],
      distancePIS: distancesPIS[i],
      distanceNIS: distancesNIS[i],
      closenessCoefficient: closenessCoefficients[i],
      rank: 0,
    }))
    .sort((a, b) => b.closenessCoefficient - a.closenessCoefficient)
    .map((r, idx) => ({ ...r, rank: idx + 1 }));

  return ranked;
}

/**
 * Reorder TOPSIS results to match original item order (for table display)
 */
export function getTopsisResultMap(results: TopsisResult[]): Map<string, TopsisResult> {
  return new Map(results.map((r) => [r.item.id, r]));
}
