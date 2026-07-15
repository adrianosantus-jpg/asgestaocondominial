"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CalendarClock,
  ClipboardCheck,
  History,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import {
  usePlanosPreventivos,
  useDeactivatePlanoPreventivo,
  type PlanoPreventivoRow,
} from "@/lib/hooks/use-planos-preventivos";
import { useEquipamentos } from "@/lib/hooks/use-equipamentos";
import { PERIODICIDADE_LABELS } from "@/lib/validations/manutencao";
import { PlanoForm } from "@/components/modules/manutencao/plano-form";
import { ExecucaoDialog } from "@/components/modules/manutencao/execucao-dialog";
import { ExecucoesSheet } from "@/components/modules/manutencao/execucoes-sheet";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRealtimeInvalidate } from "@/lib/hooks/use-realtime-invalidate";

function planoStatus(proximaExecucao: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(proximaExecucao);
  if (data < hoje) return "vencida" as const;
  const em7dias = new Date(hoje);
  em7dias.setDate(em7dias.getDate() + 7);
  if (data <= em7dias) return "proxima" as const;
  return "ok" as const;
}

export function ManutencaoPage() {
  const searchParams = useSearchParams();
  const equipamentoFiltro = searchParams.get("equipamento") ?? undefined;

  const { data: planos, isLoading } = usePlanosPreventivos();
  const { data: equipamentos } = useEquipamentos();
  const deactivatePlano = useDeactivatePlanoPreventivo();

  useRealtimeInvalidate("planos_preventivos", [["planos_preventivos"]]);
  useRealtimeInvalidate("execucoes_preventivas", [
    ["planos_preventivos"],
    ["agenda_eventos"],
  ]);

  const [formOpen, setFormOpen] = useState(false);
  const [execPlano, setExecPlano] = useState<PlanoPreventivoRow | null>(null);
  const [historicoPlano, setHistoricoPlano] = useState<PlanoPreventivoRow | null>(null);
  const [filtroEquipamento, setFiltroEquipamento] = useState(equipamentoFiltro ?? "todos");

  const planosFiltrados = useMemo(() => {
    if (!planos) return [];
    if (filtroEquipamento === "todos") return planos;
    return planos.filter((p) => p.equipamento_id === filtroEquipamento);
  }, [planos, filtroEquipamento]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Manutenção Preventiva"
        description="Planos por equipamento, checklist e execuções."
      >
        <Button onClick={() => setFormOpen(true)}>
          <Plus /> Novo Plano
        </Button>
      </PageHeader>

      <Select
        items={{
          todos: "Todos os equipamentos",
          ...Object.fromEntries((equipamentos ?? []).map((e) => [e.id, e.nome])),
        }}
        value={filtroEquipamento}
        onValueChange={(v) => setFiltroEquipamento(v ?? "todos")}
      >
        <SelectTrigger className="max-w-xs">
          <SelectValue placeholder="Filtrar por equipamento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os equipamentos</SelectItem>
          {equipamentos?.map((e) => (
            <SelectItem key={e.id} value={e.id}>
              {e.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : planosFiltrados.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Nenhum plano preventivo cadastrado ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {planosFiltrados.map((plano) => {
            const status = planoStatus(plano.proxima_execucao);
            return (
              <Card key={plano.id}>
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{plano.titulo}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {plano.equipamentos?.nome}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setHistoricoPlano(plano)}>
                          <History /> Histórico
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            if (confirm(`Desativar plano "${plano.titulo}"?`)) {
                              deactivatePlano.mutate(plano.id, {
                                onSuccess: () => toast.success("Plano desativado"),
                                onError: () => toast.error("Erro ao desativar plano"),
                              });
                            }
                          }}
                        >
                          Desativar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline">
                      {PERIODICIDADE_LABELS[plano.periodicidade]}
                    </Badge>
                    {status === "vencida" && (
                      <Badge variant="destructive">Vencida</Badge>
                    )}
                    {status === "proxima" && (
                      <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                        Próxima
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CalendarClock className="size-3.5" />
                    {new Date(plano.proxima_execucao).toLocaleDateString("pt-BR")}
                  </div>

                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => setExecPlano(plano)}
                  >
                    <ClipboardCheck /> Registrar execução
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <PlanoForm
        open={formOpen}
        onOpenChange={setFormOpen}
        equipamentoIdPadrao={equipamentoFiltro}
      />

      {execPlano && (
        <ExecucaoDialog
          open={!!execPlano}
          onOpenChange={(open) => !open && setExecPlano(null)}
          plano={execPlano}
        />
      )}

      {historicoPlano && (
        <ExecucoesSheet
          open={!!historicoPlano}
          onOpenChange={(open) => !open && setHistoricoPlano(null)}
          plano={historicoPlano}
        />
      )}
    </div>
  );
}
