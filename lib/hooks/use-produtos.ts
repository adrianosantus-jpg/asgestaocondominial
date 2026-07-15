import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { ProdutoInput } from "@/lib/validations/produto";
import { useProfile } from "@/lib/hooks/use-profile";

export const PRODUTO_SELECT =
  "id, condominio_id, codigo, nome, categoria_id, marca, unidade, local, quantidade, estoque_minimo, estoque_maximo, valor_unitario, valor_total, foto_url, codigo_barras, observacoes, ativo, created_at, categorias_produto(nome)";

export type ProdutoRow = {
  id: string;
  condominio_id: string;
  codigo: string;
  nome: string;
  categoria_id: string | null;
  marca: string | null;
  unidade: string;
  local: string | null;
  quantidade: number;
  estoque_minimo: number;
  estoque_maximo: number | null;
  valor_unitario: number;
  valor_total: number;
  foto_url: string | null;
  codigo_barras: string | null;
  observacoes: string | null;
  ativo: boolean;
  created_at: string;
  categorias_produto: { nome: string } | null;
};

export function useProdutos() {
  return useQuery({
    queryKey: ["produtos"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("produtos")
        .select(PRODUTO_SELECT)
        .eq("ativo", true)
        .order("nome");

      if (error) throw error;
      return data as unknown as ProdutoRow[];
    },
  });
}

export function useProduto(id: string | undefined) {
  return useQuery({
    queryKey: ["produtos", id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("produtos")
        .select(PRODUTO_SELECT)
        .eq("id", id!)
        .single();

      if (error) throw error;
      return data as unknown as ProdutoRow;
    },
    enabled: !!id,
  });
}

export function useCreateProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ProdutoInput) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("produtos")
        .insert(input)
        .select(PRODUTO_SELECT)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
    },
  });
}

export function useUpdateProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: Partial<ProdutoInput> & { foto_url?: string | null };
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("produtos")
        .update(input)
        .eq("id", id)
        .select(PRODUTO_SELECT)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
    },
  });
}

export function useDeactivateProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("produtos")
        .update({ ativo: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
    },
  });
}

export function useUploadProdutoFoto() {
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async ({ file, produtoId }: { file: File; produtoId: string }) => {
      if (!profile) throw new Error("Perfil não carregado");

      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${profile.condominio_id}/${produtoId}/foto.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("produtos")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = await supabase.storage
        .from("produtos")
        .createSignedUrl(path, 60 * 60 * 24 * 365);

      return { path, signedUrl: data?.signedUrl ?? null };
    },
  });
}
