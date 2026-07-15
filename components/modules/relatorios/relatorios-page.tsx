"use client";

import { useMemo, useState } from "react";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { useProdutos } from "@/lib/hooks/use-produtos";
import { useRelatorioManutencao } from "@/lib/hooks/use-relatorio-manutencao";
import { useOrdensServico } from "@/lib/hooks/use-ordens-servico";
import { useEquipamentos } from "@/lib/hooks/use-equipamentos";
import { useFornecedores } from "@/lib/hooks/use-fornecedores";
import { OS_STATUS_LABELS } from "@/lib/validations/os";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportCsv } from "@/lib/export/csv";

async function exportExcel(...args: Parameters<typeof import("@/lib/export/excel").exportExcel>) {
  const { exportExcel: fn } = await import("@/lib/export/excel");
  fn(...args);
}

async function exportTablePdf(...args: Parameters<typeof import("@/lib/export/table-pdf").exportTablePdf>) {
  const { exportTablePdf: fn } = await import("@/lib/export/table-pdf");
  return fn(...args);
}

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const TODOS = "__todos__";

function dentroDoPeriodo(data: string, inicio: string, fim: string) {
  const d = new Date(data);
  if (inicio && d < new Date(inicio)) return false;
  if (fim && d > new Date(fim + "T23:59:59")) return false;
  return true;
}

function ExportButtons({
  onCsv,
  onExcel,
  onPdf,
  disabled,
}: {
  onCsv: () => void;
  onExcel: () => void;
  onPdf: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" disabled={disabled} onClick={onCsv}>
        <FileText /> CSV
      </Button>
      <Button variant="outline" size="sm" disabled={disabled} onClick={onExcel}>
        <FileSpreadsheet /> Excel
      </Button>
      <Button variant="outline" size="sm" disabled={disabled} onClick={onPdf}>
        <FileDown /> PDF
      </Button>
    </div>
  );
}

