import * as React from "react";
import { Link, useLocation } from "wouter";
import { ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function BrandHeader({
  rightSlot,
}: {
  rightSlot?: React.ReactNode;
}) {
  const [location] = useLocation();
  const isHome = location === "/";

  return (
    <header className="sticky top-0 z-[100]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-4 glass-subtle rounded-2xl">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary/30 via-accent/25 to-primary/20 ring-1 ring-white/10 neon-ring animate-pulse-soft" />
                <div className="absolute inset-0 grid place-items-center">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href="/"
                    className={cn(
                      "font-display text-base sm:text-lg tracking-tight",
                      "text-foreground/95 hover:underline underline-offset-4 decoration-white/20",
                    )}
                  >
                    CapsuleForge
                  </Link>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-accent" />
                    V1
                  </span>
                </div>
                <p className="truncate text-xs sm:text-sm text-muted-foreground">
                  Seal your vibecoded build on-chain in 60 seconds
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              {!isHome && (
                <Button asChild variant="secondary">
                  <Link href="/">Back to forge</Link>
                </Button>
              )}
              {rightSlot}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
