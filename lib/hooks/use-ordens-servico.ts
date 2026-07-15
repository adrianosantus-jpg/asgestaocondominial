import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { OsInput, OsStatus } from "@/lib/validations/os";
import { useProfile } from "@/lib/hooks/use-profile";

const OS_SELECT =
  "id, condominio_id, numero, equipamento_id, plano_id, fornecedor_id, tipo, titulo, descricao, status, prioridade, responsavel_id, data_abertura, data_conclusao, tempo_gasto_minutos, custo_mao_obra, custo_materiais, custo_total, created_at, equipamentos(nome), fornecedores(nome), profiles!ordens_servico_responsavel_id_fkey(nome)";

export type OsRow = {
  id: string;
  condominio_id: string;
  numero: string;
  equipamento_id: string | null;
  plano_id: string | null;
  fornecedor_id: string | null;
  tipo: "preventiva" | "corretiva";
  titulo: string;
  descricao: string | null;
  status: string;
  prioridade: string;
  responsavel_id: string | null;
  data_abertura: string;
  data_conclusao: string | null;
  tempo_gasto_minutos: number | null;
  custo_mao_obra: number;
  custo_materiais: number;
  custo_total: number;
  created_at: string;
  equipamentos: { nome: string } | null;
  fornecedores: { nome: string } | null;
  profiles: { nome: string } | null;
};

export function useOrdensServico() {
  return useQuery({
    queryKey: ["ordens_servico"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("ordens_servico")
        .select(OS_SELECT)
        .order("data_abertura", { ascending: false });

      if (error) throw error;
      return data as unknown as OsRow[];
    },
  });
}

export function useCreateOs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: OsInput) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("ordens_servico")
        .insert(input)
        .select(OS_SELECT)
        .single();

      if (error) throw error;
      return data as unknown as OsRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordens_servico"] });
      queryClient.invalidateQueries({ queryKey: ["agenda_eventos"] });
    },
  });
}

export function useUpdateOs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: OsInput }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("ordens_servico")
        .update(input)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordens_servico"] });
      queryClient.invalidateQueries({ queryKey: ["agenda_eventos"] });
    },
  });
}

export function useUpdateOsStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OsStatus }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("ordens_servico")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordens_servico"] });
      queryClient.invalidateQueries({ queryKey: ["agenda_eventos"] });
    },
  });
}

export function useUpdateOsConclusao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      tempo_gasto_minutos,
      custo_mao_obra,
    }: {
      id: string;
      tempo_gasto_minutos?: number;
      custo_mao_obra: number;
    }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("ordens_servico")
        .update({ tempo_gasto_minutos, custo_mao_obra, status: "concluida" })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordens_servico"] });
      queryClient.invalidateQueries({ queryKey: ["agenda_eventos"] });
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
    },
  });
}

// ---------------------------------------------------------
// Materiais
// ---------------------------------------------------------
export type OsMaterialRow = {
  id: string;
  quantidade: number;
  custo_unitario: number;
  custo: number;
  created_at: string;
  produtos: { nome: string; unidade: string } | null;
};

export function useOsMateriais(osId: string | undefined) {
  return useQuery({
    queryKey: ["os_materiais", osId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("os_materiais")
        .select("id, quantidade, custo_unitario, custo, created_at, produtos(nome, unidade)")
        .eq("os_id", osId!)
        .order("created_at");

      if (error) throw error;
      return data as unknown as OsMaterialRow[];
    },
    enabled: !!osId,
  });
}

export function useAddOsMaterial(osId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      produto_id,
      quantidade,
    }: {
      produto_id: string;
      quantidade: number;
    }) => {
      const supabase = createClient();

      const { data: produto, error: produtoError } = await supabase
        .from("produtos")
        .select("valor_unitario")
        .eq("id", produto_id)
        .single();

      if (produtoError) throw produtoError;

      const { error } = await supabase.from("os_materiais").insert({
        os_id: osId,
        produto_id,
        quantidade,
        custo_unitario: produto.valor_unitario,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["os_materiais", osId] });
      queryClient.invalidateQueries({ queryKey: ["ordens_servico"] });
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
    },
  });
}

// ---------------------------------------------------------
// Mídias
// ---------------------------------------------------------
export type OsMidiaRow = {
  id: string;
  tipo: "foto" | "video" | "pdf";
  url: string;
  created_at: string;
};

export function useOsMidias(osId: string | undefined) {
  return useQuery({
    queryKey: ["os_midias", osId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("os_midias")
        .select("id, tipo, url, created_at")
        .eq("os_id", osId!)
        .order("created_at");

      if (error) throw error;
      return data as OsMidiaRow[];
    },
    enabled: !!osId,
  });
}

export function useUploadOsMidia(osId: string) {
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      tipo,
    }: {
      file: File;
      tipo: "foto" | "video" | "pdf";
    }) => {
      if (!profile) throw new Error("Perfil não carregado");

      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${profile.condominio_id}/${osId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("os")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: signed } = await supabase.storage
        .from("os")
        .createSignedUrl(path, 60 * 60 * 24 * 365);

      if (!signed?.signedUrl) throw new Error("Falha ao gerar URL do arquivo");

      const { error } = await supabase.from("os_midias").insert({
        os_id: osId,
        tipo,
        url: signed.signedUrl,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["os_midias", osId] });
    },
  });
}
