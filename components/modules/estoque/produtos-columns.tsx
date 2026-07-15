"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import type { ProdutoRow } from "@/lib/hooks/use-produtos";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function estoqueStatus(p: ProdutoRow) {
  if (p.quantidade <= 0) return "falta" as const;
  if (p.quantidade <= p.estoque_minimo) return "baixo" as const;
  return "ok" as const;
}

export function buildProdutosColumns(actions: {
  onEdit: (p: ProdutoRow) => void;
  onMovimentar: (p: ProdutoRow) => void;
  onHistorico: (p: ProdutoRow) => void;
  onQrCode: (p: ProdutoRow) => void;
  onDeactivate: (p: ProdutoRow) => void;
}): ColumnDef<ProdutoRow>[] {
  return [
    {
      id: "foto",
      header: "",
      cell: ({ row }) => (
        <Avatar className="size-9 rounded-md">
          <AvatarImage
            src={row.original.foto_url ?? undefined}
            className="object-cover"
          />
          <AvatarFallback className="rounded-md text-xs">
            {row.original.nome.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: "codigo",
      header: "Código",
    },
    {
      accessorKey: "nome",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="size-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.nome}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.categorias_produto?.nome ?? "Sem categoria"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "local",
      header: "Local",
      cell: ({ row }) => row.original.local ?? "—",
    },
    {
      id: "quantidade",
      accessorFn: (p) => p.quantidade,
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Estoque
          <ArrowUpDown className="size-3.5" />
        </Button>
      ),
      cell: ({ row }) => {
        const status = estoqueStatus(row.original);
        return (
          <div className="flex items-center gap-2">
            <span>
              {row.original.quantidade} {row.original.unidade}
            </span>
            {status === "falta" && (
              <Badge variant="destructive">Sem estoque</Badge>
            )}
            {status === "baixo" && (
              <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                Estoque baixo
              </Badge>
            )}
          </div>
        );
      },
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
            <DropdownMenuItem onClick={() => actions.onMovimentar(row.original)}>
              Movimentar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => actions.onHistorico(row.original)}>
              Histórico
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => actions.onQrCode(row.original)}>
              Ver QR Code
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => actions.onEdit(row.original)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => actions.onDeactivate(row.original)}
            >
              Desativar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
