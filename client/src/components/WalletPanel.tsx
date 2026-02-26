import * as React from "react";
import { Wallet, Link2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AddressSchema, formatAddress } from "@/lib/wallet";

// Minimal wagmi usage (optional). If anything goes wrong, UI falls back to manual address entry.
import { useAccount, useConnect, useDisconnect } from "wagmi";

export function WalletPanel({
  walletAddress,
  onWalletAddressChange,
}: {
  walletAddress: string;
  onWalletAddressChange: (addr: string) => void;
}) {
  const [mode, setMode] = React.useState<"auto" | "manual">("auto");

  const account = safeHook(() => useAccount());
  const connect = safeHook(() => useConnect());
  const disconnect = safeHook(() => useDisconnect());

  const hasWagmi = !!account && !!connect && !!disconnect;

  React.useEffect(() => {
    if (!hasWagmi) setMode("manual");
  }, [hasWagmi]);

  React.useEffect(() => {
    const addr = account?.address;
    if (addr) onWalletAddressChange(addr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.address]);

  const isValid = React.useMemo(() => AddressSchema.safeParse(walletAddress).success, [walletAddress]);

  function connectClick() {
    if (!hasWagmi) {
      setMode("manual");
      return;
    }
    try {
      // Prefer first connector to keep it simple/stable.
      const c = connect.connectors?.[0];
      if (!c) {
        setMode("manual");
        return;
      }
      connect.connect({ connector: c });
    } catch (e) {
      console.error(e);
      setMode("manual");
    }
  }

  function disconnectClick() {
    try {
      disconnect?.disconnect?.();
      onWalletAddressChange("");
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="rounded-2xl glass p-5 border-glow animate-in-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">Connect Wallet (Base)</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            For stability: connect with Wagmi if available, or paste an address manually.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setMode("auto")} variant={mode === "auto" ? "default" : "secondary"}>
            <Link2 className="mr-2 h-4 w-4" />
            Auto
          </Button>
          <Button onClick={() => setMode("manual")} variant={mode === "manual" ? "default" : "secondary"}>
            Manual
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {mode === "auto" ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            {!hasWagmi ? (
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm font-semibold">Auto-connect unavailable</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Connector dependencies are missing or blocked in this environment. Switch to manual.
                  </p>
                </div>
              </div>
            ) : account?.isConnected ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Connected address</p>
                  <p className="mt-1 font-mono text-sm text-foreground/95 break-all">
                    {account.address}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={disconnectClick} variant="secondary">
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Ready to connect</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Click connect. If it fails, use manual input.
                  </p>
                </div>
                <Button onClick={connectClick}>
                  Connect Wallet (Base)
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <label className="text-xs text-muted-foreground">Wallet address</label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                value={walletAddress}
                onChange={(e) => onWalletAddressChange(e.target.value)}
                placeholder="0x…"
                className="font-mono"
              />
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs",
                  isValid
                    ? "border-primary/30 bg-primary/10 text-foreground/90"
                    : "border-white/10 bg-white/5 text-muted-foreground",
                )}
              >
                {isValid ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Valid: {formatAddress(walletAddress)}
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-accent" />
                    Paste a valid address
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground">
          Note: This V1 is optimized for reliability on free tier. It stores your capsule in Supabase and
          generates SHA-256 hashes client-side before sealing.
        </p>
      </div>
    </div>
  );
}

function safeHook<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}
