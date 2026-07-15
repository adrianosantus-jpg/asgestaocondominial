"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, FileText, MoreHorizontal } from "lucide-react";
import type { EquipamentoRow } from "@/lib/hooks/use-equipamentos";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function FotoCell({ equipamento }: { equipamento: EquipamentoRow }) {
  const [open, setOpen] = useState(false);
  const foto = equipamento.foto_url;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (foto) setOpen(true);
        }}
        className={foto ? "cursor-zoom-in" : "cursor-default"}
      >
        <Avatar className="size-9 rounded-md">
          <AvatarImage src={foto ?? undefined} className="object-cover" />
          <AvatarFallback className="rounded-md text-xs">
            {equipamento.nome.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </button>

      {foto && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{equipamento.nome}</DialogTitle>
            </DialogHeader>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={foto}
              alt={equipamento.nome}
              className="max-h-[70vh] w-full rounded-md object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export function buildEquipamentosColumns(actions: {
  onEdit: (e: EquipamentoRow) => void;
  onPlanos: (e: EquipamentoRow) => void;
  onDeactivate: (e: EquipamentoRow) => void;
}): ColumnDef<EquipamentoRow>[] {
  return [
    {
      id: "foto",
      header: "",
      cell: ({ row }) => <FotoCell equipamento={row.original} />,
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
            {row.original.fabricante ?? "—"} {row.original.modelo ?? ""}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "categoria",
      header: "Categoria",
      cell: ({ row }) => <Badge variant="outline">{row.original.categoria}</Badge>,
    },
    {
      accessorKey: "localizacao",
      header: "Localização",
      cell: ({ row }) => row.original.localizacao ?? "—",
    },
    {
      accessorKey: "empresa_responsavel",
      header: "Empresa responsável",
      cell: ({ row }) => row.original.empresa_responsavel ?? "—",
    },
    {
      id: "manual",
      header: "Manual",
      cell: ({ row }) =>
        row.original.manual_pdf_url ? (
          <a
            href={row.original.manual_pdf_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <FileText className="size-3.5" /> PDF
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
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
            <DropdownMenuItem onClick={() => actions.onPlanos(row.original)}>
              Planos preventivos
            </DropdownMenuItem>
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
