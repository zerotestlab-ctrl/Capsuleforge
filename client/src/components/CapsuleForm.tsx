import * as React from "react";
import { z } from "zod";
import { nanoid } from "nanoid";
import { ShieldCheck, UploadCloud, FileUp, Loader2, Sparkles, AlertTriangle } from "lucide-react";

import { api, type CapsuleInput } from "@shared/routes";
import { sha256Hex } from "@/lib/crypto";
import { uploadToNftStorage } from "@/lib/ipfs";
import { AddressSchema } from "@/lib/wallet";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { TemplatePicker, type CapsuleTemplate } from "@/components/TemplatePicker";

const FormSchema = z.object({
  projectName: z.string().min(2, "Project name is required").max(120),
  xHandle: z
    .string()
    .trim()
    .max(80)
    .optional()
    .or(z.literal("")),
  description: z.string().min(10, "Description is required").max(500),
  transcript: z.string().min(30, "Transcript should be at least 30 characters").max(20000),
  walletAddress: AddressSchema,
  nftStorageApiKey: z.string().optional(),
});

export type CapsuleDraft = z.infer<typeof FormSchema>;

export type SealResult = {
  id: string;
  walletAddress: string;
  hash: string;
  ipfsCid?: string | null;
  payloadHash: string;
  transcriptHash: string;
  createdAtIso: string;
  projectName: string;
  xHandle?: string;
  description: string;
};

