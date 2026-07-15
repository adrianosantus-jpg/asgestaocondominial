import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { PlanoPreventivoInput } from "@/lib/validations/manutencao";

const PLANO_SELECT =
  "id, condominio_id, equipamento_id, titulo, periodicidade, checklist, proxima_execucao, ativo, created_at, equipamentos(nome)";

export type PlanoPreventivoRow = {
  id: string;
  condominio_id: string;
  equipamento_id: string;
  titulo: string;
  periodicidade: string;
  checklist: string[];
  proxima_execucao: string;
  ativo: boolean;
  created_at: string;
  equipamentos: { nome: string } | null;
};

export function usePlanosPreventivos() {
  return useQuery({
    queryKey: ["planos_preventivos"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("planos_preventivos")
        .select(PLANO_SELECT)
        .eq("ativo", true)
        .order("proxima_execucao");

      if (error) throw error;
      return data as unknown as PlanoPreventivoRow[];
    },
  });
}

export function useCreatePlanoPreventivo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PlanoPreventivoInput) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("planos_preventivos")
        .insert(input)
        .select(PLANO_SELECT)
        .single();

      if (error) throw error;
      return data as unknown as PlanoPreventivoRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planos_preventivos"] });
      queryClient.invalidateQueries({ queryKey: ["agenda_eventos"] });
    },
  });
}

export function useDeactivatePlanoPreventivo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("planos_preventivos")
        .update({ ativo: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planos_preventivos"] });
    },
  });
}
