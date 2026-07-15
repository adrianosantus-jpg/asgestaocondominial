"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  planoPreventivoSchema,
  PERIODICIDADE_LABELS,
  type PlanoPreventivoFormValues,
  type PlanoPreventivoInput,
} from "@/lib/validations/manutencao";
import { useCreatePlanoPreventivo } from "@/lib/hooks/use-planos-preventivos";
import { useEquipamentos } from "@/lib/hooks/use-equipamentos";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

export function PlanoForm({
  open,
  onOpenChange,
  equipamentoIdPadrao,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipamentoIdPadrao?: string;
}) {
  const { data: equipamentos } = useEquipamentos();
  const createPlano = useCreatePlanoPreventivo();
  const [checklistInput, setChecklistInput] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PlanoPreventivoFormValues, unknown, PlanoPreventivoInput>({
    resolver: zodResolver(planoPreventivoSchema),
    defaultValues: {
      equipamento_id: equipamentoIdPadrao ?? "",
      titulo: "",
      periodicidade: "mensal",
      checklist: [],
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        equipamento_id: equipamentoIdPadrao ?? "",
        titulo: "",
        periodicidade: "mensal",
        checklist: [],
      });
      setChecklistInput("");
    }
  }, [open, equipamentoIdPadrao, reset]);

  const equipamentoId = watch("equipamento_id");
  const periodicidade = watch("periodicidade");
  const checklist = watch("checklist") ?? [];

  function addChecklistItem() {
    if (!checklistInput.trim()) return;
    setValue("checklist", [...checklist, checklistInput.trim()]);
    setChecklistInput("");
  }

  async function onSubmit(values: PlanoPreventivoInput) {
    try {
      await createPlano.mutateAsync(values);
      toast.success("Plano preventivo criado");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao criar plano", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo plano preventivo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="plano-form">
          <Field data-invalid={!!errors.equipamento_id}>
            <FieldLabel htmlFor="equipamento_id">Equipamento</FieldLabel>
            <Select
              items={Object.fromEntries(
                (equipamentos ?? []).map((e) => [e.id, e.nome])
              )}
              value={equipamentoId || undefined}
              onValueChange={(v) => setValue("equipamento_id", v ?? "")}
            >
              <SelectTrigger id="equipamento_id">
                <SelectValue placeholder="Selecione o equipamento" />
              </SelectTrigger>
              <SelectContent>
                {equipamentos?.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[errors.equipamento_id]} />
          </Field>

          <Field data-invalid={!!errors.titulo}>
            <FieldLabel htmlFor="titulo">Título do plano</FieldLabel>
            <Input
              id="titulo"
              placeholder="Ex: Lubrificação mensal"
              {...register("titulo")}
            />
            <FieldError errors={[errors.titulo]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="periodicidade">Periodicidade</FieldLabel>
            <Select
              items={PERIODICIDADE_LABELS}
              value={periodicidade}
              onValueChange={(v) =>
                v && setValue("periodicidade", v as PlanoPreventivoInput["periodicidade"])
              }
            >
              <SelectTrigger id="periodicidade">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PERIODICIDADE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Checklist</FieldLabel>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Verificar nível de óleo"
                value={checklistInput}
                onChange={(e) => setChecklistInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addChecklistItem();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addChecklistItem}>
                <Plus />
              </Button>
            </div>
            {checklist.length > 0 && (
              <ul className="mt-2 space-y-1">
                {checklist.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-md border px-2 py-1 text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() =>
                        setValue(
                          "checklist",
                          checklist.filter((_, idx) => idx !== i)
                        )
                      }
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Field>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="plano-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Criar plano
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
