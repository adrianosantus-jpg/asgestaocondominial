import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 9 },
  title: { fontSize: 16, marginBottom: 4, fontWeight: 700 },
  subtitle: { fontSize: 9, marginBottom: 16, color: "#666" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e5e5" },
  headerRow: { flexDirection: "row", backgroundColor: "#f1f5f9", fontWeight: 700 },
  cell: { padding: 6, flexGrow: 1, flexBasis: 0 },
});

function TableDocument({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>{title} — AS Gestão Condominial</Text>
        <Text style={styles.subtitle}>
          Gerado em {new Date().toLocaleString("pt-BR")} · {rows.length} registro(s)
        </Text>

        <View style={styles.headerRow}>
          {columns.map((c) => (
            <Text style={styles.cell} key={c}>
              {c}
            </Text>
          ))}
        </View>

        {rows.map((row, i) => (
          <View style={styles.row} key={i}>
            {row.map((cell, j) => (
              <Text style={styles.cell} key={j}>
                {cell}
              </Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function exportTablePdf(
  title: string,
  columns: string[],
  rows: string[][],
  filename: string
) {
  const blob = await pdf(
    <TableDocument title={title} columns={columns} rows={rows} />
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
