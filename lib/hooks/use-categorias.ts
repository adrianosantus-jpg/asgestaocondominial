import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { CategoriaInput } from "@/lib/validations/produto";

export function useCategorias() {
  return useQuery({
    queryKey: ["categorias_produto"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("categorias_produto")
        .select("id, nome")
        .order("nome");

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCategoria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CategoriaInput) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("categorias_produto")
        .insert(input)
        .select("id, nome")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias_produto"] });
    },
  });
}
