// ─── Core Types ──────────────────────────────────────────────────────────────

export interface CargoItem {
  id: string;
  name: string;
  weight: number;       // kg
  urgency: number;      // 1–10
  worth: number;        // PHP monetary value
  clientPriority: number; // 1–10
}

export interface TopsisWeights {
  urgency: number;      // 0–1 (default 0.5)
  worth: number;        // 0–1 (default 0.3)
  clientPriority: number; // 0–1 (default 0.2)
}

export interface TopsisResult {
  item: CargoItem;
  normalizedMatrix: number[];   // [urgency, worth, clientPriority]
  weightedMatrix: number[];
  distancePIS: number;          // D+
  distanceNIS: number;          // D-
  closenessCoefficient: number; // CC (0–1)
  rank: number;
}

export interface KnapsackResult {
  selectedItems: CargoItem[];
  excludedItems: CargoItem[];
  totalWeight: number;
  totalPriorityScore: number;  // sum of CC values
  remainingCapacity: number;
  utilizationPercent: number;
  dpTable?: number[][];        // optional for visualization
}

export interface FuelResult {
  cargoWeight: number;          // y kg
  adjustedFCR: number;          // FCR(y) L/km
  totalFuel: number;            // L
  totalCost: number;            // PHP
  efficiency: number;           // E = V / Fuel
  // Naive comparison
  naiveWeight: number;
  naivePriorityScore: number;
  naiveFuel: number;
  naiveCost: number;
  naiveEfficiency: number;
  efficiencyGainPercent: number;
}

export interface VehicleConfig {
  maxCapacity: number;          // kg (default 4000)
  baseFCR: number;              // L/km (default 0.22)
  weightPenalty: number;        // η (default 0.20)
  dieselPrice: number;          // PHP/L (default 81.25)
  routeDistance: number;        // km
  selectedRoute?: string;
  customFromCoords?: [number, number]; // [lat, lng]
  customToCoords?: [number, number];   // [lat, lng]
}

export interface PhilippineRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  distance: number;             // km
  fromCoords: [number, number]; // [lat, lng]
  toCoords: [number, number];
}

export interface OptimizationRun {
  id: string;
  timestamp: number;
  items: CargoItem[];
  weights: TopsisWeights;
  vehicleConfig: VehicleConfig;
  topsisResults: TopsisResult[];
  knapsackResult: KnapsackResult;
  fuelResult: FuelResult;
}

export interface AppState {
  cargoItems: CargoItem[];
  topsisWeights: TopsisWeights;
  vehicleConfig: VehicleConfig;
  currentRun: OptimizationRun | null;
  isRunning: boolean;
  addItem: (item: CargoItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, item: Partial<CargoItem>) => void;
  setWeights: (weights: TopsisWeights) => void;
  setVehicleConfig: (config: Partial<VehicleConfig>) => void;
  runOptimization: () => void;
  clearItems: () => void;
  loadSampleData: () => void;
}
