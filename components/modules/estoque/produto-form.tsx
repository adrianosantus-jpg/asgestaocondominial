"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  produtoSchema,
  type ProdutoFormValues,
  type ProdutoInput,
} from "@/lib/validations/produto";
import {
  useCreateProduto,
  useUpdateProduto,
  useUploadProdutoFoto,
  type ProdutoRow,
} from "@/lib/hooks/use-produtos";
import { useCategorias, useCreateCategoria } from "@/lib/hooks/use-categorias";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProdutoForm({
  open,
  onOpenChange,
  produto,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto?: ProdutoRow;
}) {
  const isEdit = !!produto;
  const { data: categorias } = useCategorias();
  const createCategoria = useCreateCategoria();
  const createProduto = useCreateProduto();
  const updateProduto = useUpdateProduto();
  const uploadFoto = useUploadProdutoFoto();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProdutoFormValues, unknown, ProdutoInput>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      nome: "",
      unidade: "un",
      estoque_minimo: 0,
      valor_unitario: 0,
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        produto
          ? {
              nome: produto.nome,
              categoria_id: produto.categoria_id,
              marca: produto.marca ?? "",
              unidade: produto.unidade,
              local: produto.local ?? "",
              estoque_minimo: produto.estoque_minimo,
              estoque_maximo: produto.estoque_maximo,
              valor_unitario: produto.valor_unitario,
              codigo_barras: produto.codigo_barras ?? "",
              observacoes: produto.observacoes ?? "",
            }
          : {
              nome: "",
              unidade: "un",
              estoque_minimo: 0,
              valor_unitario: 0,
            }
      );
      setFile(null);
      setPreview(produto?.foto_url ?? null);
    }
  }, [open, produto, reset]);

  async function onSubmit(values: ProdutoInput) {
    try {
      let produtoId = produto?.id;

      if (isEdit && produto) {
        await updateProduto.mutateAsync({ id: produto.id, input: values });
      } else {
        const created = await createProduto.mutateAsync(values);
        produtoId = created.id;
      }

      if (file && produtoId) {
        const { signedUrl } = await uploadFoto.mutateAsync({
          file,
          produtoId,
        });
        if (signedUrl) {
          await updateProduto.mutateAsync({
            id: produtoId,
            input: { foto_url: signedUrl },
          });
        }
      }

      toast.success(isEdit ? "Produto atualizado" : "Produto cadastrado");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar produto", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  const categoriaId = watch("categoria_id");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar produto" : "Novo produto"}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          id="produto-form"
        >
          <div className="flex items-center gap-4">
            <Avatar className="size-16 rounded-lg">
              <AvatarImage src={preview ?? undefined} className="object-cover" />
              <AvatarFallback className="rounded-lg">
                <Upload className="size-5 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Escolher foto
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setFile(f);
                    setPreview(URL.createObjectURL(f));
                  }
                }}
              />
            </div>
          </div>

          <Field data-invalid={!!errors.nome}>
            <FieldLabel htmlFor="nome">Nome</FieldLabel>
            <Input id="nome" {...register("nome")} />
            <FieldError errors={[errors.nome]} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="categoria_id">Categoria</FieldLabel>
              <Select
                items={Object.fromEntries(
                  (categorias ?? []).map((c) => [c.id, c.nome])
                )}
                value={categoriaId ?? undefined}
                onValueChange={(v) => {
                  if (v === "__nova__") {
                    const nome = prompt("Nome da nova categoria:");
                    if (nome?.trim()) {
                      createCategoria.mutate(
                        { nome: nome.trim() },
                        {
                          onSuccess: (categoria) =>
                            setValue("categoria_id", categoria.id),
                          onError: () =>
                            toast.error("Erro ao criar categoria"),
                        }
                      );
                    }
                    return;
                  }
                  setValue("categoria_id", v);
                }}
              >
                <SelectTrigger id="categoria_id">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categorias?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                  <SelectItem value="__nova__">+ Nova categoria</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="marca">Marca</FieldLabel>
              <Input id="marca" {...register("marca")} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.unidade}>
              <FieldLabel htmlFor="unidade">Unidade</FieldLabel>
              <Input id="unidade" placeholder="un, cx, kg..." {...register("unidade")} />
              <FieldError errors={[errors.unidade]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="local">Local</FieldLabel>
              <Input id="local" placeholder="Depósito 1" {...register("local")} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field data-invalid={!!errors.estoque_minimo}>
              <FieldLabel htmlFor="estoque_minimo">Estoque mínimo</FieldLabel>
              <Input
                id="estoque_minimo"
                type="number"
                step="0.01"
                {...register("estoque_minimo")}
              />
              <FieldError errors={[errors.estoque_minimo]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="estoque_maximo">Estoque máximo</FieldLabel>
              <Input
                id="estoque_maximo"
                type="number"
                step="0.01"
                {...register("estoque_maximo")}
              />
            </Field>

            <Field data-invalid={!!errors.valor_unitario}>
              <FieldLabel htmlFor="valor_unitario">Valor unitário</FieldLabel>
              <Input
                id="valor_unitario"
                type="number"
                step="0.01"
                {...register("valor_unitario")}
              />
              <FieldError errors={[errors.valor_unitario]} />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="codigo_barras">Código de barras</FieldLabel>
            <Input id="codigo_barras" {...register("codigo_barras")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="observacoes">Observações</FieldLabel>
            <Textarea id="observacoes" rows={3} {...register("observacoes")} />
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
          <Button type="submit" form="produto-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
