"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Tab = { title: string; value: string; content: React.ReactNode };

export const AnimatedTabs = ({
  tabs,
  containerClassName,
  tabClassName,
}: {
  tabs: Tab[];
  containerClassName?: string;
  tabClassName?: string;
}) => {
  const [active, setActive] = useState<Tab>(tabs[0]);

  return (
    <div className={cn("w-full", containerClassName)}>
      <div className="flex flex-wrap gap-1 border-b-2 border-[#0044CC] mb-6">
        {tabs.map((tab) => (
          <button key={tab.value} onClick={() => setActive(tab)}
            className={cn("relative px-5 py-2.5 font-heading font-bold italic uppercase text-sm tracking-wide transition-colors",
              active.value === tab.value ? "text-white" : "text-[#4488DD] hover:text-white", tabClassName)}>
            {active.value === tab.value && (
              <motion.div layoutId="active-tab" className="absolute inset-0 bg-p3r-red"
                style={{ clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)" }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />
            )}
            <span className="relative z-10">{tab.title}</span>
          </button>
        ))}
      </div>
      <motion.div key={active.value} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {active.content}
      </motion.div>
    </div>
  );
};
