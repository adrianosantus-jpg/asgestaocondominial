import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export function useOsDashboard() {
  return useQuery({
    queryKey: ["ordens_servico", "dashboard"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("ordens_servico")
        .select("tipo, status, custo_total, data_abertura");

      if (error) throw error;

      const agora = new Date();
      const abertas = data.filter(
        (os) => !["concluida", "cancelada"].includes(os.status)
      ).length;

      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
      const custosMes = data
        .filter((os) => new Date(os.data_abertura) >= inicioMes)
        .reduce((acc, os) => acc + os.custo_total, 0);

      const meses = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(agora.getFullYear(), agora.getMonth() - (5 - i), 1);
        return { ano: d.getFullYear(), mes: d.getMonth(), label: MESES[d.getMonth()] };
      });

      const custosPorMes = meses.map(({ ano, mes, label }) => ({
        mes: label,
        valor: data
          .filter((os) => {
            const d = new Date(os.data_abertura);
            return d.getFullYear() === ano && d.getMonth() === mes;
          })
          .reduce((acc, os) => acc + os.custo_total, 0),
      }));

      const porTipo = meses.map(({ ano, mes, label }) => {
        const doMes = data.filter((os) => {
          const d = new Date(os.data_abertura);
          return d.getFullYear() === ano && d.getMonth() === mes;
        });
        return {
          mes: label,
          preventiva: doMes.filter((os) => os.tipo === "preventiva").length,
          corretiva: doMes.filter((os) => os.tipo === "corretiva").length,
        };
      });

      return { abertas, custosMes, custosPorMes, porTipo };
    },
  });
}
