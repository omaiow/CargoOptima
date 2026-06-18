"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { SideNav } from "@/components/layout/SideNav";
import { useAppStore } from "@/lib/store";
import { formatNumber, formatPHP, formatPercent } from "@/lib/utils";

export default function DashboardPage() {
  const { currentRun, cargoItems } = useAppStore();

  const menuItems = [
    { href: "/cargo",   label: "CARGO INPUT",  sub: "Define shipment items",           active: false },
    { href: "/results", label: "RESULTS",       sub: "TOPSIS + Knapsack analysis",      active: false },
    { href: "/map",     label: "ROUTE MAP",     sub: "Philippines route visualization", active: false },
  ];

  const stats = [
    { label: "CARGO ITEMS",    value: cargoItems.length.toString(),
      detail: "loaded",        color: "#00DDFF" },
    { label: "CAPACITY USED",  value: currentRun ? formatPercent(currentRun.knapsackResult.utilizationPercent) : "—",
      detail: "of 4,000 kg",   color: "#00DDFF" },
    { label: "FUEL EFFICIENCY",value: currentRun ? formatNumber(currentRun.fuelResult.efficiency, 3) : "—",
      detail: "val / liter",   color: "#FFD700" },
    { label: "EFFICIENCY GAIN",value: currentRun ? `+${formatNumber(currentRun.fuelResult.efficiencyGainPercent, 1)}%` : "—",
      detail: "vs naive",      color: "#00FF88" },
  ];

  return (
    <div className="min-h-screen flex">
      <SideNav />

      <main className="flex-1 ml-64 relative min-h-screen overflow-hidden"
        style={{ background: "linear-gradient(135deg, #000D44 0%, #001166 40%, #001A88 100%)" }}>

        {/* Sphere */}
        <div className="p3r-sphere" />

        {/* Giant background text */}
        <div className="p3r-deco-text" style={{ bottom: "-0.05em", right: "-0.02em", opacity: 0.05 }}>
          CARGO
        </div>

        {/* Dot grid */}
        <div className="fixed inset-0 ml-64 pointer-events-none" style={{
          backgroundImage: "radial-gradient(rgba(0,85,238,0.18) 1px, transparent 1px)",
          backgroundSize: "32px 32px", zIndex: 1,
        }} />

        {/* Top line */}
        <div className="fixed top-0 left-64 right-0 h-0.5 z-20"
          style={{ background: "linear-gradient(90deg, #0055EE, #00DDFF, #0055EE)" }} />

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* ── Hero ── */}
          <div className="flex-1 flex flex-col justify-center px-10 pt-8 pb-4">

            {/* Main title — P3R style large + outline */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }} className="mb-2">
              <div className="font-display font-black text-white leading-none"
                style={{ fontSize: "clamp(4rem, 10vw, 9rem)", letterSpacing: "0.05em",
                  textShadow: "0 0 40px rgba(0,85,238,0.8), 4px 4px 0 rgba(0,0,0,0.6)" }}>
                CARGO
              </div>
              <div className="font-display font-black text-white leading-none"
                style={{ fontSize: "clamp(4rem, 10vw, 9rem)", letterSpacing: "0.05em",
                  textShadow: "4px 4px 0 #05050A" }}>
                OPTIMA
              </div>
            </motion.div>

            {/* Tagline */}


            {/* P3R-style menu list */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="space-y-1 mb-10 max-w-sm">
              {menuItems.map((item, i) => (
                <motion.div key={item.href}
                  initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.07 }}>
                  <Link href={item.href}>
                    <div className="flex items-center gap-3 group cursor-pointer py-1.5">
                      {/* P3R-style arrow indicator */}
                      <div className="w-4 h-0.5 bg-p3r-cyan opacity-0 group-hover:opacity-100
                                      transition-opacity" />
                      <div>
                        <div className="font-heading font-bold italic uppercase text-[#4499EE] text-lg
                                        tracking-wide group-hover:text-white transition-colors">
                          {item.label}
                        </div>
                        <div className="font-mono text-[10px] text-[#3366AA] group-hover:text-p3r-cyan
                                        transition-colors -mt-0.5">
                          {item.sub}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }} className="flex gap-4">
              <Link href="/cargo">
                <button id="btn-begin-optimization" className="p3r-btn-primary text-base px-10 py-3.5">
                  BEGIN
                </button>
              </Link>
            </motion.div>
          </div>

          {/* ── Stat bar ── */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="relative z-10 grid grid-cols-4"
            style={{ background: "#05050A", borderTop: "1px solid rgba(0,68,204,0.4)" }}>
            {stats.map((s, i) => (
              <div key={s.label}
                className={`px-6 py-5 ${i < 3 ? "border-r border-[rgba(0,68,204,0.3)]" : ""}`}>
                <div className="font-heading font-bold italic uppercase text-[10px] tracking-[0.2em] text-[#4488DD] mb-1">
                  {s.label}
                </div>
                <div className="font-display font-black leading-none"
                  style={{ fontSize: "2.2rem", color: s.color,
                    textShadow: `2px 2px 0px #000000, 0 0 20px ${s.color}88` }}>
                  {s.value}
                </div>
                <div className="font-mono text-[10px] text-[#3366AA] mt-0.5">{s.detail}</div>
              </div>
            ))}
          </motion.div>

          {/* Last run banner */}
          {currentRun && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="relative z-10 px-8 py-4 flex items-center justify-between"
              style={{ background: "#0A0A14", borderTop: "2px solid #FF1133" }}>
              <div>
                <div className="font-heading font-bold italic text-p3r-red uppercase tracking-wider text-sm">
                  LAST RUN COMPLETE
                </div>
                <div className="font-mono text-xs text-[#66AAFF]">
                  {new Date(currentRun.timestamp).toLocaleString("en-PH")} ·{" "}
                  {currentRun.knapsackResult.selectedItems.length} items selected ·{" "}
                  {formatPHP(currentRun.fuelResult.totalCost)} fuel cost ·{" "}
                  +{formatNumber(currentRun.fuelResult.efficiencyGainPercent, 1)}% efficiency gain
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/results">
                  <button className="p3r-btn-primary text-sm px-5 py-2">View Results</button>
                </Link>
                <Link href="/map">
                  <button className="p3r-btn-blue text-sm px-5 py-2">Route Map</button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
