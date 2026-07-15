import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

/**
 * Assina mudanças em tempo real de uma tabela e invalida as queryKeys
 * relacionadas — assim todos os usuários veem a atualização sem recarregar.
 */
export function useRealtimeInvalidate(
  table: string,
  queryKeys: readonly (readonly unknown[])[]
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();
    // Nome único por montagem: evita colisão de canal quando o efeito roda
    // duas vezes (React Strict Mode em dev) antes da limpeza anterior
    // terminar de remover o canal anterior.
    const channelName = `realtime:${table}:${Math.random().toString(36).slice(2)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          queryKeys.forEach((key) => {
            queryClient.invalidateQueries({ queryKey: key as unknown[] });
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);
}
