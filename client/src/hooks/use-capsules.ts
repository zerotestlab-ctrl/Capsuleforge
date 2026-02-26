import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CapsuleInput } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useCapsules() {
  return useQuery({
    queryKey: [api.capsules.list.path],
    queryFn: async () => {
      const res = await fetch(api.capsules.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch capsules");
      const json = await res.json();
      return parseWithLogging(api.capsules.list.responses[200], json, "capsules.list");
    },
  });
}

export function useCapsule(id: string) {
  return useQuery({
    queryKey: [api.capsules.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.capsules.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch capsule");
      const json = await res.json();
      return parseWithLogging(api.capsules.get.responses[200], json, "capsules.get");
    },
    enabled: !!id,
  });
}

export function useCreateCapsule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CapsuleInput) => {
      const validated = api.capsules.create.input.parse(data);
      const res = await fetch(api.capsules.create.path, {
        method: api.capsules.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const errJson = await res.json();
          const parsed = parseWithLogging(api.capsules.create.responses[400], errJson, "capsules.create.400");
          throw new Error(parsed.message);
        }
        throw new Error("Failed to create capsule");
      }

      const json = await res.json();
      return parseWithLogging(api.capsules.create.responses[201], json, "capsules.create.201");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.capsules.list.path] });
    },
  });
}
