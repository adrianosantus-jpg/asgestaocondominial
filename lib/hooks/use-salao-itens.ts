import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { SalaoItemInput } from "@/lib/validations/salao-item";

const SALAO_ITEM_SELECT =
  "id, condominio_id, salao, nome, categoria, quantidade, valor_unitario, valor_total, observacoes, ativo, created_at";

export type SalaoItemRow = {
  id: string;
  condominio_id: string;
  salao: string;
  nome: string;
  categoria: string | null;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  observacoes: string | null;
  ativo: boolean;
  created_at: string;
};

export function useSalaoItens() {
  return useQuery({
    queryKey: ["salao_itens"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("salao_itens")
        .select(SALAO_ITEM_SELECT)
        .eq("ativo", true)
        .order("salao")
        .order("nome");

      if (error) throw error;
      return data as unknown as SalaoItemRow[];
    },
  });
}

export function useCreateSalaoItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SalaoItemInput) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("salao_itens")
        .insert(input)
        .select(SALAO_ITEM_SELECT)
        .single();

      if (error) throw error;
      return data as unknown as SalaoItemRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salao_itens"] });
    },
  });
}

export function useUpdateSalaoItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<SalaoItemInput> }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("salao_itens")
        .update(input)
        .eq("id", id)
        .select(SALAO_ITEM_SELECT)
        .single();

      if (error) throw error;
      return data as unknown as SalaoItemRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salao_itens"] });
    },
  });
}

export function useDeactivateSalaoItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("salao_itens")
        .update({ ativo: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salao_itens"] });
    },
  });
}
