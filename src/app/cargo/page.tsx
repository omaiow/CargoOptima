"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";
import { CardSpotlight } from "@/components/aceternity/CardSpotlight";

import { useAppStore } from "@/lib/store";
import { CargoItem, TopsisWeights, VehicleConfig } from "@/types";
import { PHILIPPINE_ROUTES, SAMPLE_CARGO } from "@/lib/routes";
import { formatPHP } from "@/lib/utils";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const InteractiveRouteMap = dynamic(() => import("@/components/InteractiveRouteMap").then(mod => mod.InteractiveRouteMap), { ssr: false });

const DEFAULT_ITEM: Omit<CargoItem, "id"> = {
  name: "", weight: 0, urgency: 5, worth: 0, clientPriority: 5,
};

export default function CargoPage() {
  const router = useRouter();
  const { cargoItems, addItem, removeItem, topsisWeights, setWeights, vehicleConfig, setVehicleConfig, runOptimization, loadSampleData, clearItems, isRunning } = useAppStore();

  const [form, setForm] = useState({ ...DEFAULT_ITEM });
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchLivePrice() {
      try {
        const res = await fetch('/api/fuel');
        if (res.ok) {
          const data = await res.json();
          if (data.price && typeof data.price === 'number') {
            setVehicleConfig({ dieselPrice: data.price });
          }
        }
      } catch (e) {
        console.error("Failed to fetch live diesel price:", e);
      }
    }
    // Only fetch if it's the default value to avoid overwriting user input during navigation
    if (vehicleConfig.dieselPrice === 81.25) {
      fetchLivePrice();
    }
  }, [setVehicleConfig, vehicleConfig.dieselPrice]);

  const handleAdd = () => {
    if (!form.name.trim()) { setError("Item name is required."); return; }
    if (form.weight <= 0) { setError("Weight must be greater than 0."); return; }
    if (form.worth <= 0) { setError("Monetary worth must be greater than 0."); return; }
    setError("");
    addItem({ ...form, id: crypto.randomUUID() });
    setForm({ ...DEFAULT_ITEM });
  };

  const handleWeightChange = (key: keyof TopsisWeights, val: number) => {
    const other = Object.keys(topsisWeights).filter(k => k !== key) as (keyof TopsisWeights)[];
    const remaining = 1 - val;
    const total = other.reduce((s, k) => s + topsisWeights[k], 0);
    const newWeights = { ...topsisWeights, [key]: val };
    if (total > 0) {
      other.forEach(k => { newWeights[k] = parseFloat(((topsisWeights[k] / total) * remaining).toFixed(2)); });
    } else {
      other.forEach(k => { newWeights[k] = parseFloat((remaining / other.length).toFixed(2)); });
    }
    // Normalize to sum exactly 1
    const sum = Object.values(newWeights).reduce((s, v) => s + v, 0);
    if (Math.abs(sum - 1) > 0.01) {
      const diff = 1 - sum;
      newWeights[other[0]] = parseFloat((newWeights[other[0]] + diff).toFixed(2));
    }
    setWeights(newWeights);
  };

  const handleRunClick = () => {
    if (cargoItems.length === 0) { setError("Add at least one cargo item before running."); return; }
    runOptimization();
    setTimeout(() => router.push("/results"), 900);
  };

  const selectedRoute = PHILIPPINE_ROUTES.find(r => r.id === vehicleConfig.selectedRoute);

  return (
    <PageLayout title="Cargo Input" subtitle="Define shipment items and configure vehicle parameters" badge="Phase 0 · Data Entry">
      <div className="grid lg:grid-cols-3 gap-6 max-w-7xl">

        {/* ── Left: Item table ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Add item form */}
          <CardSpotlight className="p3r-card p-6">
            <h2 className="font-heading font-bold text-lg text-p3r-cyan mb-5 flex items-center gap-2">
              ADD CARGO ITEM
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="p3r-label">Item Name / Description</label>
                <input id="input-item-name" className="p3r-input w-full" placeholder="e.g. Electronic Components" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="p3r-label">Weight (kg)</label>
                <input id="input-weight" type="number" min="0" className="p3r-input w-full" placeholder="0" value={form.weight || ""}
                  onChange={e => setForm(f => ({ ...f, weight: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="p3r-label">Monetary Worth (₱)</label>
                <input id="input-worth" type="number" min="0" className="p3r-input w-full" placeholder="0" value={form.worth || ""}
                  onChange={e => setForm(f => ({ ...f, worth: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="p3r-label">Delivery Urgency (1-10)</label>
                <div className="flex items-center gap-3">
                  <input type="range" min="1" max="10" step="1" className="flex-1 accent-[#00d4ff]" value={form.urgency}
                    onChange={e => setForm(f => ({ ...f, urgency: parseInt(e.target.value) }))} />
                  <span className="font-mono text-p3r-cyan w-6 text-center font-bold">{form.urgency}</span>
                </div>
              </div>
              <div>
                <label className="p3r-label">Client Priority (1-10)</label>
                <div className="flex items-center gap-3">
                  <input type="range" min="1" max="10" step="1" className="flex-1 accent-[#4a9eff]" value={form.clientPriority}
                    onChange={e => setForm(f => ({ ...f, clientPriority: parseInt(e.target.value) }))} />
                  <span className="font-mono text-p3r-cyan w-6 text-center font-bold">{form.clientPriority}</span>
                </div>
              </div>
            </div>
            {error && <p className="font-mono text-xs text-red-400 mt-3">{error}</p>}
            <div className="flex gap-3 mt-5">
              <button id="btn-add-item" onClick={handleAdd} className="p3r-btn-primary text-sm px-5 py-2.5">+ Add Item</button>
              <button id="btn-load-sample" onClick={() => { loadSampleData(); setError(""); }} className="p3r-btn-blue text-sm px-5 py-2.5">↺ Load Sample Data</button>
              <button id="btn-clear-items" onClick={clearItems} className="p3r-btn-primary text-sm px-5 py-2.5">✕ Clear All</button>
            </div>
          </CardSpotlight>

          {/* Cargo table */}
          <CardSpotlight className="p3r-card overflow-hidden">
            <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-[#0044CC]/30/30">
              <h2 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                CARGO MANIFEST
                <span className="p3r-badge ml-2">{cargoItems.length} items</span>
              </h2>
              <div className="font-mono text-xs text-[#4488DD]">
                Total: {cargoItems.reduce((s, i) => s + i.weight, 0).toFixed(0)} kg / {vehicleConfig.maxCapacity} kg
              </div>
            </div>
            <div className="overflow-x-auto">
              {cargoItems.length === 0 ? (
                <div className="py-12 text-center font-mono text-[#4488DD] text-sm">
                  No cargo items yet. Add items above or load sample data.
                </div>
              ) : (
                <table className="p3r-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Weight (kg)</th>
                      <th>Urgency</th>
                      <th>Worth (₱)</th>
                      <th>Client Prio.</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {cargoItems.map((item, idx) => (
                        <motion.tr key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                          <td className="text-[#4488DD]">{idx + 1}</td>
                          <td className="font-medium text-white">{item.name}</td>
                          <td className="text-p3r-cyan">{item.weight}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-[#001166] rounded-full overflow-hidden">
                                <div className="h-full bg-p3-cyan rounded-full" style={{ width: `${item.urgency * 10}%` }} />
                              </div>
                              <span className="text-p3r-cyan">{item.urgency}</span>
                            </div>
                          </td>
                          <td className="text-[#ffd700]">{formatPHP(item.worth)}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-[#001166] rounded-full overflow-hidden">
                                <div className="h-full bg-p3-blue rounded-full" style={{ width: `${item.clientPriority * 10}%` }} />
                              </div>
                              <span className="text-p3r-cyan">{item.clientPriority}</span>
                            </div>
                          </td>
                          <td>
                            <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300 font-mono text-xs px-2 py-1 hover:bg-red-900/20 rounded transition-colors">
                              ✕
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}
            </div>
          </CardSpotlight>
        </div>

        {/* ── Right: Config panel ── */}
        <div className="space-y-5">
          {/* TOPSIS Weights */}
          <CardSpotlight className="p3r-card p-6">
            <h2 className="font-heading font-bold text-base text-p3r-cyan mb-4 flex items-center gap-2">
              TOPSIS WEIGHTS
            </h2>
            <p className="font-mono text-[10px] text-[#4488DD] mb-4">Adjusting one weight auto-redistributes the others to sum to 100%.</p>
            {(["urgency", "worth", "clientPriority"] as (keyof TopsisWeights)[]).map((key) => {
              const labels: Record<string, string> = { urgency: "Delivery Urgency", worth: "Monetary Worth", clientPriority: "Client Priority" };
              const pct = Math.round(topsisWeights[key] * 100);
              return (
                <div key={key} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <label className="p3r-label">{labels[key]}</label>
                    <span className="font-mono text-xs text-p3r-cyan font-bold">{pct}%</span>
                  </div>
                  <input type="range" min="0" max="100" step="5" className="w-full accent-[#00d4ff]"
                    value={pct}
                    onChange={e => handleWeightChange(key, parseInt(e.target.value) / 100)} />
                </div>
              );
            })}
            <div className="flex gap-1 mt-2">
              {(Object.entries(topsisWeights) as [keyof TopsisWeights, number][]).map(([k, v]) => (
                <div key={k} className="h-2 rounded-full bg-p3-cyan opacity-80 transition-all" style={{ flex: v }} />
              ))}
            </div>
          </CardSpotlight>

          {/* Vehicle Config */}
          <CardSpotlight className="p3r-card p-6">
            <h2 className="font-heading font-bold text-base text-p3r-cyan mb-4 flex items-center gap-2">
              VEHICLE CONFIG
            </h2>
            <div className="space-y-3">
              <div>
                <label className="p3r-label">Route</label>
                <select id="select-route" className="p3r-input w-full"
                  value={vehicleConfig.selectedRoute}
                  onChange={e => {
                    const route = PHILIPPINE_ROUTES.find(r => r.id === e.target.value);
                    setVehicleConfig({ selectedRoute: e.target.value, routeDistance: route?.distance ?? vehicleConfig.routeDistance });
                  }}>
                  {PHILIPPINE_ROUTES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              {vehicleConfig.selectedRoute === "custom" && <InteractiveRouteMap />}
              <div>
                <label className="p3r-label">Distance (km)</label>
                <input id="input-distance" type="number" min="1" className="p3r-input w-full" value={vehicleConfig.routeDistance}
                  onChange={e => setVehicleConfig({ routeDistance: parseFloat(e.target.value) || 1 })} />
              </div>
              <div>
                <label className="p3r-label">Max Capacity (kg)</label>
                <input id="input-capacity" type="number" min="100" className="p3r-input w-full" value={vehicleConfig.maxCapacity}
                  onChange={e => setVehicleConfig({ maxCapacity: parseFloat(e.target.value) || 4000 })} />
              </div>
              <div>
                <label className="p3r-label">Base FCR (L/km)</label>
                <input id="input-fcr" type="number" min="0.01" step="0.01" className="p3r-input w-full" value={vehicleConfig.baseFCR}
                  onChange={e => setVehicleConfig({ baseFCR: parseFloat(e.target.value) || 0.22 })} />
              </div>
              <div>
                <label className="p3r-label">Weight Penalty η</label>
                <input id="input-eta" type="number" min="0" max="1" step="0.01" className="p3r-input w-full" value={vehicleConfig.weightPenalty}
                  onChange={e => setVehicleConfig({ weightPenalty: parseFloat(e.target.value) || 0.2 })} />
              </div>
              <div>
                <label className="p3r-label">Diesel Price (₱/L)</label>
                <input id="input-diesel" type="number" min="1" step="0.25" className="p3r-input w-full" value={vehicleConfig.dieselPrice}
                  onChange={e => setVehicleConfig({ dieselPrice: parseFloat(e.target.value) || 81.25 })} />
              </div>
            </div>
          </CardSpotlight>

          {/* Run button */}
          <button
            id="btn-run-optimization"
            onClick={handleRunClick}
            disabled={isRunning || cargoItems.length === 0}
            className={`w-full py-5 text-center font-heading font-bold text-lg tracking-widest cursor-pointer transition-all ${isRunning || cargoItems.length === 0 ? "opacity-50 cursor-not-allowed text-[#0044CC] bg-[#07070F]" : "text-p3r-cyan bg-[#07070F] hover:bg-p3r-cyan hover:text-[#07070F] shadow-[0_0_15px_rgba(0,221,255,0.15)] hover:shadow-[0_0_25px_rgba(0,221,255,0.4)]"}`}
          >
            {isRunning ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                OPTIMIZING...
              </span>
            ) : (
              "RUN OPTIMIZATION"
            )}
          </button>

          {cargoItems.length > 0 && (
            <div className="p3r-card p-4 space-y-2">
              <div className="font-mono text-[10px] text-[#4488DD] uppercase tracking-wider mb-2">Quick Summary</div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-[#4488DD]">Items:</span>
                <span className="text-white">{cargoItems.length}</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-[#4488DD]">Total Weight:</span>
                <span className={cargoItems.reduce((s,i)=>s+i.weight,0) > vehicleConfig.maxCapacity ? "text-red-400" : "text-p3r-cyan"}>
                  {cargoItems.reduce((s,i)=>s+i.weight,0).toFixed(0)} kg
                </span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-[#4488DD]">Capacity:</span>
                <span className="text-white">{vehicleConfig.maxCapacity} kg</span>
              </div>
              {cargoItems.reduce((s,i)=>s+i.weight,0) > vehicleConfig.maxCapacity && (
                <p className="font-mono text-[10px] text-red-400">⚠ Total weight exceeds capacity — knapsack will select optimal subset.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
