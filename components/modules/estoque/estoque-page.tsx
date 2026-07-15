"use client";

import { useState } from "react";
import { FileDown, FileSpreadsheet, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useProdutos, useDeactivateProduto, type ProdutoRow } from "@/lib/hooks/use-produtos";
import { buildProdutosColumns } from "@/components/modules/estoque/produtos-columns";
import { ProdutoForm } from "@/components/modules/estoque/produto-form";
import { MovimentacaoDialog } from "@/components/modules/estoque/movimentacao-dialog";
import { HistoricoSheet } from "@/components/modules/estoque/historico-sheet";
import { QrCodeDialog } from "@/components/modules/estoque/qrcode-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useRealtimeInvalidate } from "@/lib/hooks/use-realtime-invalidate";

export function EstoquePage() {
  const { data: produtos, isLoading } = useProdutos();
  const deactivateProduto = useDeactivateProduto();

  useRealtimeInvalidate("produtos", [["produtos"], ["produtos", "summary"]]);
  useRealtimeInvalidate("movimentacoes_estoque", [
    ["produtos"],
    ["produtos", "summary"],
    ["notificacoes"],
  ]);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<ProdutoRow | undefined>();
  const [movProduto, setMovProduto] = useState<ProdutoRow | null>(null);
  const [historicoProduto, setHistoricoProduto] = useState<ProdutoRow | null>(null);
  const [qrProduto, setQrProduto] = useState<ProdutoRow | null>(null);

  const columns = buildProdutosColumns({
    onEdit: (p) => {
      setEditingProduto(p);
      setFormOpen(true);
    },
    onMovimentar: setMovProduto,
    onHistorico: setHistoricoProduto,
    onQrCode: setQrProduto,
    onDeactivate: (p) => {
      if (confirm(`Desativar "${p.nome}"? Ele deixa de aparecer na listagem.`)) {
        deactivateProduto.mutate(p.id, {
          onSuccess: () => toast.success("Produto desativado"),
          onError: () => toast.error("Erro ao desativar produto"),
        });
      }
    },
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Controle de Estoque"
        description="Produtos, quantidades e movimentações do condomínio."
      >
        <Button
          onClick={() => {
            setEditingProduto(undefined);
            setFormOpen(true);
          }}
        >
          <Plus /> Novo Produto
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, código, categoria..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={!produtos?.length}
          onClick={async () => {
            if (!produtos) return;
            const { exportProdutosExcel } = await import(
              "@/lib/export/produtos-excel"
            );
            exportProdutosExcel(produtos);
          }}
        >
          <FileSpreadsheet /> Excel
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!produtos?.length}
          onClick={async () => {
            if (!produtos) return;
            const { exportProdutosPdf } = await import(
              "@/lib/export/produtos-pdf"
            );
            exportProdutosPdf(produtos);
          }}
        >
          <FileDown /> PDF
        </Button>
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
          data={produtos ?? []}
          globalFilter={search}
          onGlobalFilterChange={setSearch}
          emptyMessage="Nenhum produto cadastrado ainda."
        />
      )}

      <ProdutoForm open={formOpen} onOpenChange={setFormOpen} produto={editingProduto} />

      {movProduto && (
        <MovimentacaoDialog
          open={!!movProduto}
          onOpenChange={(open) => !open && setMovProduto(null)}
          produto={movProduto}
        />
      )}

      {historicoProduto && (
        <HistoricoSheet
          open={!!historicoProduto}
          onOpenChange={(open) => !open && setHistoricoProduto(null)}
          produto={historicoProduto}
        />
      )}

      {qrProduto && (
        <QrCodeDialog
          open={!!qrProduto}
          onOpenChange={(open) => !open && setQrProduto(null)}
          produto={qrProduto}
        />
      )}
    </div>
  );
}
