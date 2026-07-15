import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useManutencaoSummary() {
  return useQuery({
    queryKey: ["agenda_eventos", "summary"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("agenda_eventos")
        .select("data_hora, concluido")
        .eq("tipo", "preventiva")
        .eq("concluido", false);

      if (error) throw error;

      const agora = new Date();
      return data.reduce(
        (acc, e) => {
          acc.emAberto += 1;
          if (new Date(e.data_hora) < agora) acc.vencidas += 1;
          return acc;
        },
        { emAberto: 0, vencidas: 0 }
      );
    },
  });
}
