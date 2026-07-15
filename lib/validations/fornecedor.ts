import { z } from "zod";
import { optionalDate } from "@/lib/validations/utils";

export const fornecedorSchema = z.object({
  nome: z.string().min(1, "Informe o nome do fornecedor"),
  pessoa_contato: z.string().optional(),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  especialidade: z.string().optional(),
  cnpj: z.string().optional(),
  data_vencimento_contrato: optionalDate,
  avaliacao: z.coerce.number().int().min(1).max(5).nullable().optional(),
  observacoes: z.string().optional(),
});

export type FornecedorFormValues = z.input<typeof fornecedorSchema>;
export type FornecedorInput = z.output<typeof fornecedorSchema>;
