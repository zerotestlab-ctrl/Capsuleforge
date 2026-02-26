## Packages
wagmi | React hooks for Web3/Ethereum
viem | Core Ethereum library needed by wagmi
@rainbow-me/rainbowkit | Premium wallet connection UI
@supabase/supabase-js | Supabase client for direct DB access
framer-motion | Polished animations and page transitions

## Notes
- RainbowKit requires specific peer dependencies (React, Wagmi, Viem).
- Supabase keys expected in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
- Web Crypto API used for client-side SHA-256 hashing.
- nft.storage API used via standard fetch (no heavy SDK needed).
