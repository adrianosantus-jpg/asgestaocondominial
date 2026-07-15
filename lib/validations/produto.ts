import { z } from "zod";

export const produtoSchema = z.object({
  nome: z.string().min(1, "Informe o nome do produto"),
  categoria_id: z.string().uuid().nullable().optional(),
  marca: z.string().optional(),
  unidade: z.string().min(1, "Informe a unidade").default("un"),
  local: z.string().optional(),
  estoque_minimo: z.coerce.number().min(0, "Não pode ser negativo").default(0),
  estoque_maximo: z.coerce.number().min(0).nullable().optional(),
  valor_unitario: z.coerce.number().min(0, "Não pode ser negativo").default(0),
  codigo_barras: z.string().optional(),
  observacoes: z.string().optional(),
});

// Tipo "de entrada" (antes da coerção) — usar em useForm<>.
export type ProdutoFormValues = z.input<typeof produtoSchema>;
// Tipo "de saída" (depois da coerção) — usar no onSubmit / payload da mutation.
export type ProdutoInput = z.output<typeof produtoSchema>;

export const movimentacaoSchema = z.object({
  tipo: z.enum(["entrada", "saida", "ajuste", "inventario"]),
  quantidade: z.coerce.number(),
  motivo: z.string().min(1, "Informe o motivo"),
}).refine((data) => data.quantidade !== 0, {
  message: "Informe uma quantidade",
  path: ["quantidade"],
});

export type MovimentacaoFormValues = z.input<typeof movimentacaoSchema>;
export type MovimentacaoInput = z.output<typeof movimentacaoSchema>;

export const categoriaSchema = z.object({
  nome: z.string().min(1, "Informe o nome da categoria"),
});

export type CategoriaInput = z.infer<typeof categoriaSchema>;
