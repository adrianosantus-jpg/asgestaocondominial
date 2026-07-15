"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Flame,
  Gamepad2,
  type LucideIcon,
  PartyPopper,
  Plus,
  Search,
  UtensilsCrossed,
  Wine,
} from "lucide-react";
import { toast } from "sonner";
import {
  useSalaoItens,
  useDeactivateSalaoItem,
  type SalaoItemRow,
} from "@/lib/hooks/use-salao-itens";
import { useSaloes, type SalaoRow } from "@/lib/hooks/use-saloes";
import { SALOES } from "@/lib/validations/salao-item";
import { buildInventarioSaloesColumns } from "@/components/modules/inventario-saloes/inventario-saloes-columns";
import { SalaoItemForm } from "@/components/modules/inventario-saloes/salao-item-form";
import { SalaoCard } from "@/components/modules/inventario-saloes/salao-card";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useRealtimeInvalidate } from "@/lib/hooks/use-realtime-invalidate";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const SALAO_ICONS: Record<string, LucideIcon> = {
  "Salão Gourmet": UtensilsCrossed,
  "Wine Bar": Wine,
  "Pub Jogos": Gamepad2,
  "Barbecue A": Flame,
  "Barbecue B": Flame,
  "Salão de Festas Kids": PartyPopper,
};

export function InventarioSaloesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const salaoAtivo = searchParams.get("salao");

  const { data: itens, isLoading } = useSalaoItens();
  const { data: saloes } = useSaloes();
  const deactivateItem = useDeactivateSalaoItem();

  useRealtimeInvalidate("salao_itens", [["salao_itens"]]);
  useRealtimeInvalidate("saloes", [["saloes"]]);

  const saloesPorNome = useMemo(() => {
    const map = new Map<string, SalaoRow>();
    for (const s of saloes ?? []) map.set(s.nome, s);
    return map;
  }, [saloes]);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SalaoItemRow | undefined>();

  const resumoPorSalao = useMemo(() => {
    const map = new Map<string, { itens: number; valorTotal: number }>();
    for (const s of SALOES) map.set(s, { itens: 0, valorTotal: 0 });
    for (const item of itens ?? []) {
      const atual = map.get(item.salao) ?? { itens: 0, valorTotal: 0 };
      atual.itens += item.quantidade;
      atual.valorTotal += item.valor_total;
      map.set(item.salao, atual);
    }
    return map;
  }, [itens]);

  const itensDoSalao = useMemo(() => {
    if (!salaoAtivo || !itens) return [];
    return itens.filter((i) => i.salao === salaoAtivo);
  }, [itens, salaoAtivo]);

  const columns = buildInventarioSaloesColumns(
    {
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
    },
    { showSalao: false }
  );

  if (salaoAtivo) {
    const resumo = resumoPorSalao.get(salaoAtivo);

    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 w-fit"
          onClick={() => router.push("/inventario-saloes")}
        >
          <ChevronLeft /> Todos os salões
        </Button>

        <PageHeader
          title={salaoAtivo}
          description={`${resumo?.itens ?? 0} peça(s) · ${currency.format(resumo?.valorTotal ?? 0)}`}
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

        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por item, categoria..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
            data={itensDoSalao}
            globalFilter={search}
            onGlobalFilterChange={setSearch}
            emptyMessage="Nenhum item cadastrado neste salão ainda."
          />
        )}

        <SalaoItemForm
          open={formOpen}
          onOpenChange={setFormOpen}
          item={editing}
          defaultSalao={salaoAtivo}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Inventário Salões de Festas"
        description="Escolha um salão para ver louças, talheres, copos e utensílios."
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

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SALOES.map((salao) => {
            const resumo = resumoPorSalao.get(salao) ?? { itens: 0, valorTotal: 0 };
            const Icon = SALAO_ICONS[salao] ?? PartyPopper;
            return (
              <SalaoCard
                key={salao}
                nome={salao}
                salaoRow={saloesPorNome.get(salao)}
                itens={resumo.itens}
                valorTotal={resumo.valorTotal}
                icon={Icon}
                onClick={() =>
                  router.push(`/inventario-saloes?salao=${encodeURIComponent(salao)}`)
                }
              />
            );
          })}
        </div>
      )}

      <SalaoItemForm open={formOpen} onOpenChange={setFormOpen} item={editing} />
    </div>
  );
}
