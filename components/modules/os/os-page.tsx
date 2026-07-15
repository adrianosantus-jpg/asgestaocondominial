"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useOrdensServico, type OsRow } from "@/lib/hooks/use-ordens-servico";
import { OS_STATUS_LABELS } from "@/lib/validations/os";
import { buildOsColumns } from "@/components/modules/os/os-columns";
import { OsForm } from "@/components/modules/os/os-form";
import { OsDetailSheet } from "@/components/modules/os/os-detail-sheet";
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

export function OsPage() {
  const { data: ordens, isLoading } = useOrdensServico();

  useRealtimeInvalidate("ordens_servico", [
    ["ordens_servico"],
    ["ordens_servico", "dashboard"],
    ["agenda_eventos"],
  ]);

  const [search, setSearch] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todas");
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<OsRow | null>(null);

  const columns = buildOsColumns();

  const ordensFiltradas = useMemo(() => {
    if (!ordens) return [];
    if (statusFiltro === "todas") return ordens;
    return ordens.filter((os) => os.status === statusFiltro);
  }, [ordens, statusFiltro]);

  const selectedAtualizada = useMemo(
    () => (selected ? ordens?.find((o) => o.id === selected.id) ?? selected : null),
    [ordens, selected]
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Ordens de Serviço"
        description="Manutenções corretivas e preventivas em execução."
      >
        <Button onClick={() => setFormOpen(true)}>
          <Plus /> Nova OS
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, título..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          items={{ todas: "Todos os status", ...OS_STATUS_LABELS }}
          value={statusFiltro}
          onValueChange={(v) => v && setStatusFiltro(v)}
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos os status</SelectItem>
            {Object.entries(OS_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          data={ordensFiltradas}
          globalFilter={search}
          onGlobalFilterChange={setSearch}
          onRowClick={setSelected}
          emptyMessage="Nenhuma OS aberta ainda."
        />
      )}

      <OsForm open={formOpen} onOpenChange={setFormOpen} />

      {selectedAtualizada && (
        <OsDetailSheet
          open={!!selected}
          onOpenChange={(open) => !open && setSelected(null)}
          os={selectedAtualizada}
        />
      )}
    </div>
  );
}
