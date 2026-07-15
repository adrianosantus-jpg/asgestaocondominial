"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import type { SalaoItemRow } from "@/lib/hooks/use-salao-itens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function buildInventarioSaloesColumns(
  actions: {
    onEdit: (item: SalaoItemRow) => void;
    onDeactivate: (item: SalaoItemRow) => void;
  },
  options?: { showSalao?: boolean }
): ColumnDef<SalaoItemRow>[] {
  const showSalao = options?.showSalao ?? true;

  return [
    ...(showSalao
      ? [
          {
            accessorKey: "salao",
            header: "Salão",
            cell: ({ row }: { row: { original: SalaoItemRow } }) => (
              <Badge variant="outline">{row.original.salao}</Badge>
            ),
          } as ColumnDef<SalaoItemRow>,
        ]
      : []),
    {
      accessorKey: "nome",
      header: "Item",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.nome}</div>
          {row.original.categoria && (
            <div className="text-xs text-muted-foreground">{row.original.categoria}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "quantidade",
      header: "Quantidade",
      cell: ({ row }) => <span className="tabular-nums">{row.original.quantidade}</span>,
    },
    {
      accessorKey: "valor_unitario",
      header: "Valor unitário",
      cell: ({ row }) => currency.format(row.original.valor_unitario),
    },
    {
      accessorKey: "valor_total",
      header: "Valor total",
      cell: ({ row }) => currency.format(row.original.valor_total),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => actions.onEdit(row.original)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => actions.onDeactivate(row.original)}
            >
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
