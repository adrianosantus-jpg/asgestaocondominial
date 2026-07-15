import { z } from "zod";

export const PERIODICIDADE_LABELS: Record<string, string> = {
  diaria: "Diária",
  semanal: "Semanal",
  quinzenal: "Quinzenal",
  mensal: "Mensal",
  bimestral: "Bimestral",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
};

export const planoPreventivoSchema = z.object({
  equipamento_id: z.string().uuid("Selecione o equipamento"),
  titulo: z.string().min(1, "Informe o título do plano"),
  periodicidade: z.enum([
    "diaria",
    "semanal",
    "quinzenal",
    "mensal",
    "bimestral",
    "trimestral",
    "semestral",
    "anual",
  ]),
  checklist: z.array(z.string().min(1)).default([]),
});

export type PlanoPreventivoFormValues = z.input<typeof planoPreventivoSchema>;
export type PlanoPreventivoInput = z.output<typeof planoPreventivoSchema>;

export const execucaoPreventivaSchema = z.object({
  observacoes: z.string().optional(),
});

export type ExecucaoPreventivaInput = z.infer<typeof execucaoPreventivaSchema>;
