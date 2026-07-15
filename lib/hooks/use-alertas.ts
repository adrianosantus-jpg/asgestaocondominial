import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export type AlertaRow = {
  id: string;
  tipo: string;
  titulo: string;
  data_hora: string;
  status: "vencido" | "proximo";
};

export function useAlertasVencimento() {
  return useQuery({
    queryKey: ["agenda_eventos", "alertas"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("agenda_eventos")
        .select("id, tipo, titulo, data_hora")
        .eq("concluido", false)
        .order("data_hora");

      if (error) throw error;

      const agora = new Date();
      const em7dias = new Date(agora);
      em7dias.setDate(em7dias.getDate() + 7);

      return data
        .filter((e) => new Date(e.data_hora) <= em7dias)
        .map((e) => ({
          ...e,
          status: new Date(e.data_hora) < agora ? "vencido" : "proximo",
        })) as AlertaRow[];
    },
    refetchInterval: 60 * 1000,
  });
}
