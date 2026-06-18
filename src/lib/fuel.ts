import { VehicleConfig, FuelResult } from "@/types";

/**
 * Phase 3: Fuel Calculation and Efficiency Proof
 * Models fuel consumption based on cargo weight and travel distance.
 */

/**
 * Adjusted Fuel Consumption Rate
 * FCR(y) = FCR0 × (1 + η × y/Q)
 */
export function calculateAdjustedFCR(
  cargoWeight: number,      // y — current cargo kg
  config: VehicleConfig
): number {
  return config.baseFCR * (1 + config.weightPenalty * (cargoWeight / config.maxCapacity));
}

/**
 * Total fuel consumed for a trip
 * Fuel(L) = FCR(y) × d
 */
export function calculateFuel(adjustedFCR: number, distance: number): number {
  return adjustedFCR * distance;
}

/**
 * Total fuel cost
 * Cost = Fuel(L) × P
 */
export function calculateCost(fuel: number, dieselPrice: number): number {
  return fuel * dieselPrice;
}

/**
 * Efficiency score
 * E = V / Fuel(L)
 * Higher = more priority value delivered per liter
 */
export function calculateEfficiency(priorityScore: number, fuel: number): number {
  return fuel === 0 ? 0 : priorityScore / fuel;
}

/**
 * Full fuel analysis — optimized vs naive comparison
 */
export function runFuelAnalysis(
  optimizedWeight: number,
  optimizedPriority: number,
  naiveWeight: number,
  naivePriority: number,
  config: VehicleConfig
): FuelResult {
  // Optimized
  const optimizedFCR = calculateAdjustedFCR(optimizedWeight, config);
  const optimizedFuel = calculateFuel(optimizedFCR, config.routeDistance);
  const optimizedCost = calculateCost(optimizedFuel, config.dieselPrice);
  const optimizedEfficiency = calculateEfficiency(optimizedPriority, optimizedFuel);

  // Naive (same distance, same truck — only weight differs slightly)
  const naiveFCR = calculateAdjustedFCR(naiveWeight, config);
  const naiveFuel = calculateFuel(naiveFCR, config.routeDistance);
  const naiveCost = calculateCost(naiveFuel, config.dieselPrice);
  const naiveEfficiency = calculateEfficiency(naivePriority, naiveFuel);

  // Efficiency gain %
  const efficiencyGainPercent =
    naiveEfficiency === 0
      ? 0
      : ((optimizedEfficiency - naiveEfficiency) / naiveEfficiency) * 100;

  return {
    cargoWeight: optimizedWeight,
    adjustedFCR: optimizedFCR,
    totalFuel: optimizedFuel,
    totalCost: optimizedCost,
    efficiency: optimizedEfficiency,
    naiveWeight,
    naivePriorityScore: naivePriority,
    naiveFuel,
    naiveCost,
    naiveEfficiency,
    efficiencyGainPercent,
  };
}
