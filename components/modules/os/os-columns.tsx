"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import type { OsRow } from "@/lib/hooks/use-ordens-servico";
import { OS_STATUS_LABELS, OS_PRIORIDADE_LABELS } from "@/lib/validations/os";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_TONE: Record<string, string> = {
  aberta: "border-primary/20 bg-primary/10 text-primary",
  em_andamento:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  aguardando_fornecedor:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  aguardando_material:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  concluida:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  cancelada: "border-muted-foreground/20 bg-muted text-muted-foreground",
};

const PRIORIDADE_TONE: Record<string, string> = {
  baixa: "border-muted-foreground/20 bg-muted text-muted-foreground",
  media: "border-primary/20 bg-primary/10 text-primary",
  alta: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  urgente: "border-destructive/20 bg-destructive/10 text-destructive",
};

export function buildOsColumns(): ColumnDef<OsRow>[] {
  return [
    {
      accessorKey: "numero",
      header: "Número",
    },
    {
      accessorKey: "titulo",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Título
          <ArrowUpDown className="size-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.titulo}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.equipamentos?.nome ?? "Sem equipamento"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className={STATUS_TONE[row.original.status]}>
          {OS_STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: "prioridade",
      header: "Prioridade",
      cell: ({ row }) => (
        <Badge variant="outline" className={PRIORIDADE_TONE[row.original.prioridade]}>
          {OS_PRIORIDADE_LABELS[row.original.prioridade]}
        </Badge>
      ),
    },
    {
      accessorKey: "fornecedores",
      header: "Fornecedor",
      cell: ({ row }) => row.original.fornecedores?.nome ?? "—",
    },
    {
      accessorKey: "custo_total",
      header: "Custo",
      cell: ({ row }) => currency.format(row.original.custo_total),
    },
    {
      accessorKey: "data_abertura",
      header: "Abertura",
      cell: ({ row }) => new Date(row.original.data_abertura).toLocaleDateString("pt-BR"),
    },
  ];
}
