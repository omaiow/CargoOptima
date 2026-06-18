"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { PageLayout } from "@/components/layout/PageLayout";
import { AnimatedTabs } from "@/components/aceternity/Tabs";
import { CardSpotlight } from "@/components/aceternity/CardSpotlight";
import { useAppStore } from "@/lib/store";
import { formatNumber, formatPHP, formatPercent } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, Cell
} from "recharts";

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="p3r-card p-3 text-xs font-mono">
        <p className="text-p3r-cyan mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.name === "Optimized" ? "#00d4ff" : "#8ab4cc" }}>
            {p.name}: {typeof p.value === "number" ? p.value.toFixed(4) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ResultsPage() {
  const { currentRun } = useAppStore();

  if (!currentRun) {
    return (
      <PageLayout title="Results" subtitle="Run optimization to see results" badge="Analysis" decoWord="DATA">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="font-mono text-p3r-cyan text-sm">No optimization results found.</div>
          <p className="font-mono text-sm text-[#4488DD] mb-6">Run the optimization engine from the Cargo Input page.</p>
          <Link href="/cargo"><button className="p3-btn-primary px-6 py-3">Go to Cargo Input →</button></Link>
        </div>
      </PageLayout>
    );
  }

  const { topsisResults, knapsackResult, fuelResult, vehicleConfig, items } = currentRun;

  // â”€â”€ Tab 1: TOPSIS â”€â”€
  const topsisTab = (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <CardSpotlight className="p3r-card p-4 text-center">
          <div className="font-mono text-xs text-[#4488DD] mb-1">CRITERIA</div>
          <div className="font-mono font-bold text-2xl text-p3r-cyan">3</div>
          <div className="font-mono text-[10px] text-[#4488DD]">Urgency · Worth · Client</div>
        </CardSpotlight>
        <CardSpotlight className="p3r-card p-4 text-center">
          <div className="font-mono text-xs text-[#4488DD] mb-1">TOP CC SCORE</div>
          <div className="font-mono font-bold text-2xl text-[#ffd700]">
            {topsisResults[0]?.closenessCoefficient.toFixed(4)}
          </div>
          <div className="font-mono text-[10px] text-[#4488DD]">{topsisResults[0]?.item.name}</div>
        </CardSpotlight>
        <CardSpotlight className="p3r-card p-4 text-center">
          <div className="font-mono text-xs text-[#4488DD] mb-1">ITEMS RANKED</div>
          <div className="font-mono font-bold text-2xl text-p3r-cyan">{topsisResults.length}</div>
          <div className="font-mono text-[10px] text-[#4488DD]">by Closeness Coefficient</div>
        </CardSpotlight>
      </div>

      {/* TOPSIS table */}
      <CardSpotlight className="p3r-card overflow-x-auto">
        <div className="px-6 pt-5 pb-3" style={{ borderBottom: "1px solid rgba(0,68,204,0.3)" }}>
          <h3 className="font-heading font-bold text-p3r-cyan">TOPSIS Decision Matrix & Rankings</h3>
        </div>
        <table className="p3r-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Item</th>
              <th>Wt (kg)</th>
              <th>r_urgency</th>
              <th>r_worth</th>
              <th>r_client</th>
              <th>Dâº</th>
              <th>Dâ»</th>
              <th>CC (Score)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {topsisResults.map((r) => {
              const isSelected = knapsackResult.selectedItems.some(s => s.id === r.item.id);
              return (
                <tr key={r.item.id} className={isSelected ? "bg-[rgba(0,212,255,0.05)]" : ""}>
                  <td>
                    <span className={`font-mono font-bold ${r.rank === 1 ? "text-[#ffd700]" : r.rank <= 3 ? "text-p3r-cyan" : "text-[#4488DD]"}`}>
                      #{r.rank}
                    </span>
                  </td>
                  <td className="font-medium">{r.item.name}</td>
                  <td className="text-p3r-cyan">{r.item.weight}</td>
                  <td className="text-[#4488DD]">{r.normalizedMatrix[0].toFixed(4)}</td>
                  <td className="text-[#4488DD]">{r.normalizedMatrix[1].toFixed(4)}</td>
                  <td className="text-[#4488DD]">{r.normalizedMatrix[2].toFixed(4)}</td>
                  <td className="text-[#4488DD]">{r.distancePIS.toFixed(4)}</td>
                  <td className="text-[#4488DD]">{r.distanceNIS.toFixed(4)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-[#001166] rounded-full overflow-hidden">
                        <div className="h-full bg-p3-cyan rounded-full" style={{ width: `${r.closenessCoefficient * 100}%` }} />
                      </div>
                      <span className="font-mono font-bold text-p3r-cyan">{r.closenessCoefficient.toFixed(4)}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`p3r-badge ${isSelected ? "" : "border-red-500/30 bg-red-900/10 text-red-400"}`}>
                      {isSelected ? "SELECTED" : "EXCL."}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardSpotlight>

      {/* CC bar chart */}
      <CardSpotlight className="p3r-card p-6">
        <h3 className="font-heading font-bold text-p3r-cyan mb-4">Closeness Coefficient Distribution</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topsisResults.map(r => ({ name: r.item.name.substring(0,12), cc: parseFloat(r.closenessCoefficient.toFixed(4)), selected: knapsackResult.selectedItems.some(s => s.id === r.item.id) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.1)" />
              <XAxis dataKey="name" tick={{ fill: "#8ab4cc", fontSize: 10, fontFamily: "Rodin Pro DB" }} />
              <YAxis tick={{ fill: "#8ab4cc", fontSize: 10, fontFamily: "Rodin Pro DB" }} domain={[0, 1]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cc" name="CC Score" radius={[4, 4, 0, 0]}>
                {topsisResults.map((r) => (
                  <Cell key={r.item.id} fill={knapsackResult.selectedItems.some(s => s.id === r.item.id) ? "#00d4ff" : "#1a3a6b"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-2 justify-center">
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-p3-cyan rounded-sm" /><span className="font-mono text-[10px] text-[#4488DD]">Selected by Knapsack</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-p3-velvet rounded-sm" /><span className="font-mono text-[10px] text-[#4488DD]">Excluded</span></div>
        </div>
      </CardSpotlight>
    </div>
  );

  // â”€â”€ Tab 2: Knapsack â”€â”€
  const knapsackTab = (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "SELECTED", value: knapsackResult.selectedItems.length.toString(), sub: "items chosen", color: "text-p3r-cyan" },
          { label: "EXCLUDED", value: knapsackResult.excludedItems.length.toString(), sub: "items left", color: "text-red-400" },
          { label: "TOTAL WEIGHT", value: `${knapsackResult.totalWeight.toFixed(0)} kg`, sub: `of ${vehicleConfig.maxCapacity} kg`, color: "text-p3r-cyan" },
          { label: "PRIORITY SCORE", value: knapsackResult.totalPriorityScore.toFixed(4), sub: "total CC sum", color: "text-[#ffd700]" },
        ].map(s => (
          <CardSpotlight key={s.label} className="p3r-card p-4 text-center">
            <div className="font-mono text-xs text-[#4488DD] mb-1">{s.label}</div>
            <div className={`font-mono font-bold text-2xl ${s.color}`}>{s.value}</div>
            <div className="font-mono text-[10px] text-[#4488DD]">{s.sub}</div>
          </CardSpotlight>
        ))}
      </div>

      {/* Capacity bar */}
      <CardSpotlight className="p3r-card p-6">
        <div className="flex justify-between mb-2">
          <span className="font-mono text-xs text-[#4488DD]">Capacity Utilization</span>
          <span className="font-mono text-xs text-p3r-cyan font-bold">{formatPercent(knapsackResult.utilizationPercent)}</span>
        </div>
        <div className="h-4 bg-[#001166] rounded-full overflow-hidden border border-[#0044CC]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${knapsackResult.utilizationPercent}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #00d4ff, #4a9eff)" }}
          />
        </div>
        <div className="flex justify-between mt-1 font-mono text-[10px] text-[#4488DD]">
          <span>0 kg</span>
          <span>Remaining: {knapsackResult.remainingCapacity.toFixed(0)} kg</span>
          <span>{vehicleConfig.maxCapacity} kg</span>
        </div>
      </CardSpotlight>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Selected items */}
        <CardSpotlight className="p3r-card p-5">
          <h3 className="font-heading font-bold text-p3r-cyan mb-3 flex items-center gap-2">
            SELECTED CARGO ({knapsackResult.selectedItems.length})
          </h3>
          <div className="space-y-2">
            {knapsackResult.selectedItems.map((item) => {
              const tr = topsisResults.find(r => r.item.id === item.id);
              return (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-[rgba(0,212,255,0.05)] border border-[#0044CC]">
                  <div>
                    <div className="font-mono text-sm font-medium text-white">{item.name}</div>
                    <div className="font-mono text-[10px] text-[#4488DD]">{item.weight} kg · CC: {tr?.closenessCoefficient.toFixed(4)}</div>
                  </div>
                  <span className="p3r-badge">Rank #{tr?.rank}</span>
                </div>
              );
            })}
          </div>
        </CardSpotlight>

        {/* Excluded items */}
        <CardSpotlight className="p3r-card p-5">
          <h3 className="font-heading font-bold text-red-400 mb-3">EXCLUDED CARGO ({knapsackResult.excludedItems.length})</h3>
          {knapsackResult.excludedItems.length === 0 ? (
            <p className="font-mono text-xs text-[#4488DD]">All items were selected â€” perfect fit!</p>
          ) : (
            <div className="space-y-2">
              {knapsackResult.excludedItems.map((item) => {
                const tr = topsisResults.find(r => r.item.id === item.id);
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-[rgba(255,0,0,0.03)] border border-red-500/20">
                    <div>
                      <div className="font-mono text-sm font-medium text-[#4488DD]">{item.name}</div>
                      <div className="font-mono text-[10px] text-[#4488DD]/60">{item.weight} kg · CC: {tr?.closenessCoefficient.toFixed(4)}</div>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-mono border border-red-500/30 text-red-400">Rank #{tr?.rank}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardSpotlight>
      </div>
    </div>
  );

  // â”€â”€ Tab 3: Fuel â”€â”€
  const fuelTab = (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-5">
        {/* Optimized */}
        <CardSpotlight className="p3r-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-p3-cyan rounded-full animate-pulse" />
            <span className="font-mono text-xs text-p3r-cyan uppercase tracking-wider">KNAPSACK OPTIMIZED</span>
          </div>
          <div className="space-y-3">
            {[
              { label: "Cargo Weight", value: `${fuelResult.cargoWeight.toFixed(0)} kg`, color: "text-white" },
              { label: "Adjusted FCR", value: `${fuelResult.adjustedFCR.toFixed(4)} L/km`, color: "text-white" },
              { label: "Total Fuel", value: `${fuelResult.totalFuel.toFixed(4)} L`, color: "text-p3r-cyan" },
              { label: "Fuel Cost", value: formatPHP(fuelResult.totalCost), color: "text-[#ffd700]" },
              { label: "Efficiency (E)", value: fuelResult.efficiency.toFixed(4), color: "text-green-400" },
              { label: "Priority Score (V)", value: knapsackResult.totalPriorityScore.toFixed(4), color: "text-p3r-cyan" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center border-b border-[#0044CC] pb-2">
                <span className="font-mono text-xs text-[#4488DD]">{label}</span>
                <span className={`font-mono font-bold text-sm ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </CardSpotlight>

        {/* Naive */}
        <CardSpotlight className="p3r-card p-6 border border-p3-muted/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-p3-muted rounded-full" />
            <span className="font-mono text-xs text-[#4488DD] uppercase tracking-wider">NAIVE (HEAVIEST-FIRST)</span>
          </div>
          <div className="space-y-3">
            {[
              { label: "Cargo Weight", value: `${fuelResult.naiveWeight.toFixed(0)} kg`, color: "text-white" },
              { label: "Adjusted FCR", value: `${(vehicleConfig.baseFCR * (1 + vehicleConfig.weightPenalty * fuelResult.naiveWeight / vehicleConfig.maxCapacity)).toFixed(4)} L/km`, color: "text-white" },
              { label: "Total Fuel", value: `${fuelResult.naiveFuel.toFixed(4)} L`, color: "text-[#4488DD]" },
              { label: "Fuel Cost", value: formatPHP(fuelResult.naiveCost), color: "text-[#4488DD]" },
              { label: "Efficiency (E_naive)", value: fuelResult.naiveEfficiency.toFixed(4), color: "text-red-400" },
              { label: "Priority Score (V_naive)", value: fuelResult.naivePriorityScore.toFixed(4), color: "text-[#4488DD]" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center border-b border-[rgba(0,212,255,0.08)] pb-2">
                <span className="font-mono text-xs text-[#4488DD]">{label}</span>
                <span className={`font-mono font-bold text-sm ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </CardSpotlight>
      </div>

      {/* Efficiency gain banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p3r-card p-6 border border-green-500/40 text-center"
      >
        <div className="font-mono text-xs text-green-400 uppercase tracking-wider mb-2">EFFICIENCY GAIN RESULT</div>
        <div className="font-mono font-bold text-5xl text-green-400 mb-2">
          +{formatNumber(fuelResult.efficiencyGainPercent, 1)}%
        </div>
        <p className="font-mono text-sm text-[#4488DD]">
          The Knapsack-optimized load delivers <strong className="text-p3r-cyan">{formatNumber(fuelResult.efficiency, 3)}</strong> vs naive <strong className="text-red-400">{formatNumber(fuelResult.naiveEfficiency, 3)}</strong> priority value per liter consumed.
        </p>
      </motion.div>

      {/* Fuel comparison bar chart */}
      <CardSpotlight className="p3r-card p-6">
        <h3 className="font-heading font-bold text-p3r-cyan mb-4">Efficiency Comparison</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: "Optimized", value: parseFloat(fuelResult.efficiency.toFixed(4)), fill: "#00d4ff" },
              { name: "Naive", value: parseFloat(fuelResult.naiveEfficiency.toFixed(4)), fill: "#1a3a6b" },
            ]} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.1)" />
              <XAxis type="number" tick={{ fill: "#8ab4cc", fontSize: 10, fontFamily: "Rodin Pro DB" }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#8ab4cc", fontSize: 11, fontFamily: "Rodin Pro DB" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Efficiency" radius={[0, 4, 4, 0]}>
                {[{ fill: "#00d4ff" }, { fill: "#1a3a6b" }].map((c, i) => <Cell key={i} fill={c.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardSpotlight>
    </div>
  );

  // â”€â”€ Tab 4: Summary â”€â”€
  const summaryTab = (
    <div className="space-y-6">
      {/* Bento grid summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Items Selected", value: knapsackResult.selectedItems.length, unit: "/ " + items.length + " total", color: "text-p3r-cyan", border: "border-p3-cyan/30" },
          { label: "Capacity Used", value: formatPercent(knapsackResult.utilizationPercent), unit: `${knapsackResult.totalWeight.toFixed(0)} kg`, color: "text-p3r-cyan", border: "border-p3-blue/30" },
          { label: "Total Fuel Cost", value: formatPHP(fuelResult.totalCost), unit: `${fuelResult.totalFuel.toFixed(2)} L`, color: "text-[#ffd700]", border: "border-yellow-400/30" },
          { label: "Efficiency Gain", value: `+${formatNumber(fuelResult.efficiencyGainPercent, 1)}%`, unit: "vs naive", color: "text-green-400", border: "border-green-500/30" },
          { label: "Fuel per 100km", value: `${(fuelResult.adjustedFCR * 100).toFixed(1)} L`, unit: "adjusted FCR", color: "text-p3r-cyan", border: "border-p3-cyan/30" },
          { label: "Top Priority Item", value: topsisResults[0]?.item.name.substring(0, 12) + (topsisResults[0]?.item.name.length > 12 ? "â€¦" : ""), unit: `CC: ${topsisResults[0]?.closenessCoefficient.toFixed(4)}`, color: "text-[#ffd700]", border: "border-yellow-400/30" },
          { label: "Remaining Capacity", value: `${knapsackResult.remainingCapacity.toFixed(0)} kg`, unit: "unused", color: "text-[#4488DD]", border: "border-[#0044CC]" },
          { label: "Route Distance", value: `${vehicleConfig.routeDistance} km`, unit: "one way", color: "text-p3r-cyan", border: "border-p3-blue/30" },
        ].map(({ label, value, unit, color, border }) => (
          <CardSpotlight key={label} className={`p3r-card border ${border} p-4 text-center`}>
            <div className="font-mono text-[10px] text-[#4488DD] uppercase tracking-wider mb-1">{label}</div>
            <div className={`font-mono font-bold text-lg ${color}`}>{value}</div>
            <div className="font-mono text-[10px] text-[#4488DD]/60">{unit}</div>
          </CardSpotlight>
        ))}
      </div>

      {/* Computation steps display */}
      <CardSpotlight className="p3r-card p-6">
        <h3 className="font-heading font-bold text-p3r-cyan mb-4">Step-by-Step Fuel Computation</h3>
        <div className="font-mono text-sm space-y-3 text-[#4488DD]">
          <p><span className="text-p3r-cyan">Step 1.</span> FCR(y) = {vehicleConfig.baseFCR} Ã— (1 + {vehicleConfig.weightPenalty} Ã— {fuelResult.cargoWeight.toFixed(0)}/{vehicleConfig.maxCapacity})</p>
          <p className="pl-6 text-white">= <span className="text-p3r-cyan">{fuelResult.adjustedFCR.toFixed(4)} L/km</span></p>
          <p><span className="text-p3r-cyan">Step 2.</span> Fuel(L) = {fuelResult.adjustedFCR.toFixed(4)} Ã— {vehicleConfig.routeDistance} km</p>
          <p className="pl-6 text-white">= <span className="text-p3r-cyan">{fuelResult.totalFuel.toFixed(4)} L</span></p>
          <p><span className="text-p3r-cyan">Step 3.</span> Cost = {fuelResult.totalFuel.toFixed(4)} Ã— ₱{vehicleConfig.dieselPrice}/L</p>
          <p className="pl-6 text-white">= <span className="text-[#ffd700]">{formatPHP(fuelResult.totalCost)}</span></p>
          <p><span className="text-p3r-cyan">Step 4.</span> E = {knapsackResult.totalPriorityScore.toFixed(4)} / {fuelResult.totalFuel.toFixed(4)}</p>
          <p className="pl-6 text-white">= <span className="text-green-400">{fuelResult.efficiency.toFixed(4)}</span></p>
          <p><span className="text-[#4488DD]">Control:</span> E_naive = {fuelResult.naivePriorityScore.toFixed(4)} / {fuelResult.naiveFuel.toFixed(4)} = <span className="text-red-400">{fuelResult.naiveEfficiency.toFixed(4)}</span></p>
        </div>
      </CardSpotlight>
    </div>
  );

  return (
    <PageLayout title="Optimization Results" subtitle="TOPSIS + Knapsack analysis output" badge="Results · All Phases" decoWord="DATA">
      <AnimatedTabs
        tabs={[
          { title: "TOPSIS Phase", value: "topsis", content: topsisTab },
          { title: "Knapsack Phase", value: "knapsack", content: knapsackTab },
          { title: "Fuel Analysis", value: "fuel", content: fuelTab },
          { title: "Summary", value: "summary", content: summaryTab },
        ]}
      />
    </PageLayout>
  );
}

