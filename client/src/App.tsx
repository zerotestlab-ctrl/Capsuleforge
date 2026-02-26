import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { config } from './lib/web3';
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CapsuleView from "@/pages/CapsuleView";

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
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#00f5ff',
          accentColorForeground: '#0a0a0a',
          borderRadius: 'large',
          overlayBlur: 'small',
        })}>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
