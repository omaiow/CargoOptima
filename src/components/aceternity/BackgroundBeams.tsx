"use client";
import { cn } from "@/lib/utils";

// Pre-computed static offsets to avoid hydration mismatch
const BEAM_OFFSETS = [-2.1, 1.8, -3.4, 2.7, -1.2, 4.1, -2.9, 1.5, -3.8, 2.2, -1.6, 3.3];

export const BackgroundBeams = ({ className }: { className?: string }) => {
  const beams = Array.from({ length: 12 });
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="beamGrad" cx="50%" cy="0%" r="80%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
          </radialGradient>
          {beams.map((_, i) => (
            <linearGradient key={i} id={`beam-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="0" />
              <stop offset="40%" stopColor="#00d4ff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#4a9eff" stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        <rect width="100%" height="100%" fill="url(#beamGrad)" />
        {beams.map((_, i) => {
          const x = (i / (beams.length - 1)) * 100;
          return (
            <line
              key={i}
              x1={`${x}%`}
              y1="0%"
              x2={`${x + BEAM_OFFSETS[i]}%`}
              y2="100%"
              stroke={`url(#beam-${i})`}
              strokeWidth="1"
              style={{
                animation: `beam-fade ${3 + i * 0.3}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          );
        })}
      </svg>
      <style>{`
        @keyframes beam-fade {
          0% { opacity: 0.2; }
          100% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};
