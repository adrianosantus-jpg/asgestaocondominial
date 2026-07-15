"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useExecucoesPreventivas } from "@/lib/hooks/use-execucoes-preventivas";
import type { PlanoPreventivoRow } from "@/lib/hooks/use-planos-preventivos";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

export function ExecucoesSheet({
  open,
  onOpenChange,
  plano,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plano: PlanoPreventivoRow;
}) {
  const { data: execucoes, isLoading } = useExecucoesPreventivas(
    open ? plano.id : undefined
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Histórico de execuções</SheetTitle>
          <SheetDescription>{plano.titulo}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-4">
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}

          {!isLoading && execucoes?.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma execução registrada ainda.
            </p>
          )}

          {execucoes?.map((exec) => (
            <div key={exec.id} className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {new Date(exec.data_execucao).toLocaleDateString("pt-BR")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {exec.profiles?.nome ?? "—"}
                </span>
              </div>

              {exec.checklist_resultado.length > 0 && (
                <ul className="space-y-1">
                  {exec.checklist_resultado.map((item, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-xs">
                      {item.ok ? (
                        <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <XCircle className="size-3.5 text-muted-foreground" />
                      )}
                      {item.item}
                    </li>
                  ))}
                </ul>
              )}

              {exec.observacoes && (
                <p className="text-xs text-muted-foreground">{exec.observacoes}</p>
              )}

              <div className="flex flex-wrap gap-1.5">
                {[...exec.fotos_antes, ...exec.fotos_depois].map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt="Foto da execução"
                    className="size-14 rounded-md object-cover"
                  />
                ))}
                {exec.assinatura_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={exec.assinatura_url}
                    alt="Assinatura"
                    className="h-14 rounded-md border bg-white object-contain"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
