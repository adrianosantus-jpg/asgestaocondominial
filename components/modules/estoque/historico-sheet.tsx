"use client";

import { ArrowDownCircle, ArrowUpCircle, ClipboardEdit, ListChecks } from "lucide-react";
import { useMovimentacoes } from "@/lib/hooks/use-movimentacoes";
import type { ProdutoRow } from "@/lib/hooks/use-produtos";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

const TIPO_META = {
  entrada: { label: "Entrada", icon: ArrowUpCircle, className: "text-emerald-600 dark:text-emerald-400" },
  saida: { label: "Saída", icon: ArrowDownCircle, className: "text-destructive" },
  ajuste: { label: "Ajuste", icon: ClipboardEdit, className: "text-amber-600 dark:text-amber-400" },
  inventario: { label: "Inventário", icon: ListChecks, className: "text-primary" },
} as const;

export function HistoricoSheet({
  open,
  onOpenChange,
  produto,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto: ProdutoRow;
}) {
  const { data: movimentacoes, isLoading } = useMovimentacoes(
    open ? produto.id : undefined
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Histórico de movimentações</SheetTitle>
          <SheetDescription>{produto.nome}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-4">
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          )}

          {!isLoading && movimentacoes?.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma movimentação registrada ainda.
            </p>
          )}

          {movimentacoes?.map((mov) => {
            const meta = TIPO_META[mov.tipo as keyof typeof TIPO_META];
            const Icon = meta.icon;
            return (
              <div
                key={mov.id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <Icon className={`mt-0.5 size-5 shrink-0 ${meta.className}`} />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{meta.label}</span>
                    <span className="text-sm font-medium">
                      {mov.tipo === "inventario" ? "= " : ""}
                      {mov.quantidade}
                    </span>
                  </div>
                  {mov.motivo && (
                    <p className="text-sm text-muted-foreground">{mov.motivo}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {mov.profiles?.nome ?? "—"} ·{" "}
                    {new Date(mov.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
