import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export type RelatorioManutencaoRow = {
  id: string;
  data_execucao: string;
  observacoes: string | null;
  planos_preventivos: {
    titulo: string;
    equipamento_id: string;
    equipamentos: { nome: string } | null;
  } | null;
  profiles: { nome: string } | null;
};

export function useRelatorioManutencao() {
  return useQuery({
    queryKey: ["relatorio_manutencao"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("execucoes_preventivas")
        .select(
          "id, data_execucao, observacoes, planos_preventivos(titulo, equipamento_id, equipamentos(nome)), profiles(nome)"
        )
        .order("data_execucao", { ascending: false });

      if (error) throw error;
      return data as unknown as RelatorioManutencaoRow[];
    },
  });
}
