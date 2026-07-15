import { z } from "zod";

// Inputs <input type="date"> vazios enviam "" (não undefined). Colunas
// `date` no Postgres rejeitam "" — precisa virar undefined para a coluna
// ficar NULL em vez de dar erro de sintaxe.
export const optionalDate = z
  .string()
  .optional()
  .transform((v) => (v ? v : undefined));
