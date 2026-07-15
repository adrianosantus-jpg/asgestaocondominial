"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  movimentacaoSchema,
  type MovimentacaoFormValues,
  type MovimentacaoInput,
} from "@/lib/validations/produto";
import { useCreateMovimentacao } from "@/lib/hooks/use-movimentacoes";
import type { ProdutoRow } from "@/lib/hooks/use-produtos";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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

const TIPO_LABELS: Record<MovimentacaoInput["tipo"], string> = {
  entrada: "Entrada",
  saida: "Saída",
  ajuste: "Ajuste",
  inventario: "Inventário (define a quantidade)",
};

export function MovimentacaoDialog({
  open,
  onOpenChange,
  produto,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto: ProdutoRow;
}) {
  const createMovimentacao = useCreateMovimentacao(produto.id);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MovimentacaoFormValues, unknown, MovimentacaoInput>({
    resolver: zodResolver(movimentacaoSchema),
    defaultValues: { tipo: "entrada", quantidade: 0, motivo: "" },
  });

  useEffect(() => {
    if (open) reset({ tipo: "entrada", quantidade: 0, motivo: "" });
  }, [open, reset]);

  const tipo = watch("tipo");

  async function onSubmit(values: MovimentacaoInput) {
    try {
      await createMovimentacao.mutateAsync(values);
      toast.success("Movimentação registrada");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao registrar movimentação", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Movimentar estoque</DialogTitle>
          <DialogDescription>
            {produto.nome} — estoque atual: {produto.quantidade} {produto.unidade}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          id="movimentacao-form"
        >
          <Field>
            <FieldLabel htmlFor="tipo">Tipo</FieldLabel>
            <Select
              items={TIPO_LABELS}
              value={tipo}
              onValueChange={(v) => setValue("tipo", v as MovimentacaoInput["tipo"])}
            >
              <SelectTrigger id="tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIPO_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field data-invalid={!!errors.quantidade}>
            <FieldLabel htmlFor="quantidade">
              {tipo === "inventario" ? "Quantidade contada" : "Quantidade"}
            </FieldLabel>
            <Input
              id="quantidade"
              type="number"
              step="0.01"
              {...register("quantidade")}
            />
            <FieldError errors={[errors.quantidade]} />
          </Field>

          <Field data-invalid={!!errors.motivo}>
            <FieldLabel htmlFor="motivo">Motivo</FieldLabel>
            <Textarea id="motivo" rows={2} {...register("motivo")} />
            <FieldError errors={[errors.motivo]} />
          </Field>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" form="movimentacao-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
