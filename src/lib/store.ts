import { create } from "zustand";
import { AppState, CargoItem, TopsisWeights, VehicleConfig, OptimizationRun } from "@/types";
import { runTopsis } from "@/lib/topsis";
import { runKnapsack, runNaiveLoading } from "@/lib/knapsack";
import { runFuelAnalysis } from "@/lib/fuel";
import { SAMPLE_CARGO } from "@/lib/routes";

const DEFAULT_WEIGHTS: TopsisWeights = { urgency: 0.5, worth: 0.3, clientPriority: 0.2 };
const DEFAULT_VEHICLE: VehicleConfig = {
  maxCapacity: 4000,
  baseFCR: 0.22,
  weightPenalty: 0.20,
  dieselPrice: 81.25,
  routeDistance: 25,
  selectedRoute: "custom",
};

export const useAppStore = create<AppState>((set, get) => ({
  cargoItems: [],
  topsisWeights: DEFAULT_WEIGHTS,
  vehicleConfig: DEFAULT_VEHICLE,
  currentRun: null,
  isRunning: false,

  addItem: (item: CargoItem) =>
    set((state) => ({ cargoItems: [...state.cargoItems, item] })),

  removeItem: (id: string) =>
    set((state) => ({ cargoItems: state.cargoItems.filter((i) => i.id !== id) })),

  updateItem: (id: string, updates: Partial<CargoItem>) =>
    set((state) => ({
      cargoItems: state.cargoItems.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    })),

  setWeights: (weights: TopsisWeights) => set({ topsisWeights: weights }),

  setVehicleConfig: (config: Partial<VehicleConfig>) =>
    set((state) => ({ vehicleConfig: { ...state.vehicleConfig, ...config } })),

  clearItems: () => set({ cargoItems: [], currentRun: null }),

  loadSampleData: () =>
    set({
      cargoItems: SAMPLE_CARGO.map((item) => ({ ...item })),
      currentRun: null,
    }),

  runOptimization: () => {
    const { cargoItems, topsisWeights, vehicleConfig } = get();
    if (cargoItems.length === 0) return;

    set({ isRunning: true });

    // Small delay for animation effect
    setTimeout(() => {
      try {
        // Phase 1: TOPSIS
        const topsisResults = runTopsis(cargoItems, topsisWeights);

        // Phase 2: Knapsack
        const knapsackResult = runKnapsack(
          cargoItems,
          topsisResults,
          vehicleConfig.maxCapacity,
          true // include DP table for visualization
        );

        // Naive comparison
        const naive = runNaiveLoading(cargoItems, topsisResults, vehicleConfig.maxCapacity);

        // Phase 3: Fuel analysis
        const fuelResult = runFuelAnalysis(
          knapsackResult.totalWeight,
          knapsackResult.totalPriorityScore,
          naive.totalWeight,
          naive.totalPriorityScore,
          vehicleConfig
        );

        const run: OptimizationRun = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          items: cargoItems,
          weights: topsisWeights,
          vehicleConfig,
          topsisResults,
          knapsackResult,
          fuelResult,
        };

        set({ currentRun: run, isRunning: false });
      } catch (err) {
        console.error("Optimization error:", err);
        set({ isRunning: false });
      }
    }, 800);
  },
}));
