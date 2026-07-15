"use client";

import dynamic from "next/dynamic";
import {
  AlertTriangle,
  ClipboardList,
  PackageX,
  TrendingDown,
  Wallet,
  Wrench,
} from "lucide-react";
import { useEstoqueSummary } from "@/lib/hooks/use-estoque-summary";
import { useManutencaoSummary } from "@/lib/hooks/use-manutencao-summary";
import { useOsDashboard } from "@/lib/hooks/use-os-dashboard";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useRealtimeInvalidate } from "@/lib/hooks/use-realtime-invalidate";

const CustosChart = dynamic(
  () => import("@/components/modules/dashboard/custos-chart").then((m) => m.CustosChart),
  { ssr: false, loading: () => <Skeleton className="h-64" /> }
);
const OsTipoChart = dynamic(
  () => import("@/components/modules/dashboard/os-tipo-chart").then((m) => m.OsTipoChart),
  { ssr: false, loading: () => <Skeleton className="h-64" /> }
);

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function DashboardPage() {
  const { data: estoque, isLoading: loadingEstoque } = useEstoqueSummary();
  const { data: manutencao, isLoading: loadingManutencao } = useManutencaoSummary();
  const { data: os, isLoading: loadingOs } = useOsDashboard();

  const isLoading = loadingEstoque || loadingManutencao || loadingOs;

  useRealtimeInvalidate("produtos", [["produtos", "summary"]]);
  useRealtimeInvalidate("movimentacoes_estoque", [["produtos", "summary"]]);
  useRealtimeInvalidate("agenda_eventos", [["agenda_eventos", "summary"]]);
  useRealtimeInvalidate("ordens_servico", [["ordens_servico", "dashboard"]]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Visão geral do condomínio"
        description="Acompanhe estoque, manutenções e ordens de serviço em tempo real."
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon={Wallet}
              label="Valor do estoque"
              value={currency.format(estoque?.valorTotal ?? 0)}
              tone="primary"
            />
            <StatCard
              icon={PackageX}
              label="Produtos em falta"
              value={estoque?.emFalta ?? 0}
              tone="destructive"
            />
            <StatCard
              icon={TrendingDown}
              label="Estoque baixo"
              value={estoque?.estoqueBaixo ?? 0}
              tone="warning"
            />
            <StatCard
              icon={ClipboardList}
              label="Manutenções em aberto"
              value={manutencao?.emAberto ?? 0}
              tone="primary"
            />
            <StatCard
              icon={AlertTriangle}
              label="Manutenções vencidas"
              value={manutencao?.vencidas ?? 0}
              tone="destructive"
            />
            <StatCard
              icon={Wrench}
              label="OS abertas"
              value={os?.abertas ?? 0}
              tone="primary"
            />
            <StatCard
              icon={Wallet}
              label="Custos do mês (OS)"
              value={currency.format(os?.custosMes ?? 0)}
              tone="warning"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <CustosChart data={os?.custosPorMes ?? []} />
            <OsTipoChart data={os?.porTipo ?? []} />
          </div>
        </>
      )}
    </div>
  );
}
