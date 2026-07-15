import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useEstoqueSummary() {
  return useQuery({
    queryKey: ["produtos", "summary"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("produtos")
        .select("quantidade, estoque_minimo, valor_total")
        .eq("ativo", true);

      if (error) throw error;

      return data.reduce(
        (acc, p) => {
          acc.valorTotal += p.valor_total;
          if (p.quantidade <= 0) acc.emFalta += 1;
          else if (p.quantidade <= p.estoque_minimo) acc.estoqueBaixo += 1;
          return acc;
        },
        { valorTotal: 0, emFalta: 0, estoqueBaixo: 0 }
      );
    },
  });
}
