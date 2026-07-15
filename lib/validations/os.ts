import { z } from "zod";

export type OsStatus =
  | "aberta"
  | "em_andamento"
  | "aguardando_fornecedor"
  | "aguardando_material"
  | "concluida"
  | "cancelada";

export const OS_STATUS_LABELS: Record<string, string> = {
  aberta: "Aberta",
  em_andamento: "Em andamento",
  aguardando_fornecedor: "Aguardando fornecedor",
  aguardando_material: "Aguardando material",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export const OS_PRIORIDADE_LABELS: Record<string, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

export const osSchema = z.object({
  tipo: z.enum(["preventiva", "corretiva"]),
  titulo: z.string().min(1, "Informe o título"),
  descricao: z.string().optional(),
  equipamento_id: z.string().uuid().nullable().optional(),
  plano_id: z.string().uuid().nullable().optional(),
  fornecedor_id: z.string().uuid().nullable().optional(),
  prioridade: z.enum(["baixa", "media", "alta", "urgente"]).default("media"),
});

export type OsFormValues = z.input<typeof osSchema>;
export type OsInput = z.output<typeof osSchema>;

export const osMaterialSchema = z.object({
  produto_id: z.string().uuid("Selecione o produto"),
  quantidade: z.coerce.number().positive("Informe uma quantidade válida"),
});

export type OsMaterialFormValues = z.input<typeof osMaterialSchema>;
export type OsMaterialInput = z.output<typeof osMaterialSchema>;

export const osConclusaoSchema = z.object({
  tempo_gasto_minutos: z.coerce.number().int().min(0).optional(),
  custo_mao_obra: z.coerce.number().min(0).default(0),
});

export type OsConclusaoFormValues = z.input<typeof osConclusaoSchema>;
export type OsConclusaoInput = z.output<typeof osConclusaoSchema>;
