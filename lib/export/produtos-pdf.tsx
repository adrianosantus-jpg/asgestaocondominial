import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import type { ProdutoRow } from "@/lib/hooks/use-produtos";

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 9 },
  title: { fontSize: 16, marginBottom: 4, fontWeight: 700 },
  subtitle: { fontSize: 9, marginBottom: 16, color: "#666" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e5e5" },
  headerRow: { flexDirection: "row", backgroundColor: "#f1f5f9", fontWeight: 700 },
  cell: { padding: 6, flexGrow: 1, flexBasis: 0 },
  cellWide: { padding: 6, flexGrow: 2, flexBasis: 0 },
});

function ProdutosDocument({ produtos }: { produtos: ProdutoRow[] }) {
  const valorTotal = produtos.reduce((acc, p) => acc + p.valor_total, 0);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>Relatório de Estoque — AS Gestão Condominial</Text>
        <Text style={styles.subtitle}>
          Gerado em {new Date().toLocaleString("pt-BR")} · {produtos.length}{" "}
          produto(s) · Valor total: R$ {valorTotal.toFixed(2)}
        </Text>

        <View style={styles.headerRow}>
          <Text style={styles.cell}>Código</Text>
          <Text style={styles.cellWide}>Nome</Text>
          <Text style={styles.cell}>Categoria</Text>
          <Text style={styles.cell}>Local</Text>
          <Text style={styles.cell}>Qtd.</Text>
          <Text style={styles.cell}>Mínimo</Text>
          <Text style={styles.cell}>Vlr. Unit.</Text>
          <Text style={styles.cell}>Vlr. Total</Text>
        </View>

        {produtos.map((p) => (
          <View style={styles.row} key={p.id}>
            <Text style={styles.cell}>{p.codigo}</Text>
            <Text style={styles.cellWide}>{p.nome}</Text>
            <Text style={styles.cell}>{p.categorias_produto?.nome ?? "-"}</Text>
            <Text style={styles.cell}>{p.local ?? "-"}</Text>
            <Text style={styles.cell}>
              {p.quantidade} {p.unidade}
            </Text>
            <Text style={styles.cell}>{p.estoque_minimo}</Text>
            <Text style={styles.cell}>R$ {p.valor_unitario.toFixed(2)}</Text>
            <Text style={styles.cell}>R$ {p.valor_total.toFixed(2)}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function exportProdutosPdf(produtos: ProdutoRow[]) {
  const blob = await pdf(<ProdutosDocument produtos={produtos} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `estoque-${new Date().toISOString().slice(0, 10)}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
