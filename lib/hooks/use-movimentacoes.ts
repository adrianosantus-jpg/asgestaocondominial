import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { MovimentacaoInput } from "@/lib/validations/produto";

export function useMovimentacoes(produtoId: string | undefined) {
  return useQuery({
    queryKey: ["movimentacoes_estoque", produtoId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("movimentacoes_estoque")
        .select(
          "id, tipo, quantidade, motivo, created_at, profiles(nome)"
        )
        .eq("produto_id", produtoId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!produtoId,
  });
}

export function useCreateMovimentacao(produtoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MovimentacaoInput) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("movimentacoes_estoque")
        .insert({ ...input, produto_id: produtoId })
        .select("id")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["movimentacoes_estoque", produtoId],
      });
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
    },
  });
}
