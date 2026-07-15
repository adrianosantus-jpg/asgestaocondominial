import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { EquipamentoInput } from "@/lib/validations/equipamento";
import { useProfile } from "@/lib/hooks/use-profile";

const EQUIPAMENTO_SELECT =
  "id, condominio_id, nome, categoria, foto_url, manual_pdf_url, empresa_responsavel, garantia_fim, data_instalacao, numero_patrimonio, localizacao, fabricante, modelo, numero_serie, observacoes, ativo, created_at";

export type EquipamentoRow = {
  id: string;
  condominio_id: string;
  nome: string;
  categoria: string;
  foto_url: string | null;
  manual_pdf_url: string | null;
  empresa_responsavel: string | null;
  garantia_fim: string | null;
  data_instalacao: string | null;
  numero_patrimonio: string | null;
  localizacao: string | null;
  fabricante: string | null;
  modelo: string | null;
  numero_serie: string | null;
  observacoes: string | null;
  ativo: boolean;
  created_at: string;
};

export function useEquipamentos() {
  return useQuery({
    queryKey: ["equipamentos"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("equipamentos")
        .select(EQUIPAMENTO_SELECT)
        .eq("ativo", true)
        .order("nome");

      if (error) throw error;
      return data as unknown as EquipamentoRow[];
    },
  });
}

export function useEquipamento(id: string | undefined) {
  return useQuery({
    queryKey: ["equipamentos", id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("equipamentos")
        .select(EQUIPAMENTO_SELECT)
        .eq("id", id!)
        .single();

      if (error) throw error;
      return data as unknown as EquipamentoRow;
    },
    enabled: !!id,
  });
}

export function useCreateEquipamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: EquipamentoInput) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("equipamentos")
        .insert(input)
        .select(EQUIPAMENTO_SELECT)
        .single();

      if (error) throw error;
      return data as unknown as EquipamentoRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipamentos"] });
      queryClient.invalidateQueries({ queryKey: ["agenda_eventos"] });
    },
  });
}

export function useUpdateEquipamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: Partial<EquipamentoInput> & {
        foto_url?: string | null;
        manual_pdf_url?: string | null;
      };
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("equipamentos")
        .update(input)
        .eq("id", id)
        .select(EQUIPAMENTO_SELECT)
        .single();

      if (error) throw error;
      return data as unknown as EquipamentoRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipamentos"] });
      queryClient.invalidateQueries({ queryKey: ["agenda_eventos"] });
    },
  });
}

export function useDeactivateEquipamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("equipamentos")
        .update({ ativo: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipamentos"] });
    },
  });
}

export function useUploadEquipamentoArquivo() {
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async ({
      file,
      equipamentoId,
      tipo,
    }: {
      file: File;
      equipamentoId: string;
      tipo: "foto" | "manual";
    }) => {
      if (!profile) throw new Error("Perfil não carregado");

      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${profile.condominio_id}/${equipamentoId}/${tipo}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("equipamentos")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = await supabase.storage
        .from("equipamentos")
        .createSignedUrl(path, 60 * 60 * 24 * 365);

      return { path, signedUrl: data?.signedUrl ?? null };
    },
  });
}
