import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "purple";
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass rounded-2xl p-6 md:p-8 relative overflow-hidden",
          variant === "purple" ? "box-glow-purple" : "box-glow",
          className
        )}
        {...props}
      >
        <div className={cn(
          "absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none",
          variant === "purple" ? "bg-purple-600" : "bg-primary"
        )} />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";
