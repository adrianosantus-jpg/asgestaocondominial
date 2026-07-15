import * as XLSX from "xlsx";
import type { ProdutoRow } from "@/lib/hooks/use-produtos";

export function exportProdutosExcel(produtos: ProdutoRow[]) {
  const rows = produtos.map((p) => ({
    Código: p.codigo,
    Nome: p.nome,
    Categoria: p.categorias_produto?.nome ?? "",
    Marca: p.marca ?? "",
    Unidade: p.unidade,
    Local: p.local ?? "",
    Quantidade: p.quantidade,
    "Estoque Mínimo": p.estoque_minimo,
    "Estoque Máximo": p.estoque_maximo ?? "",
    "Valor Unitário": p.valor_unitario,
    "Valor Total": p.valor_total,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Estoque");
  XLSX.writeFile(workbook, `estoque-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
