"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  fornecedorSchema,
  type FornecedorFormValues,
  type FornecedorInput,
} from "@/lib/validations/fornecedor";
import {
  useCreateFornecedor,
  useUpdateFornecedor,
  useUploadFornecedorContrato,
  type FornecedorRow,
} from "@/lib/hooks/use-fornecedores";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { StarRating } from "@/components/modules/fornecedores/star-rating";

export function FornecedorForm({
  open,
  onOpenChange,
  fornecedor,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fornecedor?: FornecedorRow;
}) {
  const isEdit = !!fornecedor;
  const createFornecedor = useCreateFornecedor();
  const updateFornecedor = useUpdateFornecedor();
  const uploadContrato = useUploadFornecedorContrato();

  const [contrato, setContrato] = useState<File | null>(null);
  const contratoInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FornecedorFormValues, unknown, FornecedorInput>({
    resolver: zodResolver(fornecedorSchema),
    defaultValues: { nome: "" },
  });

  useEffect(() => {
    if (open) {
      reset(
        fornecedor
          ? {
              nome: fornecedor.nome,
              pessoa_contato: fornecedor.pessoa_contato ?? "",
              telefone: fornecedor.telefone ?? "",
              whatsapp: fornecedor.whatsapp ?? "",
              email: fornecedor.email ?? "",
              especialidade: fornecedor.especialidade ?? "",
              cnpj: fornecedor.cnpj ?? "",
              data_vencimento_contrato: fornecedor.data_vencimento_contrato ?? "",
              avaliacao: fornecedor.avaliacao,
              observacoes: fornecedor.observacoes ?? "",
            }
          : { nome: "" }
      );
      setContrato(null);
    }
  }, [open, fornecedor, reset]);

  async function onSubmit(values: FornecedorInput) {
    try {
      let id = fornecedor?.id;

      if (isEdit && fornecedor) {
        await updateFornecedor.mutateAsync({ id: fornecedor.id, input: values });
      } else {
        const created = await createFornecedor.mutateAsync(values);
        id = created.id;
      }

      if (!id) throw new Error("Falha ao obter id do fornecedor");

      if (contrato) {
        const { signedUrl } = await uploadContrato.mutateAsync({
          file: contrato,
          fornecedorId: id,
        });
        if (signedUrl) {
          await updateFornecedor.mutateAsync({
            id,
            input: { contrato_url: signedUrl },
          });
        }
      }

      toast.success(isEdit ? "Fornecedor atualizado" : "Fornecedor cadastrado");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar fornecedor", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  const avaliacao = watch("avaliacao");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar fornecedor" : "Novo fornecedor"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="fornecedor-form">
          <Field data-invalid={!!errors.nome}>
            <FieldLabel htmlFor="nome">Nome</FieldLabel>
            <Input id="nome" {...register("nome")} />
            <FieldError errors={[errors.nome]} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="pessoa_contato">Pessoa de contato</FieldLabel>
              <Input id="pessoa_contato" {...register("pessoa_contato")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="cnpj">CNPJ</FieldLabel>
              <Input id="cnpj" placeholder="00.000.000/0001-00" {...register("cnpj")} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="telefone">Telefone</FieldLabel>
              <Input id="telefone" {...register("telefone")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="whatsapp">WhatsApp</FieldLabel>
              <Input id="whatsapp" {...register("whatsapp")} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input id="email" type="email" {...register("email")} />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="especialidade">Especialidade</FieldLabel>
              <Input id="especialidade" placeholder="Elevadores, elétrica..." {...register("especialidade")} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="data_vencimento_contrato">Contrato vence em</FieldLabel>
              <Input id="data_vencimento_contrato" type="date" {...register("data_vencimento_contrato")} />
            </Field>
            <Field>
              <FieldLabel>Avaliação</FieldLabel>
              <StarRating
                value={avaliacao as number | null | undefined}
                onChange={(v) => setValue("avaliacao", v)}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel>Contrato (PDF)</FieldLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => contratoInputRef.current?.click()}
            >
              <FileText /> {contrato ? contrato.name : "Anexar contrato"}
            </Button>
            <input
              ref={contratoInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setContrato(e.target.files?.[0] ?? null)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="observacoes">Observações</FieldLabel>
            <Textarea id="observacoes" rows={3} {...register("observacoes")} />
          </Field>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="fornecedor-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
