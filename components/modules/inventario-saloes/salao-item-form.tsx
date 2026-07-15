"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  salaoItemSchema,
  SALOES,
  SALAO_ITEM_CATEGORIAS,
  type SalaoItemFormValues,
  type SalaoItemInput,
} from "@/lib/validations/salao-item";
import {
  useCreateSalaoItem,
  useUpdateSalaoItem,
  type SalaoItemRow,
} from "@/lib/hooks/use-salao-itens";
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

export function SalaoItemForm({
  open,
  onOpenChange,
  item,
  defaultSalao,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: SalaoItemRow;
  defaultSalao?: string;
}) {
  const isEdit = !!item;
  const createItem = useCreateSalaoItem();
  const updateItem = useUpdateSalaoItem();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SalaoItemFormValues, unknown, SalaoItemInput>({
    resolver: zodResolver(salaoItemSchema),
    defaultValues: { nome: "", salao: "", quantidade: 1, valor_unitario: 0 },
  });

  useEffect(() => {
    if (open) {
      reset(
        item
          ? {
              salao: item.salao,
              nome: item.nome,
              categoria: item.categoria ?? "",
              quantidade: item.quantidade,
              valor_unitario: item.valor_unitario,
              observacoes: item.observacoes ?? "",
            }
          : { nome: "", salao: defaultSalao ?? "", quantidade: 1, valor_unitario: 0 }
      );
    }
  }, [open, item, defaultSalao, reset]);

  async function onSubmit(values: SalaoItemInput) {
    try {
      if (isEdit && item) {
        await updateItem.mutateAsync({ id: item.id, input: values });
        toast.success("Item atualizado");
      } else {
        await createItem.mutateAsync(values);
        toast.success("Item cadastrado");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(isEdit ? "Erro ao atualizar item" : "Erro ao cadastrar item", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  const salao = watch("salao");
  const categoria = watch("categoria");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar item" : "Novo item"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="salao-item-form">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.salao}>
              <FieldLabel htmlFor="salao">Salão</FieldLabel>
              <Select
                items={Object.fromEntries(SALOES.map((s) => [s, s]))}
                value={salao || undefined}
                onValueChange={(v) => setValue("salao", v ?? "")}
              >
                <SelectTrigger id="salao">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {SALOES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[errors.salao]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="categoria">Categoria</FieldLabel>
              <Select
                items={Object.fromEntries(SALAO_ITEM_CATEGORIAS.map((c) => [c, c]))}
                value={categoria || undefined}
                onValueChange={(v) => setValue("categoria", v ?? "")}
              >
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {SALAO_ITEM_CATEGORIAS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field data-invalid={!!errors.nome}>
            <FieldLabel htmlFor="nome">Nome do item</FieldLabel>
            <Input id="nome" placeholder="Ex: Pratos Rasos de Porcelana" {...register("nome")} />
            <FieldError errors={[errors.nome]} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.quantidade}>
              <FieldLabel htmlFor="quantidade">Quantidade</FieldLabel>
              <Input id="quantidade" type="number" step="1" {...register("quantidade")} />
              <FieldError errors={[errors.quantidade]} />
            </Field>
            <Field data-invalid={!!errors.valor_unitario}>
              <FieldLabel htmlFor="valor_unitario">Valor unitário</FieldLabel>
              <Input id="valor_unitario" type="number" step="0.01" {...register("valor_unitario")} />
              <FieldError errors={[errors.valor_unitario]} />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="observacoes">Observações</FieldLabel>
            <Textarea id="observacoes" rows={3} {...register("observacoes")} />
          </Field>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="salao-item-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
