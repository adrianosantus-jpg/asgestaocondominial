"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FileText, MoreHorizontal } from "lucide-react";
import type { FornecedorRow } from "@/lib/hooks/use-fornecedores";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StarRating } from "@/components/modules/fornecedores/star-rating";

export function buildFornecedoresColumns(actions: {
  onEdit: (f: FornecedorRow) => void;
  onDeactivate: (f: FornecedorRow) => void;
}): ColumnDef<FornecedorRow>[] {
  return [
    {
      accessorKey: "nome",
      header: "Nome",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.nome}</div>
          {row.original.especialidade && (
            <div className="text-xs text-muted-foreground">
              {row.original.especialidade}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "telefone",
      header: "Contato",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.pessoa_contato && <div>{row.original.pessoa_contato}</div>}
          <div className="text-xs text-muted-foreground">
            {row.original.telefone ?? row.original.whatsapp ?? row.original.email ?? "—"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "cnpj",
      header: "CNPJ",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.cnpj ?? "—"}</span>
      ),
    },
    {
      accessorKey: "avaliacao",
      header: "Avaliação",
      cell: ({ row }) => <StarRating value={row.original.avaliacao} readOnly />,
    },
    {
      accessorKey: "data_vencimento_contrato",
      header: "Contrato",
      cell: ({ row }) => {
        if (!row.original.data_vencimento_contrato)
          return <span className="text-muted-foreground">—</span>;
        const vencido = new Date(row.original.data_vencimento_contrato) < new Date();
        return (
          <div className="flex items-center gap-1.5">
            <span className="text-sm">
              {new Date(row.original.data_vencimento_contrato).toLocaleDateString("pt-BR")}
            </span>
            {vencido && <Badge variant="destructive">Vencido</Badge>}
          </div>
        );
      },
    },
    {
      id: "contrato",
      header: "",
      cell: ({ row }) =>
        row.original.contrato_url ? (
          <a
            href={row.original.contrato_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <FileText className="size-3.5" /> PDF
          </a>
        ) : null,
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
              Desativar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
