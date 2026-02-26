import * as React from "react";
import { useParams, Link } from "wouter";
import { ExternalLink, FileX, Loader2, ShieldCheck, Calendar, Fingerprint } from "lucide-react";

import { NeonShell } from "@/components/NeonShell";
import { BrandHeader } from "@/components/BrandHeader";
import { CopyField } from "@/components/CopyField";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useCapsule } from "@/hooks/use-capsules";
import { useSupabaseCapsule } from "@/hooks/use-supabase-capsules";
import { cn } from "@/lib/utils";

export default function CapsuleView() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";

  // Prefer Supabase for public read; fallback to backend if needed.
  const supabase = useSupabaseCapsule(id);
  const backend = useCapsule(id);

  const data = supabase.data ?? backend.data ?? null;
  const isLoading = supabase.isLoading || backend.isLoading;
  const error = supabase.error || backend.error;

  const verificationUrl = id ? `${window.location.origin}/c/${id}` : "";

  return (
    <NeonShell>
      <BrandHeader
        rightSlot={
          <Button asChild variant="secondary">
            <Link href="/">Create a capsule</Link>
          </Button>
        }
      />

      <main className="relative z-10">
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <section className="animate-in-up">
            <div className="rounded-2xl glass p-6 border-glow">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <h1 className="font-display text-xl sm:text-2xl">Verification</h1>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-muted-foreground">
                      /c/{id || "…"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Public, read-only capsule details. Copy hashes and share the link.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild variant="secondary">
                    <a href={verificationUrl} target="_blank" rel="noreferrer">
                      Open in new tab <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              <Separator className="my-5 bg-white/10" />

              {isLoading ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <p className="text-sm">Loading capsule…</p>
                  </div>
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-start gap-3">
                    <FileX className="mt-0.5 h-5 w-5 text-accent" />
                    <div>
                      <p className="text-sm font-semibold">Couldn’t load capsule</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {String((error as any)?.message || error)}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Button onClick={() => window.location.reload()} variant="secondary">
                          Retry
                        </Button>
                        <Button asChild>
                          <Link href="/">Back</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : !data ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-start gap-3">
                    <FileX className="mt-0.5 h-5 w-5 text-accent" />
                    <div>
                      <p className="text-sm font-semibold">Capsule not found</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Check the ID and try again.
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Button asChild>
                          <Link href="/">Forge a capsule</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl glass-subtle p-5">
                      <p className="text-xs text-muted-foreground">Project</p>
                      <p className="mt-1 font-display text-lg">{data.projectName}</p>
                      <p className={cn("mt-2 text-sm text-foreground/85", !data.description && "text-muted-foreground")}>
                        {data.description || "—"}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                          <Fingerprint className="h-4 w-4 text-primary" />
                          Capsule ID: <span className="font-mono text-foreground/90">{data.id}</span>
                        </span>

                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                          <Calendar className="h-4 w-4 text-accent" />
                          {data.createdAt ? new Date(data.createdAt as any).toLocaleString() : "Timestamp unavailable"}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl glass-subtle p-5">
                      <p className="text-xs text-muted-foreground">Transcript</p>
                      <pre className="mt-2 max-h-[320px] overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-black/30 p-4 text-[12px] leading-relaxed text-foreground/95 ring-1 ring-white/10 font-mono">
                        {data.transcript}
                      </pre>
                      <p className="mt-3 text-[11px] text-muted-foreground">
                        The transcript is stored for verification and hashing. Treat it as public.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                    <CopyField label="Wallet" value={data.walletAddress} monospace />
                    <CopyField label="X handle" value={data.xHandle || "—"} />
                    <CopyField label="SHA-256 (capsule hash)" value={data.hash} monospace className="lg:col-span-2" />
                    <CopyField label="IPFS CID" value={data.ipfsCid || "—"} monospace />
                    <CopyField label="Verification link" value={verificationUrl} className="lg:col-span-2" />
                  </div>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[11px] text-muted-foreground">
                      This page is public. Anyone with the link can verify the capsule.
                    </p>
                    <Button asChild>
                      <Link href="/">Seal your own capsule</Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </NeonShell>
  );
}
