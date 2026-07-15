"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  useFornecedores,
  useDeactivateFornecedor,
  type FornecedorRow,
} from "@/lib/hooks/use-fornecedores";
import { buildFornecedoresColumns } from "@/components/modules/fornecedores/fornecedores-columns";
import { FornecedorForm } from "@/components/modules/fornecedores/fornecedor-form";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export function FornecedoresPage() {
  const { data: fornecedores, isLoading } = useFornecedores();
  const deactivateFornecedor = useDeactivateFornecedor();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FornecedorRow | undefined>();

  const columns = buildFornecedoresColumns({
    onEdit: (f) => {
      setEditing(f);
      setFormOpen(true);
    },
    onDeactivate: (f) => {
      if (confirm(`Desativar "${f.nome}"?`)) {
        deactivateFornecedor.mutate(f.id, {
          onSuccess: () => toast.success("Fornecedor desativado"),
          onError: () => toast.error("Erro ao desativar fornecedor"),
        });
      }
    },
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Fornecedores"
        description="Prestadores de serviço e empresas contratadas."
      >
        <Button
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
        >
          <Plus /> Novo Fornecedor
        </Button>
      </PageHeader>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, especialidade..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={fornecedores ?? []}
          globalFilter={search}
          onGlobalFilterChange={setSearch}
          emptyMessage="Nenhum fornecedor cadastrado ainda."
        />
      )}

      <FornecedorForm open={formOpen} onOpenChange={setFormOpen} fornecedor={editing} />
    </div>
  );
}