export function RelatoriosPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Relatórios"
        description="Relatórios consolidados de estoque, manutenção e ordens de serviço."
      />

      <Tabs defaultValue="estoque">
        <TabsList>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
          <TabsTrigger value="manutencao">Manutenção</TabsTrigger>
          <TabsTrigger value="os">Ordens de Serviço</TabsTrigger>
        </TabsList>

        <TabsContent value="estoque">
          <RelatorioEstoque />
        </TabsContent>
        <TabsContent value="manutencao">
          <RelatorioManutencao />
        </TabsContent>
        <TabsContent value="os">
          <RelatorioOs />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RelatorioEstoque() {
  const { data: produtos } = useProdutos();
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    if (!produtos) return [];
    if (!busca) return produtos;
    const term = busca.toLowerCase();
    return produtos.filter(
      (p) =>
        p.nome.toLowerCase().includes(term) ||
        p.codigo.toLowerCase().includes(term)
    );
  }, [produtos, busca]);

  function toRows() {
    return filtrados.map((p) => ({
      Código: p.codigo,
      Nome: p.nome,
      Categoria: p.categorias_produto?.nome ?? "",
      Local: p.local ?? "",
      Quantidade: p.quantidade,
      Unidade: p.unidade,
      "Valor Unitário": p.valor_unitario,
      "Valor Total": p.valor_total,
    }));
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="busca-estoque">Buscar</Label>
            <Input
              id="busca-estoque"
              className="w-64"
              placeholder="Nome ou código..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <ExportButtons
            disabled={filtrados.length === 0}
            onCsv={() => exportCsv("relatorio-estoque.csv", toRows())}
            onExcel={() => exportExcel("relatorio-estoque.xlsx", "Estoque", toRows())}
            onPdf={() =>
              exportTablePdf(
                "Relatório de Estoque",
                ["Código", "Nome", "Categoria", "Local", "Qtd.", "Valor Total"],
                filtrados.map((p) => [
                  p.codigo,
                  p.nome,
                  p.categorias_produto?.nome ?? "-",
                  p.local ?? "-",
                  `${p.quantidade} ${p.unidade}`,
                  currency.format(p.valor_total),
                ]),
                "relatorio-estoque.pdf"
              )
            }
          />
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Valor total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.codigo}</TableCell>
                  <TableCell>{p.nome}</TableCell>
                  <TableCell>{p.categorias_produto?.nome ?? "—"}</TableCell>
                  <TableCell>
                    {p.quantidade} {p.unidade}
                  </TableCell>
                  <TableCell>{currency.format(p.valor_total)}</TableCell>
                </TableRow>
              ))}
              {filtrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function RelatorioManutencao() {
  const { data: execucoes } = useRelatorioManutencao();
  const { data: equipamentos } = useEquipamentos();
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [equipamentoFiltro, setEquipamentoFiltro] = useState(TODOS);

  const filtrados = useMemo(() => {
    if (!execucoes) return [];
    return execucoes.filter((e) => {
      if (!dentroDoPeriodo(e.data_execucao, inicio, fim)) return false;
      if (
        equipamentoFiltro !== TODOS &&
        e.planos_preventivos?.equipamento_id !== equipamentoFiltro
      )
        return false;
      return true;
    });
  }, [execucoes, inicio, fim, equipamentoFiltro]);

  function toRows() {
    return filtrados.map((e) => ({
      Data: new Date(e.data_execucao).toLocaleDateString("pt-BR"),
      Plano: e.planos_preventivos?.titulo ?? "",
      Equipamento: e.planos_preventivos?.equipamentos?.nome ?? "",
      Executado_por: e.profiles?.nome ?? "",
      Observações: e.observacoes ?? "",
    }));
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="inicio-manutencao">De</Label>
              <Input id="inicio-manutencao" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fim-manutencao">Até</Label>
              <Input id="fim-manutencao" type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Equipamento</Label>
              <Select
                items={{
                  [TODOS]: "Todos",
                  ...Object.fromEntries((equipamentos ?? []).map((eq) => [eq.id, eq.nome])),
                }}
                value={equipamentoFiltro}
                onValueChange={(v) => v && setEquipamentoFiltro(v)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>Todos</SelectItem>
                  {equipamentos?.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ExportButtons
            disabled={filtrados.length === 0}
            onCsv={() => exportCsv("relatorio-manutencao.csv", toRows())}
            onExcel={() => exportExcel("relatorio-manutencao.xlsx", "Manutenção", toRows())}
            onPdf={() =>
              exportTablePdf(
                "Relatório de Manutenção",
                ["Data", "Plano", "Equipamento", "Executado por"],
                filtrados.map((e) => [
                  new Date(e.data_execucao).toLocaleDateString("pt-BR"),
                  e.planos_preventivos?.titulo ?? "-",
                  e.planos_preventivos?.equipamentos?.nome ?? "-",
                  e.profiles?.nome ?? "-",
                ]),
                "relatorio-manutencao.pdf"
              )
            }
          />
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead>Executado por</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{new Date(e.data_execucao).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{e.planos_preventivos?.titulo ?? "—"}</TableCell>
                  <TableCell>{e.planos_preventivos?.equipamentos?.nome ?? "—"}</TableCell>
                  <TableCell>{e.profiles?.nome ?? "—"}</TableCell>
                </TableRow>
              ))}
              {filtrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                    Nenhuma execução encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function RelatorioOs() {
  const { data: ordens } = useOrdensServico();
  const { data: equipamentos } = useEquipamentos();
  const { data: fornecedores } = useFornecedores();
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [equipamentoFiltro, setEquipamentoFiltro] = useState(TODOS);
  const [fornecedorFiltro, setFornecedorFiltro] = useState(TODOS);

  const filtrados = useMemo(() => {
    if (!ordens) return [];
    return ordens.filter((os) => {
      if (!dentroDoPeriodo(os.data_abertura, inicio, fim)) return false;
      if (equipamentoFiltro !== TODOS && os.equipamento_id !== equipamentoFiltro) return false;
      if (fornecedorFiltro !== TODOS && os.fornecedor_id !== fornecedorFiltro) return false;
      return true;
    });
  }, [ordens, inicio, fim, equipamentoFiltro, fornecedorFiltro]);

  const totalCusto = filtrados.reduce((acc, os) => acc + os.custo_total, 0);

  function toRows() {
    return filtrados.map((os) => ({
      Número: os.numero,
      Título: os.titulo,
      Status: OS_STATUS_LABELS[os.status],
      Equipamento: os.equipamentos?.nome ?? "",
      Fornecedor: os.fornecedores?.nome ?? "",
      Abertura: new Date(os.data_abertura).toLocaleDateString("pt-BR"),
      Custo: os.custo_total,
    }));
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="inicio-os">De</Label>
              <Input id="inicio-os" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fim-os">Até</Label>
              <Input id="fim-os" type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Equipamento</Label>
              <Select
                items={{
                  [TODOS]: "Todos",
                  ...Object.fromEntries((equipamentos ?? []).map((eq) => [eq.id, eq.nome])),
                }}
                value={equipamentoFiltro}
                onValueChange={(v) => v && setEquipamentoFiltro(v)}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>Todos</SelectItem>
                  {equipamentos?.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Fornecedor</Label>
              <Select
                items={{
                  [TODOS]: "Todos",
                  ...Object.fromEntries((fornecedores ?? []).map((f) => [f.id, f.nome])),
                }}
                value={fornecedorFiltro}
                onValueChange={(v) => v && setFornecedorFiltro(v)}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>Todos</SelectItem>
                  {fornecedores?.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ExportButtons
            disabled={filtrados.length === 0}
            onCsv={() => exportCsv("relatorio-os.csv", toRows())}
            onExcel={() => exportExcel("relatorio-os.xlsx", "OS", toRows())}
            onPdf={() =>
              exportTablePdf(
                "Relatório de Ordens de Serviço",
                ["Número", "Título", "Status", "Equipamento", "Fornecedor", "Custo"],
                filtrados.map((os) => [
                  os.numero,
                  os.titulo,
                  OS_STATUS_LABELS[os.status],
                  os.equipamentos?.nome ?? "-",
                  os.fornecedores?.nome ?? "-",
                  currency.format(os.custo_total),
                ]),
                "relatorio-os.pdf"
              )
            }
          />
        </div>

        <p className="text-sm text-muted-foreground">
          {filtrados.length} OS · Custo total: {currency.format(totalCusto)}
        </p>

        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Custo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((os) => (
                <TableRow key={os.id}>
                  <TableCell>{os.numero}</TableCell>
                  <TableCell>{os.titulo}</TableCell>
                  <TableCell>{OS_STATUS_LABELS[os.status]}</TableCell>
                  <TableCell>{os.equipamentos?.nome ?? "—"}</TableCell>
                  <TableCell>{os.fornecedores?.nome ?? "—"}</TableCell>
                  <TableCell>{currency.format(os.custo_total)}</TableCell>
                </TableRow>
              ))}
              {filtrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
                    Nenhuma OS encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
