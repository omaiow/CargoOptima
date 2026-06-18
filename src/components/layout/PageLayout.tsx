"use client";
import { SideNav } from "./SideNav";
import { motion } from "framer-motion";

export const PageLayout = ({
  children,
  title,
  subtitle,
  badge,
  decoWord,
}: {
  children:  React.ReactNode;
  title:     string;
  subtitle?: string;
  badge?:    string;
  decoWord?: string; // giant background decorative text
}) => {
  return (
    <div className="min-h-screen flex">
      <SideNav />

      <main className="flex-1 ml-64 relative min-h-screen overflow-x-hidden"
        style={{ background: "linear-gradient(135deg, #000D44 0%, #001166 40%, #001A88 100%)" }}>

        {/* The iconic P3R blue sphere */}
        <div className="p3r-sphere" />

        {/* Giant decorative background text */}
        {decoWord && (
          <div className="p3r-deco-text select-none pointer-events-none"
            style={{ bottom: "-0.1em", right: "-0.05em" }}>
            {decoWord}
          </div>
        )}

        {/* Subtle dot grid */}
        <div className="fixed inset-0 ml-64 pointer-events-none" style={{
          backgroundImage: "radial-gradient(rgba(0,85,238,0.2) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          zIndex: 1,
        }} />

        {/* Top accent line */}
        <div className="fixed top-0 left-64 right-0 h-0.5 z-20"
          style={{ background: "linear-gradient(90deg, #0055EE, #00DDFF, #0055EE)" }} />

        {/* Content */}
        <div className="relative z-10 p-8 pt-10">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            {badge && (
              <div className="flex items-center gap-3 mb-3">
                {/* Red diagonal pill */}
                <div className="bg-p3r-red px-4 py-0.5"
                  style={{ clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)" }}>
                  <span className="font-heading font-bold italic text-white text-xs tracking-widest uppercase">
                    {badge}
                  </span>
                </div>
                <div className="h-0.5 w-12 bg-p3r-cyan opacity-60" />
              </div>
            )}

            <h1 className="font-heading font-bold italic uppercase text-white leading-none"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)", textShadow: "4px 4px 0 rgba(0,0,0,0.5)" }}>
              {title}
            </h1>

            {subtitle && (
              <p className="font-mono text-sm text-[#66AAFF] mt-1">{subtitle}</p>
            )}

            {/* Divider: blue line + red diamond */}
            <div className="flex items-center gap-3 mt-4 mb-2">
              <div className="h-0.5 w-8 bg-p3r-red" />
              <div className="w-2 h-2 bg-p3r-cyan rotate-45" />
              <div className="h-0.5 flex-1 bg-[#0044CC]" />
            </div>
          </motion.div>

          {children}
        </div>
      </main>
    </div>
  );
};
