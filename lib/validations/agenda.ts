import { z } from "zod";

export const AGENDA_TIPO_LABELS: Record<string, string> = {
  preventiva: "Preventiva",
  corretiva: "Corretiva",
  reuniao: "Reunião",
  assembleia: "Assembleia",
  garantia: "Garantia",
  contrato: "Contrato",
  laudo: "Laudo",
  vistoria: "Vistoria",
};

export const MANUAL_AGENDA_TIPOS = [
  "reuniao",
  "assembleia",
  "laudo",
  "vistoria",
  "contrato",
] as const;

export const agendaEventoSchema = z.object({
  tipo: z.enum(MANUAL_AGENDA_TIPOS),
  titulo: z.string().min(1, "Informe o título"),
  data_hora: z.string().min(1, "Informe a data"),
  descricao: z.string().optional(),
});

export type AgendaEventoInput = z.infer<typeof agendaEventoSchema>;
