"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  useAgendaEventos,
  useToggleAgendaEvento,
  type AgendaEventoRow,
} from "@/lib/hooks/use-agenda-eventos";
import { AGENDA_TIPO_LABELS } from "@/lib/validations/agenda";
import { AgendaEventoForm } from "@/components/modules/agenda/agenda-evento-form";
import { PageHeader } from "@/components/shared/page-header";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useRealtimeInvalidate } from "@/lib/hooks/use-realtime-invalidate";

const TIPO_TONE: Record<string, string> = {
  preventiva: "border-primary/20 bg-primary/10 text-primary",
  corretiva: "border-destructive/20 bg-destructive/10 text-destructive",
  garantia:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  contrato:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  reuniao: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  assembleia: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  laudo: "border-muted-foreground/20 bg-muted text-muted-foreground",
  vistoria: "border-muted-foreground/20 bg-muted text-muted-foreground",
};

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function AgendaPage() {
  const { data: eventos, isLoading } = useAgendaEventos();
  const toggleEvento = useToggleAgendaEvento();

  useRealtimeInvalidate("agenda_eventos", [["agenda_eventos"]]);

  const [selected, setSelected] = useState<Date>(new Date());
  const [formOpen, setFormOpen] = useState(false);

  const datasComEvento = useMemo(
    () => eventos?.map((e) => new Date(e.data_hora)) ?? [],
    [eventos]
  );

  const eventosDoDia = useMemo(
    () => (eventos ?? []).filter((e) => sameDay(new Date(e.data_hora), selected)),
    [eventos, selected]
  );

  const vencidos = useMemo(() => {
    const agora = new Date();
    return (eventos ?? []).filter((e) => !e.concluido && new Date(e.data_hora) < agora)
      .length;
  }, [eventos]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Agenda"
        description={
          <>
            Preventivas, garantias e eventos do condomínio.
            {vencidos > 0 && (
              <Badge variant="destructive" className="ml-2">
                {vencidos} vencido(s)
              </Badge>
            )}
          </>
        }
      >
        <Button onClick={() => setFormOpen(true)}>
          <Plus /> Novo Evento
        </Button>
      </PageHeader>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[auto_1fr]">
          <Card className="w-fit">
            <CardContent>
              <Calendar
                mode="single"
                selected={selected}
                onSelect={(d) => d && setSelected(d)}
                modifiers={{ hasEvent: datasComEvento }}
                modifiersClassNames={{
                  hasEvent:
                    "after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-primary",
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3">
              <h2 className="font-medium">
                {selected.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </h2>

              {eventosDoDia.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum evento nesse dia.
                </p>
              )}

              {eventosDoDia.map((evento) => (
                <EventoItem key={evento.id} evento={evento} onToggle={toggleEvento.mutate} />
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <AgendaEventoForm
        open={formOpen}
        onOpenChange={setFormOpen}
        dataPadrao={selected.toISOString().slice(0, 10)}
      />
    </div>
  );
}

function EventoItem({
  evento,
  onToggle,
}: {
  evento: AgendaEventoRow;
  onToggle: (v: { id: string; concluido: boolean }) => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <Checkbox
        checked={evento.concluido}
        onCheckedChange={(v) => {
          onToggle({ id: evento.id, concluido: !!v });
          toast.success(v ? "Evento concluído" : "Evento reaberto");
        }}
        className="mt-0.5"
      />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={evento.concluido ? "text-sm line-through text-muted-foreground" : "text-sm font-medium"}>
            {evento.titulo}
          </span>
          <Badge variant="outline" className={TIPO_TONE[evento.tipo]}>
            {AGENDA_TIPO_LABELS[evento.tipo] ?? evento.tipo}
          </Badge>
        </div>
        {evento.descricao && (
          <p className="text-xs text-muted-foreground">{evento.descricao}</p>
        )}
      </div>
    </div>
  );
}
