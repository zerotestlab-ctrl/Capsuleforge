import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type CapsuleInput } from "@shared/routes";
import { getSupabaseClient } from "@/hooks/use-supabase";
import { z } from "zod";

const CapsuleRowSchema = z.object({
  id: z.string(),
  projectName: z.string(),
  xHandle: z.string().nullable().optional(),
  description: z.string(),
  transcript: z.string(),
  walletAddress: z.string(),
  ipfsCid: z.string().nullable().optional(),
  hash: z.string(),
  createdAt: z.coerce.date().optional(),
});

export type CapsuleRow = z.infer<typeof CapsuleRowSchema>;

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useSupabaseCapsules() {
  return useQuery({
    queryKey: ["supabase", "capsules"],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("capsules")
        .select("*")
        .order("createdAt", { ascending: false })
        .limit(50);

      if (error) throw new Error(error.message);
      return parseWithLogging(z.array(CapsuleRowSchema), data, "supabase.capsules.list");
    },
  });
}

export function useSupabaseCapsule(id: string) {
  return useQuery({
    queryKey: ["supabase", "capsules", id],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from("capsules").select("*").eq("id", id).maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return null;
      return parseWithLogging(CapsuleRowSchema, data, "supabase.capsules.get");
    },
    enabled: !!id,
  });
}

export function useSupabaseCreateCapsule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CapsuleInput) => {
      const validated = api.capsules.create.input.parse(input);
      const supabase = getSupabaseClient();

      const { data, error } = await supabase.from("capsules").insert(validated).select("*").single();
      if (error) throw new Error(error.message);

      // Validate minimal shape for UI
      return parseWithLogging(CapsuleRowSchema, data, "supabase.capsules.create");
    },
    onSuccess: (_created) => {
      queryClient.invalidateQueries({ queryKey: ["supabase", "capsules"] });
    },
  });
}
