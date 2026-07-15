"use client";

import { useRef } from "react";
import { Camera, Loader2, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useUploadSalaoFoto, type SalaoRow } from "@/lib/hooks/use-saloes";
import { Card, CardContent } from "@/components/ui/card";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function SalaoCard({
  nome,
  salaoRow,
  itens,
  valorTotal,
  icon: Icon,
  onClick,
}: {
  nome: string;
  salaoRow: SalaoRow | undefined;
  itens: number;
  valorTotal: number;
  icon: LucideIcon;
  onClick: () => void;
}) {
  const uploadFoto = useUploadSalaoFoto();
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file || !salaoRow) return;
    try {
      await uploadFoto.mutateAsync({ file, salao: salaoRow });
      toast.success("Foto atualizada");
    } catch (error) {
      toast.error("Erro ao enviar foto", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <Card className="cursor-pointer hover:shadow-md" onClick={onClick}>
      <CardContent className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="flex size-14 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
            {salaoRow?.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={salaoRow.foto_url} alt={nome} className="size-full object-cover" />
            ) : (
              <Icon className="size-6" />
            )}
          </div>
          <button
            type="button"
            disabled={!salaoRow || uploadFoto.isPending}
            title={salaoRow ? "Alterar foto" : undefined}
            onClick={(e) => {
              e.stopPropagation();
              fileRef.current?.click();
            }}
            className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-background text-muted-foreground ring-1 ring-border hover:text-foreground disabled:opacity-50"
          >
            {uploadFoto.isPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Camera className="size-3" />
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
        <div className="min-w-0">
          <div className="truncate font-medium">{nome}</div>
          <div className="text-sm text-muted-foreground">
            {itens} peça(s) · {currency.format(valorTotal)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
