import { z } from "zod";

export const AddressSchema = z
  .string()
  .trim()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Enter a valid 0x wallet address");

export function formatAddress(addr?: string | null) {
  if (!addr) return "";
  const a = addr.trim();
  if (a.length < 10) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
