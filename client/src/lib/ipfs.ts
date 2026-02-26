import { z } from "zod";

const NftStorageResponseSchema = z.object({
  ok: z.boolean(),
  value: z
    .object({
      cid: z.string(),
    })
    .passthrough()
    .optional(),
  error: z
    .object({
      message: z.string().optional(),
    })
    .passthrough()
    .optional(),
});

export async function uploadToNftStorage(opts: {
  file: File;
  apiKey: string;
}): Promise<{ cid: string }> {
  const { file, apiKey } = opts;
  if (!apiKey.trim()) throw new Error("nft.storage API key is required to upload");

  const res = await fetch("https://api.nft.storage/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: file,
  });

  const json = await res.json().catch(() => null);

  const parsed = NftStorageResponseSchema.safeParse(json);
  if (!parsed.success) {
    console.error("[Zod] nft.storage response invalid:", parsed.error.format());
    throw new Error("Invalid nft.storage response");
  }

  if (!res.ok || !parsed.data.ok || !parsed.data.value?.cid) {
    const msg = parsed.data.error?.message || `Upload failed (${res.status})`;
    throw new Error(msg);
  }

  return { cid: parsed.data.value.cid };
}
