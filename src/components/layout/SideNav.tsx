"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/",       label: "DASHBOARD",   sub: "Overview"      },
  { href: "/cargo",  label: "CARGO INPUT", sub: "Add items"     },
  { href: "/results",label: "RESULTS",     sub: "Analysis"      },
  { href: "/map",    label: "ROUTE MAP",   sub: "Visualization" },
];

export const SideNav = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-50 flex flex-col shadow-2xl"
      style={{ background: "linear-gradient(180deg, #05050A 0%, #0A0A14 60%, #000000 100%)" }}>

      {/* Left blue accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-p3r-bright" />

      {/* Logo */}
      <div className="px-6 pt-8 pb-6" style={{ borderBottom: "1px solid rgba(0,68,204,0.3)" }}>
        {/* Small decorative slash */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-0.5 bg-p3r-red" />
          <div className="w-6 h-0.5 bg-p3r-cyan" />
        </div>
        <div className="font-display font-black text-3xl text-white leading-none tracking-wider">
          CARGO
        </div>
        <div className="font-display font-black text-3xl text-white leading-none tracking-wider">
          OPTIMA
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 pt-4 overflow-y-auto">
        {navItems.map((item, i) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={cn(
                  "relative flex items-center gap-0 transition-all duration-200 cursor-pointer select-none",
                  isActive ? "py-3" : "py-2"
                )}
              >
                {/* Active: red left stripe + background */}
                {isActive && (
                  <>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-p3r-red" />
                    <div className="absolute inset-0 bg-[rgba(255,17,51,0.12)]" />
                  </>
                )}

                <div className="relative pl-8 pr-4 w-full">
                  {/* Active label */}
                  {isActive ? (
                    <div>
                      {/* Red active badge */}
                      <div className="inline-block bg-p3r-red px-3 py-0.5 mb-1"
                        style={{ clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)" }}>
                        <span className="font-heading font-bold italic text-white text-xs tracking-widest uppercase">
                          ACTIVE
                        </span>
                      </div>
                      <div className="font-heading font-bold italic uppercase text-white text-xl tracking-wide leading-none">
                        {item.label}
                      </div>
                      <div className="font-mono text-[10px] text-p3r-cyan mt-0.5 uppercase tracking-wider">
                        {item.sub}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <span className="font-heading font-bold italic uppercase text-[#4488DD] text-sm tracking-wide
                                       group-hover:text-white transition-colors duration-150">
                        {item.label}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
};
