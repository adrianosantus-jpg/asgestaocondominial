import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/lib/hooks/use-profile";

export type ExecucaoPreventivaRow = {
  id: string;
  data_execucao: string;
  checklist_resultado: { item: string; ok: boolean }[];
  fotos_antes: string[];
  fotos_depois: string[];
  assinatura_url: string | null;
  observacoes: string | null;
  created_at: string;
  profiles: { nome: string } | null;
};

export function useExecucoesPreventivas(planoId: string | undefined) {
  return useQuery({
    queryKey: ["execucoes_preventivas", planoId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("execucoes_preventivas")
        .select(
          "id, data_execucao, checklist_resultado, fotos_antes, fotos_depois, assinatura_url, observacoes, created_at, profiles(nome)"
        )
        .eq("plano_id", planoId!)
        .order("data_execucao", { ascending: false });

      if (error) throw error;
      return data as unknown as ExecucaoPreventivaRow[];
    },
    enabled: !!planoId,
  });
}

async function dataUrlToFile(dataUrl: string, filename: string) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}

export function useRegistrarExecucao(planoId: string) {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async (input: {
      checklistResultado: { item: string; ok: boolean }[];
      observacoes?: string;
      fotosAntes: File[];
      fotosDepois: File[];
      assinaturaDataUrl: string | null;
    }) => {
      if (!profile) throw new Error("Perfil não carregado");

      const supabase = createClient();
      const execucaoId = crypto.randomUUID();
      const base = `${profile.condominio_id}/${execucaoId}`;

      async function uploadAll(files: File[], prefix: string) {
        const urls: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const ext = files[i].name.split(".").pop();
          const path = `${base}/${prefix}-${i}.${ext}`;
          const { error } = await supabase.storage
            .from("manutencao")
            .upload(path, files[i], { upsert: true });
          if (error) throw error;
          const { data } = await supabase.storage
            .from("manutencao")
            .createSignedUrl(path, 60 * 60 * 24 * 365);
          if (data?.signedUrl) urls.push(data.signedUrl);
        }
        return urls;
      }

      const fotosAntesUrls = await uploadAll(input.fotosAntes, "antes");
      const fotosDepoisUrls = await uploadAll(input.fotosDepois, "depois");

      let assinaturaUrl: string | null = null;
      if (input.assinaturaDataUrl) {
        const file = await dataUrlToFile(input.assinaturaDataUrl, "assinatura.png");
        const path = `${base}/assinatura.png`;
        const { error } = await supabase.storage
          .from("manutencao")
          .upload(path, file, { upsert: true });
        if (error) throw error;
        const { data } = await supabase.storage
          .from("manutencao")
          .createSignedUrl(path, 60 * 60 * 24 * 365);
        assinaturaUrl = data?.signedUrl ?? null;
      }

      const { data, error } = await supabase
        .from("execucoes_preventivas")
        .insert({
          id: execucaoId,
          plano_id: planoId,
          checklist_resultado: input.checklistResultado,
          observacoes: input.observacoes,
          fotos_antes: fotosAntesUrls,
          fotos_depois: fotosDepoisUrls,
          assinatura_url: assinaturaUrl,
        })
        .select("id")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["execucoes_preventivas", planoId],
      });
      queryClient.invalidateQueries({ queryKey: ["planos_preventivos"] });
      queryClient.invalidateQueries({ queryKey: ["agenda_eventos"] });
    },
  });
}
