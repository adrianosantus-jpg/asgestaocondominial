"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  agendaEventoSchema,
  AGENDA_TIPO_LABELS,
  MANUAL_AGENDA_TIPOS,
  type AgendaEventoInput,
} from "@/lib/validations/agenda";
import { useCreateAgendaEvento } from "@/lib/hooks/use-agenda-eventos";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

export function AgendaEventoForm({
  open,
  onOpenChange,
  dataPadrao,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataPadrao?: string;
}) {
  const createEvento = useCreateAgendaEvento();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AgendaEventoInput>({
    resolver: zodResolver(agendaEventoSchema),
    defaultValues: { tipo: "reuniao", titulo: "", data_hora: dataPadrao ?? "" },
  });

  useEffect(() => {
    if (open) {
      reset({ tipo: "reuniao", titulo: "", data_hora: dataPadrao ?? "" });
    }
  }, [open, dataPadrao, reset]);

  const tipo = watch("tipo");

  async function onSubmit(values: AgendaEventoInput) {
    try {
      await createEvento.mutateAsync(values);
      toast.success("Evento criado");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao criar evento", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo evento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="evento-form">
          <Field>
            <FieldLabel htmlFor="tipo">Tipo</FieldLabel>
            <Select
              items={Object.fromEntries(
                MANUAL_AGENDA_TIPOS.map((t) => [t, AGENDA_TIPO_LABELS[t]])
              )}
              value={tipo}
              onValueChange={(v) =>
                v && setValue("tipo", v as AgendaEventoInput["tipo"])
              }
            >
              <SelectTrigger id="tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MANUAL_AGENDA_TIPOS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {AGENDA_TIPO_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field data-invalid={!!errors.titulo}>
            <FieldLabel htmlFor="titulo">Título</FieldLabel>
            <Input id="titulo" {...register("titulo")} />
            <FieldError errors={[errors.titulo]} />
          </Field>

          <Field data-invalid={!!errors.data_hora}>
            <FieldLabel htmlFor="data_hora">Data</FieldLabel>
            <Input id="data_hora" type="date" {...register("data_hora")} />
            <FieldError errors={[errors.data_hora]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="descricao">Descrição</FieldLabel>
            <Textarea id="descricao" rows={3} {...register("descricao")} />
          </Field>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="evento-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Criar evento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
