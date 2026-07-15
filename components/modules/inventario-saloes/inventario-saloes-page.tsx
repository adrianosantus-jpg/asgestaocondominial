"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  useSalaoItens,
  useDeactivateSalaoItem,
  type SalaoItemRow,
} from "@/lib/hooks/use-salao-itens";
import { SALOES } from "@/lib/validations/salao-item";
import { buildInventarioSaloesColumns } from "@/components/modules/inventario-saloes/inventario-saloes-columns";
import { SalaoItemForm } from "@/components/modules/inventario-saloes/salao-item-form";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRealtimeInvalidate } from "@/lib/hooks/use-realtime-invalidate";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function InventarioSaloesPage() {
  const { data: itens, isLoading } = useSalaoItens();
  const deactivateItem = useDeactivateSalaoItem();

  useRealtimeInvalidate("salao_itens", [["salao_itens"]]);

  const [search, setSearch] = useState("");
  const [salaoFiltro, setSalaoFiltro] = useState("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SalaoItemRow | undefined>();

  const columns = buildInventarioSaloesColumns({
    onEdit: (item) => {
      setEditing(item);
      setFormOpen(true);
    },
    onDeactivate: (item) => {
      if (confirm(`Remover "${item.nome}" do inventário de ${item.salao}?`)) {
        deactivateItem.mutate(item.id, {
          onSuccess: () => toast.success("Item removido do inventário"),
          onError: () => toast.error("Erro ao remover item"),
        });
      }
    },
  });

  const itensFiltrados = useMemo(() => {
    if (!itens) return [];
    if (salaoFiltro === "todos") return itens;
    return itens.filter((i) => i.salao === salaoFiltro);
  }, [itens, salaoFiltro]);

  const resumo = useMemo(() => {
    const totalItens = itensFiltrados.reduce((sum, i) => sum + i.quantidade, 0);
    const valorTotal = itensFiltrados.reduce((sum, i) => sum + i.valor_total, 0);
    return { totalItens, valorTotal };
  }, [itensFiltrados]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Inventário Salões de Festas"
        description="Louças, talheres, copos e utensílios de cada salão de festas."
      >
        <Button
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
        >
          <Plus /> Novo Item
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por item, categoria..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          items={{ todos: "Todos os salões", ...Object.fromEntries(SALOES.map((s) => [s, s])) }}
          value={salaoFiltro}
          onValueChange={(v) => v && setSalaoFiltro(v)}
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os salões</SelectItem>
            {SALOES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {resumo.totalItens} peça(s) · {currency.format(resumo.valorTotal)}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={itensFiltrados}
          globalFilter={search}
          onGlobalFilterChange={setSearch}
          emptyMessage="Nenhum item cadastrado ainda."
        />
      )}

      <SalaoItemForm open={formOpen} onOpenChange={setFormOpen} item={editing} />
    </div>
  );
}