export function CapsuleForm({
  walletAddress,
  onSealed,
  createCapsule,
}: {
  walletAddress: string;
  onSealed: (res: SealResult) => void;
  createCapsule: (input: CapsuleInput) => Promise<{ id: string; ipfsCid?: string | null; hash: string }>;
}) {
  const { toast } = useToast();

  const [draft, setDraft] = React.useState<CapsuleDraft>({
    projectName: "",
    xHandle: "",
    description: "",
    transcript: "",
    walletAddress: walletAddress || "",
    nftStorageApiKey: "",
  });

  const [file, setFile] = React.useState<File | null>(null);
  const [isSealing, setIsSealing] = React.useState(false);

  React.useEffect(() => {
    setDraft((d) => ({ ...d, walletAddress: walletAddress || d.walletAddress }));
  }, [walletAddress]);

  const validation = React.useMemo(() => FormSchema.safeParse(draft), [draft]);
  const canSeal = validation.success && !isSealing;

  function applyTemplate(t: CapsuleTemplate) {
    setDraft((d) => ({
      ...d,
      projectName: t.projectName,
      xHandle: t.xHandle,
      description: t.capsuleDescription,
      transcript: t.transcript,
    }));
    toast({ title: "Template applied", description: `Loaded “${t.title}”.` });
  }

  async function onSeal() {
    setIsSealing(true);
    try {
      const parsed = FormSchema.parse(draft);

      // Hash transcript and payload deterministically
      const transcriptHash = await sha256Hex(parsed.transcript.trim());
      const payload = {
        projectName: parsed.projectName.trim(),
        xHandle: parsed.xHandle?.trim() || "",
        description: parsed.description.trim(),
        transcript: parsed.transcript.trim(),
        walletAddress: parsed.walletAddress.trim(),
        transcriptHash,
        createdAtIso: new Date().toISOString(),
        version: "capsuleforge-v1",
      };
      const payloadHash = await sha256Hex(JSON.stringify(payload));

      let ipfsCid: string | null = null;
      if (file) {
        if (!parsed.nftStorageApiKey?.trim()) {
          throw new Error("Add nft.storage API key to upload a file (or remove the file).");
        }
        toast({ title: "Uploading to IPFS…", description: "Sending file to nft.storage" });
        const up = await uploadToNftStorage({ file, apiKey: parsed.nftStorageApiKey });
        ipfsCid = up.cid;
      }

      const id = `cap_${nanoid(14)}`;

      const input: CapsuleInput = api.capsules.create.input.parse({
        id,
        projectName: payload.projectName,
        xHandle: payload.xHandle || null,
        description: payload.description,
        transcript: payload.transcript,
        walletAddress: payload.walletAddress,
        ipfsCid: ipfsCid || null,
        hash: payloadHash,
      });

      const created = await createCapsule(input);

      toast({ title: "Capsule sealed", description: "Your capsule has been committed." });

      onSealed({
        id: created.id,
        walletAddress: payload.walletAddress,
        hash: created.hash,
        ipfsCid: created.ipfsCid ?? ipfsCid,
        payloadHash,
        transcriptHash,
        createdAtIso: payload.createdAtIso,
        projectName: payload.projectName,
        xHandle: payload.xHandle,
        description: payload.description,
      });
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Seal failed",
        description: e?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSealing(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl glass p-5 sm:p-6 border-glow animate-in-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">Create Origin Capsule</p>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              SHA-256 client-side
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            This form is intentionally lightweight. Every field contributes to the sealed hash.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => {
              setDraft({
                projectName: "",
                xHandle: "",
                description: "",
                transcript: "",
                walletAddress: walletAddress || "",
                nftStorageApiKey: draft.nftStorageApiKey || "",
              });
              setFile(null);
            }}
            variant="secondary"
          >
            Reset
          </Button>
        </div>
      </div>

      <Separator className="my-5 bg-white/10" />

      <TemplatePicker onApply={applyTemplate} />

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="projectName">Project Name</Label>
          <Input
            id="projectName"
            value={draft.projectName}
            onChange={(e) => setDraft((d) => ({ ...d, projectName: e.target.value }))}
            placeholder="e.g. NeonMint Studio"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="xHandle">X handle (optional)</Label>
          <Input
            id="xHandle"
            value={draft.xHandle}
            onChange={(e) => setDraft((d) => ({ ...d, xHandle: e.target.value }))}
            placeholder="@yourhandle"
          />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            placeholder="What is this build? Why does it matter?"
          />
          <p className="text-[11px] text-muted-foreground">
            Keep it crisp. This will appear on the verification page.
          </p>
        </div>

        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="transcript">Build transcript</Label>
          <Textarea
            id="transcript"
            value={draft.transcript}
            onChange={(e) => setDraft((d) => ({ ...d, transcript: e.target.value }))}
            placeholder="Paste your vibecoded build transcript here…"
            className="min-h-[220px] resize-y"
          />
          <p className="text-[11px] text-muted-foreground">
            Tip: include key prompts, constraints, and final output summary.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="walletAddress">Wallet address</Label>
          <Input
            id="walletAddress"
            value={draft.walletAddress}
            onChange={(e) => setDraft((d) => ({ ...d, walletAddress: e.target.value }))}
            placeholder="0x…"
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nftStorageApiKey">nft.storage API key (optional)</Label>
          <Input
            id="nftStorageApiKey"
            value={draft.nftStorageApiKey}
            onChange={(e) => setDraft((d) => ({ ...d, nftStorageApiKey: e.target.value }))}
            placeholder="Paste API key to enable IPFS file upload"
            type="password"
          />
          <p className="text-[11px] text-muted-foreground">
            Only required if you attach a file.
          </p>
        </div>

        <div className="sm:col-span-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <UploadCloud className="h-4 w-4 text-primary" />
                  Optional file upload
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Attach a build artifact (PDF, zip, screenshot). Stored on IPFS via nft.storage.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  id="fileInput"
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <Button
                  onClick={() => document.getElementById("fileInput")?.click()}
                  variant="secondary"
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  Choose file
                </Button>
                <Button
                  onClick={() => setFile(null)}
                  variant="secondary"
                  disabled={!file}
                >
                  Remove
                </Button>
              </div>
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              {file ? (
                <span className="text-foreground/90">
                  Selected: <span className="font-medium">{file.name}</span> ({Math.round(file.size / 1024)} KB)
                </span>
              ) : (
                "No file selected."
              )}
            </div>
          </div>
        </div>
      </div>

      {!validation.success && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-accent" />
            <div>
              <p className="text-sm font-semibold">Fix required fields</p>
              <ul className="mt-1 list-disc pl-5 text-xs text-muted-foreground">
                {validation.error.issues.slice(0, 4).map((i, idx) => (
                  <li key={idx}>
                    {i.path.join(".")}: {i.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-muted-foreground">
          By sealing, you commit the hash of these fields to your capsule record.
        </p>

        <Button
          onClick={onSeal}
          disabled={!canSeal}
          className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/15 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 ease-out neon-ring animate-pulse-soft"
        >
          {isSealing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sealing…
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Seal Capsule
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
