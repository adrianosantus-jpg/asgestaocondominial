import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { FornecedorInput } from "@/lib/validations/fornecedor";
import { useProfile } from "@/lib/hooks/use-profile";

const FORNECEDOR_SELECT =
  "id, condominio_id, nome, telefone, whatsapp, email, especialidade, contrato_url, data_vencimento_contrato, avaliacao, observacoes, ativo, created_at";

export type FornecedorRow = {
  id: string;
  condominio_id: string;
  nome: string;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  especialidade: string | null;
  contrato_url: string | null;
  data_vencimento_contrato: string | null;
  avaliacao: number | null;
  observacoes: string | null;
  ativo: boolean;
  created_at: string;
};

export function useFornecedores() {
  return useQuery({
    queryKey: ["fornecedores"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("fornecedores")
        .select(FORNECEDOR_SELECT)
        .eq("ativo", true)
        .order("nome");

      if (error) throw error;
      return data as unknown as FornecedorRow[];
    },
  });
}

export function useCreateFornecedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: FornecedorInput) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("fornecedores")
        .insert(input)
        .select(FORNECEDOR_SELECT)
        .single();

      if (error) throw error;
      return data as unknown as FornecedorRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      queryClient.invalidateQueries({ queryKey: ["agenda_eventos"] });
    },
  });
}

export function useUpdateFornecedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: Partial<FornecedorInput> & { contrato_url?: string | null };
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("fornecedores")
        .update(input)
        .eq("id", id)
        .select(FORNECEDOR_SELECT)
        .single();

      if (error) throw error;
      return data as unknown as FornecedorRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      queryClient.invalidateQueries({ queryKey: ["agenda_eventos"] });
    },
  });
}

export function useDeactivateFornecedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("fornecedores")
        .update({ ativo: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
    },
  });
}

export function useUploadFornecedorContrato() {
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async ({ file, fornecedorId }: { file: File; fornecedorId: string }) => {
      if (!profile) throw new Error("Perfil não carregado");

      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${profile.condominio_id}/${fornecedorId}/contrato.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("fornecedores")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = await supabase.storage
        .from("fornecedores")
        .createSignedUrl(path, 60 * 60 * 24 * 365);

      return { path, signedUrl: data?.signedUrl ?? null };
    },
  });
}
