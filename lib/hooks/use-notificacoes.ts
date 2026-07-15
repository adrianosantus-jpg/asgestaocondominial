import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useNotificacoes() {
  return useQuery({
    queryKey: ["notificacoes"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("notificacoes")
        .select("id, tipo, titulo, mensagem, link, lida, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    refetchInterval: 60 * 1000,
  });
}

export function useMarkNotificacaoRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("notificacoes")
        .update({ lida: true })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
    },
  });
}

export function useMarkAllNotificacoesRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (ids.length === 0) return;
      const supabase = createClient();
      const { error } = await supabase
        .from("notificacoes")
        .update({ lida: true })
        .in("id", ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
    },
  });
}
