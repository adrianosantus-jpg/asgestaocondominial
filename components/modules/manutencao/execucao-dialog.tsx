"use client";

import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useRegistrarExecucao } from "@/lib/hooks/use-execucoes-preventivas";
import type { PlanoPreventivoRow } from "@/lib/hooks/use-planos-preventivos";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { SignaturePad } from "@/components/modules/manutencao/signature-pad";

function FileListInput({
  label,
  files,
  onChange,
}: {
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel>{label}</FieldLabel>
      <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground hover:bg-accent">
        <Upload className="size-4" />
        {files.length > 0 ? `${files.length} foto(s) selecionada(s)` : "Selecionar fotos"}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onChange(Array.from(e.target.files ?? []))}
        />
      </label>
    </div>
  );
}

export function ExecucaoDialog({
  open,
  onOpenChange,
  plano,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plano: PlanoPreventivoRow;
}) {
  const registrarExecucao = useRegistrarExecucao(plano.id);

  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [observacoes, setObservacoes] = useState("");
  const [fotosAntes, setFotosAntes] = useState<File[]>([]);
  const [fotosDepois, setFotosDepois] = useState<File[]>([]);
  const [assinatura, setAssinatura] = useState<string | null>(null);

  async function handleSubmit() {
    try {
      const checklistResultado = plano.checklist.map((item, i) => ({
        item,
        ok: !!checked[i],
      }));

      await registrarExecucao.mutateAsync({
        checklistResultado,
        observacoes,
        fotosAntes,
        fotosDepois,
        assinaturaDataUrl: assinatura,
      });

      toast.success("Execução registrada — próxima ocorrência agendada");
      onOpenChange(false);
      setChecked({});
      setObservacoes("");
      setFotosAntes([]);
      setFotosDepois([]);
      setAssinatura(null);
    } catch (error) {
      toast.error("Erro ao registrar execução", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar execução</DialogTitle>
          <DialogDescription>
            {plano.titulo} — {plano.equipamentos?.nome}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {plano.checklist.length > 0 && (
            <Field>
              <FieldLabel>Checklist</FieldLabel>
              <div className="space-y-2 rounded-lg border p-3">
                {plano.checklist.map((item, i) => (
                  <label key={i} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={!!checked[i]}
                      onCheckedChange={(v) =>
                        setChecked((prev) => ({ ...prev, [i]: !!v }))
                      }
                    />
                    {item}
                  </label>
                ))}
              </div>
            </Field>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FileListInput label="Fotos antes" files={fotosAntes} onChange={setFotosAntes} />
            <FileListInput label="Fotos depois" files={fotosDepois} onChange={setFotosDepois} />
          </div>

          <Field>
            <FieldLabel htmlFor="observacoes">Observações</FieldLabel>
            <Textarea
              id="observacoes"
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>Assinatura</FieldLabel>
            <SignaturePad onChange={setAssinatura} />
          </Field>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={registrarExecucao.isPending}>
            {registrarExecucao.isPending && <Loader2 className="animate-spin" />}
            Concluir execução
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
