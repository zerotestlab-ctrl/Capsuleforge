import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'viem/chains';
import '@rainbow-me/rainbowkit/styles.css';

// Configure RainbowKit and Wagmi
// Base mainnet only as requested
export const config = getDefaultConfig({
  appName: 'CapsuleForge',
  projectId: 'YOUR_PROJECT_ID', // Requires a WalletConnect project ID in production, safe default for dev
  chains: [base],
  ssr: false, 
});
