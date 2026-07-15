"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Image as ImageIcon, Loader2, Pencil, Plus, Video } from "lucide-react";
import { toast } from "sonner";
import {
  osMaterialSchema,
  osConclusaoSchema,
  OS_STATUS_LABELS,
  OS_PRIORIDADE_LABELS,
  type OsStatus,
  type OsMaterialFormValues,
  type OsMaterialInput,
  type OsConclusaoFormValues,
  type OsConclusaoInput,
} from "@/lib/validations/os";
import {
  useUpdateOsStatus,
  useUpdateOsConclusao,
  useOsMateriais,
  useAddOsMaterial,
  useOsMidias,
  useUploadOsMidia,
  type OsRow,
} from "@/lib/hooks/use-ordens-servico";
import { useProdutos } from "@/lib/hooks/use-produtos";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function OsDetailSheet({
  open,
  onOpenChange,
  os,
  onEdit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  os: OsRow;
  onEdit: () => void;
}) {
  const updateStatus = useUpdateOsStatus();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <SheetTitle>
                {os.numero} — {os.titulo}
              </SheetTitle>
              <SheetDescription>
                {os.equipamentos?.nome ?? "Sem equipamento"} ·{" "}
                {os.fornecedores?.nome ?? "Sem fornecedor"}
              </SheetDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil /> Editar
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-5 px-4 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              items={OS_STATUS_LABELS}
              value={os.status}
              onValueChange={(v) =>
                v && updateStatus.mutate({ id: os.id, status: v as OsStatus })
              }
            >
              <SelectTrigger className="w-fit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(OS_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline">{OS_PRIORIDADE_LABELS[os.prioridade]}</Badge>
            <Badge variant="outline">{os.tipo === "corretiva" ? "Corretiva" : "Preventiva"}</Badge>
          </div>

          {os.descricao && <p className="text-sm text-muted-foreground">{os.descricao}</p>}

          <Separator />

          <MateriaisSection osId={os.id} />

          <Separator />

          <MidiasSection osId={os.id} />

          <Separator />

          <ConclusaoSection os={os} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MateriaisSection({ osId }: { osId: string }) {
  const { data: materiais } = useOsMateriais(osId);
  const { data: produtos } = useProdutos();
  const addMaterial = useAddOsMaterial(osId);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<OsMaterialFormValues, unknown, OsMaterialInput>({
    resolver: zodResolver(osMaterialSchema),
    defaultValues: { quantidade: 1 },
  });

  const produtoId = watch("produto_id");

  async function onSubmit(values: OsMaterialInput) {
    try {
      await addMaterial.mutateAsync(values);
      toast.success("Material lançado — estoque baixado automaticamente");
      reset({ quantidade: 1, produto_id: undefined });
    } catch (error) {
      toast.error("Erro ao lançar material", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <div className="space-y-2">
      <FieldLabel>Materiais utilizados</FieldLabel>

      {materiais?.map((m) => (
        <div key={m.id} className="flex items-center justify-between text-sm">
          <span>
            {m.quantidade} {m.produtos?.unidade} — {m.produtos?.nome}
          </span>
          <span className="text-muted-foreground">{currency.format(m.custo)}</span>
        </div>
      ))}

      <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-2 pt-1">
        <Select
          items={Object.fromEntries(
            (produtos ?? []).map((p) => [
              p.id,
              `${p.nome} (${p.quantidade} ${p.unidade} disp.)`,
            ])
          )}
          value={produtoId}
          onValueChange={(v) => v && setValue("produto_id", v)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Produto" />
          </SelectTrigger>
          <SelectContent>
            {produtos?.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nome} ({p.quantidade} {p.unidade} disp.)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          step="0.01"
          className="w-20"
          placeholder="Qtd"
          {...register("quantidade")}
        />
        <Button type="submit" size="icon" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus />}
        </Button>
      </form>
    </div>
  );
}

function MidiasSection({ osId }: { osId: string }) {
  const { data: midias } = useOsMidias(osId);
  const uploadMidia = useUploadOsMidia(osId);
  const fotoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined, tipo: "foto" | "video" | "pdf") {
    if (!file) return;
    try {
      await uploadMidia.mutateAsync({ file, tipo });
      toast.success("Arquivo anexado");
    } catch (error) {
      toast.error("Erro ao anexar arquivo", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <div className="space-y-2">
      <FieldLabel>Fotos, vídeos e PDF</FieldLabel>

      <div className="flex flex-wrap gap-2">
        {midias?.map((m) =>
          m.tipo === "foto" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={m.id} src={m.url} alt="Anexo da OS" className="size-16 rounded-md object-cover" />
          ) : (
            <a
              key={m.id}
              href={m.url}
              target="_blank"
              rel="noreferrer"
              className="flex size-16 flex-col items-center justify-center gap-1 rounded-md border text-xs text-muted-foreground hover:bg-accent"
            >
              {m.tipo === "video" ? <Video className="size-4" /> : <FileText className="size-4" />}
              {m.tipo.toUpperCase()}
            </a>
          )
        )}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => fotoRef.current?.click()}>
          <ImageIcon /> Foto
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => videoRef.current?.click()}>
          <Video /> Vídeo
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => pdfRef.current?.click()}>
          <FileText /> PDF
        </Button>
      </div>
      <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0], "foto")} />
      <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0], "video")} />
      <input ref={pdfRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFile(e.target.files?.[0], "pdf")} />
    </div>
  );
}

function ConclusaoSection({ os }: { os: OsRow }) {
  const updateConclusao = useUpdateOsConclusao();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<OsConclusaoFormValues, unknown, OsConclusaoInput>({
    resolver: zodResolver(osConclusaoSchema),
    defaultValues: { custo_mao_obra: os.custo_mao_obra },
  });

  const jaConcluida = os.status === "concluida";

  async function onSubmit(values: OsConclusaoInput) {
    try {
      await updateConclusao.mutateAsync({ id: os.id, ...values });
      toast.success("OS concluída");
    } catch (error) {
      toast.error("Erro ao concluir OS", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <div className="space-y-3">
      <FieldLabel>Custos e tempo</FieldLabel>

      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Materiais</span>
        <span>{currency.format(os.custo_materiais)}</span>
      </div>
      <div className="flex justify-between text-sm font-medium">
        <span>Total</span>
        <span>{currency.format(os.custo_total)}</span>
      </div>

      {jaConcluida ? (
        <p className="text-xs text-muted-foreground">
          Concluída em {os.data_conclusao && new Date(os.data_conclusao).toLocaleString("pt-BR")}
          {os.tempo_gasto_minutos ? ` · ${os.tempo_gasto_minutos} min` : ""}
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="tempo_gasto_minutos">Tempo gasto (min)</FieldLabel>
              <Input id="tempo_gasto_minutos" type="number" {...register("tempo_gasto_minutos")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="custo_mao_obra">Custo mão de obra</FieldLabel>
              <Input id="custo_mao_obra" type="number" step="0.01" {...register("custo_mao_obra")} />
            </Field>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Concluir OS
          </Button>
        </form>
      )}
    </div>
  );
}
