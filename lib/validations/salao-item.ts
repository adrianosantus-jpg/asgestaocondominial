import { z } from "zod";

export const SALOES = [
  "Salão Gourmet",
  "Wine Bar",
  "Pub Jogos",
  "Barbecue A",
  "Barbecue B",
  "Salão de Festas Kids",
] as const;

export const SALAO_ITEM_CATEGORIAS = [
  "Louça de Porcelana",
  "Talheres",
  "Copos e Taças",
  "Utensílios de Cozinha",
  "Churrasco",
  "Jogos e Lazer",
  "Kits e Bandejas",
  "Outro",
] as const;

export const salaoItemSchema = z.object({
  salao: z.string().min(1, "Selecione o salão"),
  nome: z.string().min(1, "Informe o nome do item"),
  categoria: z.string().optional(),
  quantidade: z.coerce.number().min(0, "Não pode ser negativo").default(0),
  valor_unitario: z.coerce.number().min(0, "Não pode ser negativo").default(0),
  observacoes: z.string().optional(),
});

export type SalaoItemFormValues = z.input<typeof salaoItemSchema>;
export type SalaoItemInput = z.output<typeof salaoItemSchema>;
