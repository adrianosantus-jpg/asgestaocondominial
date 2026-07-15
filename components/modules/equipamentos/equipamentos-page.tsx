"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  useEquipamentos,
  useDeactivateEquipamento,
  type EquipamentoRow,
} from "@/lib/hooks/use-equipamentos";
import { buildEquipamentosColumns } from "@/components/modules/equipamentos/equipamentos-columns";
import { EquipamentoForm } from "@/components/modules/equipamentos/equipamento-form";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useRealtimeInvalidate } from "@/lib/hooks/use-realtime-invalidate";

export function EquipamentosPage() {
  const router = useRouter();
  const { data: equipamentos, isLoading } = useEquipamentos();
  const deactivateEquipamento = useDeactivateEquipamento();

  useRealtimeInvalidate("equipamentos", [["equipamentos"]]);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EquipamentoRow | undefined>();

  const columns = buildEquipamentosColumns({
    onEdit: (e) => {
      setEditing(e);
      setFormOpen(true);
    },
    onPlanos: (e) => router.push(`/manutencao?equipamento=${e.id}`),
    onDeactivate: (e) => {
      if (confirm(`Desativar "${e.nome}"?`)) {
        deactivateEquipamento.mutate(e.id, {
          onSuccess: () => toast.success("Equipamento desativado"),
          onError: () => toast.error("Erro ao desativar equipamento"),
        });
      }
    },
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Equipamentos"
        description="Ativos do condomínio: elevadores, bombas, geradores e mais."
      >
        <Button
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
        >
          <Plus /> Novo Equipamento
        </Button>
      </PageHeader>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, categoria, local..."
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
          data={equipamentos ?? []}
          globalFilter={search}
          onGlobalFilterChange={setSearch}
          emptyMessage="Nenhum equipamento cadastrado ainda."
        />
      )}

      <EquipamentoForm open={formOpen} onOpenChange={setFormOpen} equipamento={editing} />
    </div>
  );
}
