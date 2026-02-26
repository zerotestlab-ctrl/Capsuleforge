import * as React from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CapsuleView from "@/pages/CapsuleView";
import { queryClient } from "./lib/queryClient";

// Keep Wagmi Provider but avoid hard crashes if wagmi config file is missing/misconfigured.
// (Some environments may not have working connectors; UI falls back to manual address input.)
let WagmiProvider: React.ComponentType<{ config: any; children: React.ReactNode }> | null = null;
let wagmiConfig: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const wagmi = await import("wagmi");
  WagmiProvider = wagmi.WagmiProvider;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const web3 = await import("./lib/web3");
  wagmiConfig = web3.config;
} catch (e) {
  console.warn("[CapsuleForge] Wagmi not available, continuing without auto-connect:", e);
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/c/:id" component={CapsuleView} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const content = (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );

  if (WagmiProvider && wagmiConfig) {
    return <WagmiProvider config={wagmiConfig}>{content}</WagmiProvider>;
  }

  return content;
}

export default App;
