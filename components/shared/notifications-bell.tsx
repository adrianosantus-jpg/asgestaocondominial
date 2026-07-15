"use client";

import Link from "next/link";
import { AlertTriangle, Bell, Clock } from "lucide-react";
import {
  useMarkAllNotificacoesRead,
  useMarkNotificacaoRead,
  useNotificacoes,
} from "@/lib/hooks/use-notificacoes";
import { useAlertasVencimento } from "@/lib/hooks/use-alertas";
import { useRealtimeInvalidate } from "@/lib/hooks/use-realtime-invalidate";
import { AGENDA_TIPO_LABELS } from "@/lib/validations/agenda";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationsBell() {
  const { data: notificacoes } = useNotificacoes();
  const { data: alertas } = useAlertasVencimento();
  const markRead = useMarkNotificacaoRead();
  const markAllRead = useMarkAllNotificacoesRead();

  useRealtimeInvalidate("notificacoes", [["notificacoes"]]);
  useRealtimeInvalidate("agenda_eventos", [["agenda_eventos", "alertas"]]);

  const naoLidas = notificacoes?.filter((n) => !n.lida) ?? [];
  const totalBadge = naoLidas.length + (alertas?.length ?? 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-4" />
            {totalBadge > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-0.5 -top-0.5 h-4 min-w-4 rounded-full px-1 text-[10px]"
              >
                {totalBadge}
              </Badge>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm font-medium">Notificações</span>
          {naoLidas.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground"
              onClick={() => markAllRead.mutate(naoLidas.map((n) => n.id))}
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {!notificacoes?.length && !alertas?.length && (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              Nenhuma notificação por enquanto.
            </p>
          )}

          {alertas?.map((a) => (
            <Link
              key={a.id}
              href="/agenda"
              className="flex items-start gap-2 border-b px-2 py-2 text-sm last:border-b-0 hover:bg-accent"
            >
              {a.status === "vencido" ? (
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
              ) : (
                <Clock className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
              )}
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{a.titulo}</span>
                <span className="text-xs text-muted-foreground">
                  {AGENDA_TIPO_LABELS[a.tipo] ?? a.tipo} ·{" "}
                  {a.status === "vencido" ? "vencido em" : "vence em"}{" "}
                  {new Date(a.data_hora).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </Link>
          ))}

          {notificacoes?.map((n) => (
            <Link
              key={n.id}
              href={n.link ?? "#"}
              onClick={() => !n.lida && markRead.mutate(n.id)}
              className="flex flex-col gap-0.5 border-b px-2 py-2 text-sm last:border-b-0 hover:bg-accent"
            >
              <div className="flex items-center gap-2">
                {!n.lida && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                <span className="font-medium">{n.titulo}</span>
              </div>
              {n.mensagem && (
                <span className="text-xs text-muted-foreground">{n.mensagem}</span>
              )}
              <span className="text-[11px] text-muted-foreground">
                {new Date(n.created_at).toLocaleString("pt-BR")}
              </span>
            </Link>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
