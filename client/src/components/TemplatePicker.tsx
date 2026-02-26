import * as React from "react";
import { Wand2, Bot, ShieldAlert, Radar, Rocket, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CapsuleTemplate = {
  key: string;
  title: string;
  description: string;
  projectName: string;
  xHandle: string;
  capsuleDescription: string;
  transcript: string;
  icon: React.ComponentType<{ className?: string }>;
};

const templates: CapsuleTemplate[] = [
  {
    key: "discord-bot",
    title: "Discord Bot",
    description: "Auto-moderation + onboarding with clean commands.",
    projectName: "VibeSentinel Bot",
    xHandle: "@vibesentinel",
    capsuleDescription: "A lightweight Discord bot for onboarding, moderation, and vibe scoring.",
    transcript:
      "Goal: Build a Discord bot that onboards new members, assigns roles, and enforces rules.\n\nFeatures:\n- /start onboarding flow\n- Link verification\n- Anti-spam rate limits\n- Audit log channel\n- Config via simple JSON\n\nNotes:\nKeep it minimal and ship fast. Prioritize reliability over fancy UI.",
    icon: Bot,
  },
  {
    key: "scam-detector",
    title: "Scam Detector",
    description: "Flags suspicious patterns & explains risks.",
    projectName: "RugProof Scanner",
    xHandle: "@rugproof",
    capsuleDescription: "A scam-signal analyzer for contracts, social posts, and token launches.",
    transcript:
      "Build a scam detector that checks:\n- Contract permissions (mint, pause, blacklist)\n- Liquidity lock status\n- Holder concentration\n- Social account age / activity spikes\n\nOutput a clear risk score with human-readable reasons.\n\nKeep the core logic deterministic & testable.",
    icon: ShieldAlert,
  },
  {
    key: "vibesignal",
    title: "VibeSignal Radar",
    description: "Monitors on-chain + social for early signals.",
    projectName: "VibeSignal Radar",
    xHandle: "@vibesignal",
    capsuleDescription: "A radar that detects emerging trends across Base and X.",
    transcript:
      "VibeSignal is a trend radar.\n\nInputs:\n- Base chain tx volume snapshots\n- Social keyword frequency\n- New deploy counts\n\nOutputs:\n- Alerts when a trend crosses threshold\n- Explainable evidence snippets\n\nMake it cheap to run, cache aggressively, and avoid over-alerting.",
    icon: Radar,
  },
  {
    key: "token-launcher",
    title: "Token Launcher",
    description: "One-click deploy + simple config checklist.",
    projectName: "OneClick Token Foundry",
    xHandle: "@tokencraft",
    capsuleDescription: "A token launcher with guardrails and a transparent checklist.",
    transcript:
      "Build a token launcher that guides users through:\n- Name / symbol / supply\n- Transfer restrictions (optional)\n- Ownership and roles\n- Verification + metadata\n\nAdd guardrails:\n- Warn on extreme supply\n- Warn on blacklist/mint rights\n\nPrefer templates and safe defaults.",
    icon: Rocket,
  },
  {
    key: "nft-minter",
    title: "NFT Minter",
    description: "Mint page + allowlist + metadata pipeline.",
    projectName: "NeonMint Studio",
    xHandle: "@neonmint",
    capsuleDescription: "A minimal NFT minter with metadata & allowlist support.",
    transcript:
      "Build an NFT minter.\n\nRequirements:\n- Simple mint UI\n- Optional allowlist\n- Metadata upload pipeline\n- Reveal mechanism\n\nFocus on smooth UX, tight error messages, and mobile responsiveness.",
    icon: ImagePlus,
  },
];

export function TemplatePicker({
  onApply,
  className,
}: {
  onApply: (t: CapsuleTemplate) => void;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn("rounded-2xl glass-subtle p-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Example templates</p>
          <p className="text-xs text-muted-foreground">
            One click to preload a realistic capsule (great for testing).
          </p>
        </div>
        <Button onClick={() => setOpen((v) => !v)} variant="secondary">
          <Wand2 className="mr-2 h-4 w-4" />
          {open ? "Hide templates" : "Show templates"}
        </Button>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3",
          open ? "block animate-in-fade" : "hidden",
        )}
      >
        {templates.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onApply(t)}
              className={cn(
                "group text-left rounded-2xl border border-white/10 bg-white/5 p-4",
                "transition-all duration-300 ease-out hover:bg-white/7 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
              )}
            >
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/20 via-accent/15 to-primary/10 ring-1 ring-white/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{t.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-foreground/80">
                <span className="text-muted-foreground">Loads:</span>{" "}
                <span className="font-medium">{t.projectName}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
