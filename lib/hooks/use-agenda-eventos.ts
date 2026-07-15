import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { AgendaEventoInput } from "@/lib/validations/agenda";

export type AgendaEventoRow = {
  id: string;
  tipo: string;
  titulo: string;
  data_hora: string;
  referencia_tipo: string | null;
  referencia_id: string | null;
  descricao: string | null;
  concluido: boolean;
};

export function useAgendaEventos() {
  return useQuery({
    queryKey: ["agenda_eventos"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("agenda_eventos")
        .select(
          "id, tipo, titulo, data_hora, referencia_tipo, referencia_id, descricao, concluido"
        )
        .order("data_hora");

      if (error) throw error;
      return data as AgendaEventoRow[];
    },
  });
}

export function useCreateAgendaEvento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AgendaEventoInput) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("agenda_eventos")
        .insert({
          tipo: input.tipo,
          titulo: input.titulo,
          data_hora: new Date(input.data_hora).toISOString(),
          descricao: input.descricao,
        })
        .select("id")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agenda_eventos"] });
    },
  });
}

export function useToggleAgendaEvento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, concluido }: { id: string; concluido: boolean }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("agenda_eventos")
        .update({ concluido })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agenda_eventos"] });
    },
  });
}
