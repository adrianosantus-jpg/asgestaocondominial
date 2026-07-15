import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/lib/hooks/use-profile";

const SALAO_SELECT = "id, condominio_id, nome, foto_url, created_at";

export type SalaoRow = {
  id: string;
  condominio_id: string;
  nome: string;
  foto_url: string | null;
  created_at: string;
};

export function useSaloes() {
  return useQuery({
    queryKey: ["saloes"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("saloes").select(SALAO_SELECT).order("nome");

      if (error) throw error;
      return data as unknown as SalaoRow[];
    },
  });
}

export function useUploadSalaoFoto() {
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, salao }: { file: File; salao: SalaoRow }) => {
      if (!profile) throw new Error("Perfil não carregado");

      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${profile.condominio_id}/${salao.id}/foto.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("saloes")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: signed } = await supabase.storage
        .from("saloes")
        .createSignedUrl(path, 60 * 60 * 24 * 365);

      if (!signed?.signedUrl) throw new Error("Falha ao gerar URL da foto");

      const { error } = await supabase
        .from("saloes")
        .update({ foto_url: signed.signedUrl })
        .eq("id", salao.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saloes"] });
    },
  });
}
