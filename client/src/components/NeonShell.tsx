import * as React from "react";
import { cn } from "@/lib/utils";

export function NeonShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-screen grain bg-background text-foreground", className)}>
      <div className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-mesh" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-[0.20]" />
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/20 via-accent/20 to-primary/15 blur-3xl" />
        {children}
      </div>
    </div>
  );
}
