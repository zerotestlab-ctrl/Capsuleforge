import * as React from "react";
import { Link } from "wouter";
import { ExternalLink, ShieldCheck, Sparkles, FileBadge2 } from "lucide-react";
import { CopyField } from "@/components/CopyField";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SealResult } from "@/components/CapsuleForm";

export function SuccessPanel({
  sealed,
  onCreateAnother,
}: {
  sealed: SealResult;
  onCreateAnother: () => void;
}) {
  const verificationUrl = `${window.location.origin}/c/${sealed.id}`;
  const vibestarterText = [
    `CapsuleForge Origin Capsule sealed.`,
    `Project: ${sealed.projectName}`,
    `Wallet: ${sealed.walletAddress}`,
    `Capsule ID: ${sealed.id}`,
    sealed.ipfsCid ? `IPFS CID: ${sealed.ipfsCid}` : null,
    `SHA-256: ${sealed.hash}`,
    `Verify: ${verificationUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="mt-6 rounded-2xl glass p-5 sm:p-6 border-glow animate-in-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-primary/25 via-accent/20 to-primary/10 ring-1 ring-white/10 neon-ring">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-display text-lg sm:text-xl leading-tight">
                Capsule sealed
              </p>
              <p className="text-xs text-muted-foreground">
                Your capsule is now shareable and verifiable.
              </p>
            </div>
            <span className="ml-auto sm:ml-0 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              V1 Stable
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onCreateAnother} variant="secondary">
            Create another
          </Button>
          <Button asChild>
            <Link href={`/c/${sealed.id}`}>
              View verification <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <CopyField label="Capsule ID" value={sealed.id} monospace />
        <CopyField label="Wallet" value={sealed.walletAddress} monospace />
        <CopyField label="SHA-256 (capsule hash)" value={sealed.hash} monospace className="lg:col-span-2" />
        <CopyField label="Transcript SHA-256" value={sealed.transcriptHash} monospace />
        <CopyField label="Payload SHA-256" value={sealed.payloadHash} monospace />
        <CopyField label="IPFS CID" value={sealed.ipfsCid || "—"} monospace className={cn(!sealed.ipfsCid && "opacity-80")} />
        <CopyField label="Verification link" value={verificationUrl} className="lg:col-span-2" />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2">
          <FileBadge2 className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Vibestarter paste text</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Copy-paste this into Vibestarter to prove origin + link verification.
        </p>

        <pre className="mt-3 whitespace-pre-wrap break-words rounded-2xl bg-black/30 p-4 text-[12px] leading-relaxed text-foreground/95 ring-1 ring-white/10 font-mono">
          {vibestarterText}
        </pre>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            onClick={async () => {
              await navigator.clipboard.writeText(vibestarterText);
            }}
            variant="secondary"
          >
            Copy Vibestarter text
          </Button>
          <Button asChild variant="secondary">
            <a href={verificationUrl} target="_blank" rel="noreferrer">
              Open verification <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground">
        Tip: Share the verification link. It’s public and read-only.
      </p>
    </div>
  );
}
