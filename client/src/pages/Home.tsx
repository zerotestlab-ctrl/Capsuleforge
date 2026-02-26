import * as React from "react";
import { NeonShell } from "@/components/NeonShell";
import { BrandHeader } from "@/components/BrandHeader";
import { WalletPanel } from "@/components/WalletPanel";
import { CapsuleForm, type SealResult } from "@/components/CapsuleForm";
import { SuccessPanel } from "@/components/SuccessPanel";

import { useToast } from "@/hooks/use-toast";
import { api, type CapsuleInput } from "@shared/routes";
import { useCreateCapsule } from "@/hooks/use-capsules";
import { useSupabaseCreateCapsule } from "@/hooks/use-supabase-capsules";
import { z } from "zod";

const EnvOkSchema = z.object({
  VITE_SUPABASE_URL: z.string().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().optional(),
});

export default function Home() {
  const { toast } = useToast();

  const [walletAddress, setWalletAddress] = React.useState("");
  const [sealed, setSealed] = React.useState<SealResult | null>(null);

  // Prefer Supabase direct (stable). Fallback to backend if Supabase env missing or request fails.
  const supabaseCreate = useSupabaseCreateCapsule();
  const backendCreate = useCreateCapsule();

  const envOk = React.useMemo(() => {
    const env = EnvOkSchema.parse({
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    });
    return !!env.VITE_SUPABASE_URL && !!env.VITE_SUPABASE_ANON_KEY;
  }, []);

  async function createCapsule(input: CapsuleInput) {
    // Always validate with shared schema before sending anywhere
    const validated = api.capsules.create.input.parse(input);

    if (envOk) {
      try {
        const created = await supabaseCreate.mutateAsync(validated);
        return { id: created.id, ipfsCid: created.ipfsCid ?? null, hash: created.hash };
      } catch (e: any) {
        console.error("[Supabase] create failed, falling back to backend:", e?.message || e);
        toast({
          title: "Supabase unavailable",
          description: "Falling back to local API endpoint…",
          variant: "destructive",
        });
        // continue to backend fallback
      }
    }

    const created = await backendCreate.mutateAsync(validated);
    return { id: created.id, ipfsCid: created.ipfsCid ?? null, hash: created.hash };
  }

  return (
    <NeonShell>
      <BrandHeader />
      <main className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pt-10">
          <section className="animate-in-up">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.02] text-gradient">
                CapsuleForge
              </h1>
              <p className="mt-4 text-sm sm:text-base lg:text-lg text-foreground/85">
                Seal your vibecoded build on-chain in 60 seconds.
                <span className="text-muted-foreground"> </span>
                Minimal, stable, and shareable—built for the Replit free tier.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="rounded-2xl glass-subtle px-4 py-3 text-xs text-muted-foreground">
                  <span className="text-foreground/90 font-semibold">Storage:</span>{" "}
                  {envOk ? "Supabase (direct)" : "Local API fallback"}
                </div>
                <div className="rounded-2xl glass-subtle px-4 py-3 text-xs text-muted-foreground">
                  <span className="text-foreground/90 font-semibold">Hashing:</span> Web Crypto SHA-256
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <WalletPanel walletAddress={walletAddress} onWalletAddressChange={setWalletAddress} />
              <div className="mt-4 rounded-2xl glass-subtle p-4">
                <p className="text-xs text-muted-foreground">
                  If you don’t want to connect a wallet, paste your address manually—CapsuleForge V1 will still seal.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              {sealed ? (
                <SuccessPanel
                  sealed={sealed}
                  onCreateAnother={() => {
                    setSealed(null);
                    toast({ title: "Ready", description: "Create a new capsule." });
                  }}
                />
              ) : (
                <CapsuleForm
                  walletAddress={walletAddress}
                  createCapsule={createCapsule}
                  onSealed={(res) => setSealed(res)}
                />
              )}
            </div>
          </section>
        </div>
      </main>
    </NeonShell>
  );
}
