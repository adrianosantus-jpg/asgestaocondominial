"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  osSchema,
  OS_PRIORIDADE_LABELS,
  type OsFormValues,
  type OsInput,
} from "@/lib/validations/os";
import { useCreateOs } from "@/lib/hooks/use-ordens-servico";
import { useEquipamentos } from "@/lib/hooks/use-equipamentos";
import { usePlanosPreventivos } from "@/lib/hooks/use-planos-preventivos";
import { useFornecedores } from "@/lib/hooks/use-fornecedores";
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

const NONE = "__none__";

export function OsForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createOs = useCreateOs();
  const { data: equipamentos } = useEquipamentos();
  const { data: planos } = usePlanosPreventivos();
  const { data: fornecedores } = useFornecedores();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OsFormValues, unknown, OsInput>({
    resolver: zodResolver(osSchema),
    defaultValues: { tipo: "corretiva", titulo: "", prioridade: "media" },
  });

  useEffect(() => {
    if (open) {
      reset({ tipo: "corretiva", titulo: "", prioridade: "media" });
    }
  }, [open, reset]);

  const tipo = watch("tipo");
  const prioridade = watch("prioridade");
  const equipamentoId = watch("equipamento_id");
  const planoId = watch("plano_id");
  const fornecedorId = watch("fornecedor_id");

  const planosDoEquipamento = useMemo(
    () => planos?.filter((p) => p.equipamento_id === equipamentoId) ?? [],
    [planos, equipamentoId]
  );

  async function onSubmit(values: OsInput) {
    try {
      const created = await createOs.mutateAsync(values);
      toast.success(`OS ${created.numero} aberta`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao abrir OS", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Ordem de Serviço</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="os-form">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="tipo">Tipo</FieldLabel>
              <Select
                items={{ corretiva: "Corretiva", preventiva: "Preventiva" }}
                value={tipo}
                onValueChange={(v) => v && setValue("tipo", v as OsInput["tipo"])}
              >
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corretiva">Corretiva</SelectItem>
                  <SelectItem value="preventiva">Preventiva</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="prioridade">Prioridade</FieldLabel>
              <Select
                items={OS_PRIORIDADE_LABELS}
                value={prioridade}
                onValueChange={(v) =>
                  v && setValue("prioridade", v as OsInput["prioridade"])
                }
              >
                <SelectTrigger id="prioridade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(OS_PRIORIDADE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field data-invalid={!!errors.titulo}>
            <FieldLabel htmlFor="titulo">Título</FieldLabel>
            <Input id="titulo" placeholder="Ex: Vazamento na bomba d'água" {...register("titulo")} />
            <FieldError errors={[errors.titulo]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="descricao">Descrição</FieldLabel>
            <Textarea id="descricao" rows={3} {...register("descricao")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="equipamento_id">Equipamento (opcional)</FieldLabel>
            <Select
              items={{
                [NONE]: "Nenhum",
                ...Object.fromEntries((equipamentos ?? []).map((e) => [e.id, e.nome])),
              }}
              value={equipamentoId ?? NONE}
              onValueChange={(v) => {
                setValue("equipamento_id", v === NONE ? null : v);
                setValue("plano_id", null);
              }}
            >
              <SelectTrigger id="equipamento_id">
                <SelectValue placeholder="Nenhum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Nenhum</SelectItem>
                {equipamentos?.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {equipamentoId && planosDoEquipamento.length > 0 && (
            <Field>
              <FieldLabel htmlFor="plano_id">Plano preventivo (opcional)</FieldLabel>
              <Select
                items={{
                  [NONE]: "Nenhum",
                  ...Object.fromEntries(planosDoEquipamento.map((p) => [p.id, p.titulo])),
                }}
                value={planoId ?? NONE}
                onValueChange={(v) => setValue("plano_id", v === NONE ? null : v)}
              >
                <SelectTrigger id="plano_id">
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Nenhum</SelectItem>
                  {planosDoEquipamento.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          <Field>
            <FieldLabel htmlFor="fornecedor_id">Fornecedor (opcional)</FieldLabel>
            <Select
              items={{
                [NONE]: "Nenhum",
                ...Object.fromEntries((fornecedores ?? []).map((f) => [f.id, f.nome])),
              }}
              value={fornecedorId ?? NONE}
              onValueChange={(v) => setValue("fornecedor_id", v === NONE ? null : v)}
            >
              <SelectTrigger id="fornecedor_id">
                <SelectValue placeholder="Nenhum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Nenhum</SelectItem>
                {fornecedores?.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="os-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Abrir OS
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
