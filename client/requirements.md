## Packages
@supabase/supabase-js | Direct Supabase access for capsules table (stable CRUD without extra backend complexity)
wagmi | Wallet connection + address retrieval (kept minimal)
viem | Wagmi transport + Base chain config
@tanstack/react-query | Already in base stack, used for caching (no action)
framer-motion | Premium motion + staggered reveals (already installed but kept as dependency note)

## Notes
- Supabase keys must be present as Vite env vars: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (configured in Replit Secrets/Env, not in filesystem).
- Wallet connect is intentionally minimal: fallback to manual address input if connectors fail.
- IPFS upload uses nft.storage HTTP API directly (no SDK); user provides API key in UI.
- Backend `/api/capsules` remains as optional fallback if Supabase is unavailable.
