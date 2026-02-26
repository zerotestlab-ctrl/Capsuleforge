import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CapsuleInput, type CapsuleResponse } from "@shared/routes";
import { supabase } from "../lib/supabase";
import { v4 as uuidv4 } from "uuid";

// We attempt to use Supabase directly if available, otherwise fallback to standard API
export function useCapsules() {
  return useQuery({
    queryKey: [api.capsules.list.path],
    queryFn: async () => {
      if (supabase) {
        const { data, error } = await supabase.from('capsules').select('*').order('createdAt', { ascending: false });
        if (error) throw new Error(error.message);
        return data as CapsuleResponse[];
      }
      
      const res = await fetch(api.capsules.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch capsules");
      return api.capsules.list.responses[200].parse(await res.json());
    },
  });
}

export function useCapsule(id: string) {
  return useQuery({
    queryKey: [api.capsules.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      
      if (supabase) {
        const { data, error } = await supabase.from('capsules').select('*').eq('id', id).single();
        if (error) {
          if (error.code === 'PGRST116') return null; // Not found
          throw new Error(error.message);
        }
        return data as CapsuleResponse;
      }

      const url = buildUrl(api.capsules.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch capsule");
      return api.capsules.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateCapsule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CapsuleInput) => {
      // Generate ID if not provided by backend automatically
      const capsuleData = {
        ...data,
        id: uuidv4(),
      };

      if (supabase) {
        const { data: inserted, error } = await supabase
          .from('capsules')
          .insert(capsuleData)
          .select()
          .single();
          
        if (error) throw new Error(error.message);
        return inserted as CapsuleResponse;
      }

      // Fallback to API
      const res = await fetch(api.capsules.create.path, {
        method: api.capsules.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(capsuleData),
        credentials: "include",
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: 'Failed to create' }));
        throw new Error(errData.message || "Failed to create capsule");
      }
      return api.capsules.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.capsules.list.path] });
    },
  });
}
