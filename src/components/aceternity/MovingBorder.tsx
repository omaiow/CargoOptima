"use client";
import { cn } from "@/lib/utils";

export const MovingBorder = ({
  children,
  className,
  containerClassName,
  borderClassName,
  duration = 3000,
  as: Component = "button",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  borderClassName?: string;
  duration?: number;
  as?: React.ElementType;
  [key: string]: unknown;
}) => {
  return (
    <Component
      className={cn("relative p-[1px] overflow-hidden rounded-lg group", containerClassName)}
      {...props}
    >
      {/* Animated border */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          background: `conic-gradient(from var(--angle, 0deg), #00d4ff, #4a9eff, #1a3a6b, #00d4ff)`,
          animation: `spin ${duration}ms linear infinite`,
        }}
      />
      <div className={cn("relative rounded-lg bg-p3-navy-mid", className)}>
        {children}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes spin {
          to { --angle: 360deg; }
        }
      ` }} />
    </Component>
  );
};
