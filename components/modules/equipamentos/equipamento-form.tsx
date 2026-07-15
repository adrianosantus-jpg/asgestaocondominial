"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  equipamentoSchema,
  EQUIPAMENTO_CATEGORIAS,
  type EquipamentoFormValues,
  type EquipamentoInput,
} from "@/lib/validations/equipamento";
import {
  useCreateEquipamento,
  useUpdateEquipamento,
  useUploadEquipamentoArquivo,
  type EquipamentoRow,
} from "@/lib/hooks/use-equipamentos";
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

export function EquipamentoForm({
  open,
  onOpenChange,
  equipamento,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipamento?: EquipamentoRow;
}) {
  const isEdit = !!equipamento;
  const createEquipamento = useCreateEquipamento();
  const updateEquipamento = useUpdateEquipamento();
  const uploadArquivo = useUploadEquipamentoArquivo();

  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [manual, setManual] = useState<File | null>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EquipamentoFormValues, unknown, EquipamentoInput>({
    resolver: zodResolver(equipamentoSchema),
    defaultValues: { nome: "", categoria: "" },
  });

  useEffect(() => {
    if (open) {
      reset(
        equipamento
          ? {
              nome: equipamento.nome,
              categoria: equipamento.categoria,
              empresa_responsavel: equipamento.empresa_responsavel ?? "",
              garantia_fim: equipamento.garantia_fim ?? "",
              data_instalacao: equipamento.data_instalacao ?? "",
              numero_patrimonio: equipamento.numero_patrimonio ?? "",
              localizacao: equipamento.localizacao ?? "",
              fabricante: equipamento.fabricante ?? "",
              modelo: equipamento.modelo ?? "",
              numero_serie: equipamento.numero_serie ?? "",
              observacoes: equipamento.observacoes ?? "",
            }
          : { nome: "", categoria: "" }
      );
      setFoto(null);
      setFotoPreview(equipamento?.foto_url ?? null);
      setManual(null);
    }
  }, [open, equipamento, reset]);

  async function onSubmit(values: EquipamentoInput) {
    try {
      let id = equipamento?.id;

      if (isEdit && equipamento) {
        await updateEquipamento.mutateAsync({ id: equipamento.id, input: values });
      } else {
        const created = await createEquipamento.mutateAsync(values);
        id = created.id;
      }

      if (!id) throw new Error("Falha ao obter id do equipamento");

      const updates: { foto_url?: string; manual_pdf_url?: string } = {};

      if (foto) {
        const { signedUrl } = await uploadArquivo.mutateAsync({
          file: foto,
          equipamentoId: id,
          tipo: "foto",
        });
        if (signedUrl) updates.foto_url = signedUrl;
      }

      if (manual) {
        const { signedUrl } = await uploadArquivo.mutateAsync({
          file: manual,
          equipamentoId: id,
          tipo: "manual",
        });
        if (signedUrl) updates.manual_pdf_url = signedUrl;
      }

      if (Object.keys(updates).length > 0) {
        await updateEquipamento.mutateAsync({ id, input: updates });
      }

      toast.success(isEdit ? "Equipamento atualizado" : "Equipamento cadastrado");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar equipamento", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  const categoria = watch("categoria");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar equipamento" : "Novo equipamento"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          id="equipamento-form"
        >
          <div className="flex items-center gap-4">
            <Avatar className="size-16 rounded-lg">
              <AvatarImage src={fotoPreview ?? undefined} className="object-cover" />
              <AvatarFallback className="rounded-lg">
                <Upload className="size-5 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fotoInputRef.current?.click()}
              >
                Escolher foto
              </Button>
              <input
                ref={fotoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setFoto(f);
                    setFotoPreview(URL.createObjectURL(f));
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => manualInputRef.current?.click()}
              >
                <FileText /> {manual ? manual.name : "Manual (PDF)"}
              </Button>
              <input
                ref={manualInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => setManual(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <Field data-invalid={!!errors.nome}>
            <FieldLabel htmlFor="nome">Nome</FieldLabel>
            <Input id="nome" {...register("nome")} />
            <FieldError errors={[errors.nome]} />
          </Field>

          <Field data-invalid={!!errors.categoria}>
            <FieldLabel htmlFor="categoria">Categoria</FieldLabel>
            <Select
              value={categoria || undefined}
              onValueChange={(v) => setValue("categoria", v ?? "")}
            >
              <SelectTrigger id="categoria">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {EQUIPAMENTO_CATEGORIAS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[errors.categoria]} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="fabricante">Fabricante</FieldLabel>
              <Input id="fabricante" {...register("fabricante")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="modelo">Modelo</FieldLabel>
              <Input id="modelo" {...register("modelo")} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="numero_serie">Número de série</FieldLabel>
              <Input id="numero_serie" {...register("numero_serie")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="numero_patrimonio">Nº patrimônio</FieldLabel>
              <Input id="numero_patrimonio" {...register("numero_patrimonio")} />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="localizacao">Localização</FieldLabel>
            <Input id="localizacao" placeholder="Cobertura, casa de máquinas..." {...register("localizacao")} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="data_instalacao">Data de instalação</FieldLabel>
              <Input id="data_instalacao" type="date" {...register("data_instalacao")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="garantia_fim">Garantia até</FieldLabel>
              <Input id="garantia_fim" type="date" {...register("garantia_fim")} />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="empresa_responsavel">Empresa responsável</FieldLabel>
            <Input id="empresa_responsavel" {...register("empresa_responsavel")} />
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
          <Button type="submit" form="equipamento-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
