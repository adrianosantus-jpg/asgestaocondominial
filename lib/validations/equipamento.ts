import { z } from "zod";
import { optionalDate } from "@/lib/validations/utils";

export const EQUIPAMENTO_CATEGORIAS = [
  "Elevador",
  "Bomba",
  "Gerador",
  "Piscina",
  "Portão",
  "CFTV",
  "Controle de acesso",
  "Ar-condicionado",
  "Sauna",
  "Academia",
  "SPDA",
  "Bomba de incêndio",
  "Central de incêndio",
  "Reservatório",
  "Outro",
] as const;

export const equipamentoSchema = z.object({
  nome: z.string().min(1, "Informe o nome do equipamento"),
  categoria: z.string().min(1, "Selecione a categoria"),
  empresa_responsavel: z.string().optional(),
  garantia_fim: optionalDate,
  data_instalacao: optionalDate,
  numero_patrimonio: z.string().optional(),
  localizacao: z.string().optional(),
  fabricante: z.string().optional(),
  modelo: z.string().optional(),
  numero_serie: z.string().optional(),
  observacoes: z.string().optional(),
});

export type EquipamentoFormValues = z.input<typeof equipamentoSchema>;
export type EquipamentoInput = z.output<typeof equipamentoSchema>;
