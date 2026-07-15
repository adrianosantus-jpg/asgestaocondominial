// Tipos gerados manualmente a partir das migrations em supabase/migrations,
// seguindo o formato de `supabase gen types typescript --project-id <ref>`.
// Regenerar com o comando acima assim que o CLI estiver logado (supabase
// login) ou o Docker local estiver disponível.

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: string;
  };
  public: {
    Tables: {
      condominios: {
        Row: {
          id: string;
          nome: string;
          cnpj: string | null;
          endereco: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          cnpj?: string | null;
          endereco?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["condominios"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          condominio_id: string;
          nome: string;
          email: string;
          role: Database["public"]["Enums"]["user_role"];
          avatar_url: string | null;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          condominio_id: string;
          nome: string;
          email: string;
          role?: Database["public"]["Enums"]["user_role"];
          avatar_url?: string | null;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "profiles_condominio_id_fkey";
            columns: ["condominio_id"];
            isOneToOne: false;
            referencedRelation: "condominios";
            referencedColumns: ["id"];
          },
        ];
      };
      categorias_produto: {
        Row: {
          id: string;
          condominio_id: string;
          nome: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          condominio_id?: string;
          nome: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["categorias_produto"]["Insert"]
        >;
        Relationships: [];
      };
      produtos: {
        Row: {
          id: string;
          condominio_id: string;
          codigo: string;
          nome: string;
          categoria_id: string | null;
          marca: string | null;
          unidade: string;
          local: string | null;
          quantidade: number;
          estoque_minimo: number;
          estoque_maximo: number | null;
          valor_unitario: number;
          valor_total: number;
          foto_url: string | null;
          codigo_barras: string | null;
          observacoes: string | null;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          condominio_id?: string;
          codigo?: string;
          nome: string;
          categoria_id?: string | null;
          marca?: string | null;
          unidade?: string;
          local?: string | null;
          quantidade?: number;
          estoque_minimo?: number;
          estoque_maximo?: number | null;
          valor_unitario?: number;
          foto_url?: string | null;
          codigo_barras?: string | null;
          observacoes?: string | null;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["produtos"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "produtos_categoria_id_fkey";
            columns: ["categoria_id"];
            isOneToOne: false;
            referencedRelation: "categorias_produto";
            referencedColumns: ["id"];
          },
        ];
      };
      movimentacoes_estoque: {
        Row: {
          id: string;
          condominio_id: string;
          produto_id: string;
          tipo: "entrada" | "saida" | "ajuste" | "inventario";
          quantidade: number;
          motivo: string | null;
          usuario_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          condominio_id?: string;
          produto_id: string;
          tipo: "entrada" | "saida" | "ajuste" | "inventario";
          quantidade: number;
          motivo?: string | null;
          usuario_id?: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["movimentacoes_estoque"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "movimentacoes_estoque_produto_id_fkey";
            columns: ["produto_id"];
            isOneToOne: false;
            referencedRelation: "produtos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "movimentacoes_estoque_usuario_id_fkey";
            columns: ["usuario_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      equipamentos: {
        Row: {
          id: string;
          condominio_id: string;
          nome: string;
          categoria: string;
          foto_url: string | null;
          manual_pdf_url: string | null;
          empresa_responsavel: string | null;
          garantia_fim: string | null;
          data_instalacao: string | null;
          numero_patrimonio: string | null;
          localizacao: string | null;
          fabricante: string | null;
          modelo: string | null;
          numero_serie: string | null;
          observacoes: string | null;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          condominio_id?: string;
          nome: string;
          categoria: string;
          foto_url?: string | null;
          manual_pdf_url?: string | null;
          empresa_responsavel?: string | null;
          garantia_fim?: string | null;
          data_instalacao?: string | null;
          numero_patrimonio?: string | null;
          localizacao?: string | null;
          fabricante?: string | null;
          modelo?: string | null;
          numero_serie?: string | null;
          observacoes?: string | null;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["equipamentos"]["Insert"]>;
        Relationships: [];
      };
      planos_preventivos: {
        Row: {
          id: string;
          condominio_id: string;
          equipamento_id: string;
          titulo: string;
          periodicidade:
            | "diaria"
            | "semanal"
            | "quinzenal"
            | "mensal"
            | "bimestral"
            | "trimestral"
            | "semestral"
            | "anual";
          checklist: string[];
          proxima_execucao: string;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          condominio_id?: string;
          equipamento_id: string;
          titulo: string;
          periodicidade:
            | "diaria"
            | "semanal"
            | "quinzenal"
            | "mensal"
            | "bimestral"
            | "trimestral"
            | "semestral"
            | "anual";
          checklist?: string[];
          proxima_execucao?: string;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["planos_preventivos"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "planos_preventivos_equipamento_id_fkey";
            columns: ["equipamento_id"];
            isOneToOne: false;
            referencedRelation: "equipamentos";
            referencedColumns: ["id"];
          },
        ];
      };
      execucoes_preventivas: {
        Row: {
          id: string;
          condominio_id: string;
          plano_id: string;
          data_execucao: string;
          checklist_resultado: { item: string; ok: boolean }[];
          fotos_antes: string[];
          fotos_depois: string[];
          assinatura_url: string | null;
          observacoes: string | null;
          executado_por: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          condominio_id?: string;
          plano_id: string;
          data_execucao?: string;
          checklist_resultado?: { item: string; ok: boolean }[];
          fotos_antes?: string[];
          fotos_depois?: string[];
          assinatura_url?: string | null;
          observacoes?: string | null;
          executado_por?: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["execucoes_preventivas"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "execucoes_preventivas_plano_id_fkey";
            columns: ["plano_id"];
            isOneToOne: false;
            referencedRelation: "planos_preventivos";
            referencedColumns: ["id"];
          },
        ];
      };
      agenda_eventos: {
        Row: {
          id: string;
          condominio_id: string;
          tipo:
            | "preventiva"
            | "corretiva"
            | "reuniao"
            | "assembleia"
            | "garantia"
            | "contrato"
            | "laudo"
            | "vistoria";
          titulo: string;
          data_hora: string;
          referencia_tipo: string | null;
          referencia_id: string | null;
          descricao: string | null;
          concluido: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          condominio_id?: string;
          tipo:
            | "preventiva"
            | "corretiva"
            | "reuniao"
            | "assembleia"
            | "garantia"
            | "contrato"
            | "laudo"
            | "vistoria";
          titulo: string;
          data_hora: string;
          referencia_tipo?: string | null;
          referencia_id?: string | null;
          descricao?: string | null;
          concluido?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["agenda_eventos"]["Insert"]
        >;
        Relationships: [];
      };
      fornecedores: {
        Row: {
          id: string;
          condominio_id: string;
          nome: string;
          pessoa_contato: string | null;
          telefone: string | null;
          whatsapp: string | null;
          email: string | null;
          especialidade: string | null;
          cnpj: string | null;
          contrato_url: string | null;
          data_vencimento_contrato: string | null;
          avaliacao: number | null;
          observacoes: string | null;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          condominio_id?: string;
          nome: string;
          pessoa_contato?: string | null;
          telefone?: string | null;
          whatsapp?: string | null;
          email?: string | null;
          especialidade?: string | null;
          cnpj?: string | null;
          contrato_url?: string | null;
          data_vencimento_contrato?: string | null;
          avaliacao?: number | null;
          observacoes?: string | null;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["fornecedores"]["Insert"]>;
        Relationships: [];
      };
      salao_itens: {
        Row: {
          id: string;
          condominio_id: string;
          salao: string;
          nome: string;
          categoria: string | null;
          quantidade: number;
          valor_unitario: number;
          valor_total: number;
          observacoes: string | null;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          condominio_id?: string;
          salao: string;
          nome: string;
          categoria?: string | null;
          quantidade?: number;
          valor_unitario?: number;
          observacoes?: string | null;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["salao_itens"]["Insert"]>;
        Relationships: [];
      };
      saloes: {
        Row: {
          id: string;
          condominio_id: string;
          nome: string;
          foto_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          condominio_id?: string;
          nome: string;
          foto_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["saloes"]["Insert"]>;
        Relationships: [];
      };
      ordens_servico: {
        Row: {
          id: string;
          condominio_id: string;
          numero: string;
          equipamento_id: string | null;
          plano_id: string | null;
          fornecedor_id: string | null;
          tipo: "preventiva" | "corretiva";
          titulo: string;
          descricao: string | null;
          status:
            | "aberta"
            | "em_andamento"
            | "aguardando_fornecedor"
            | "aguardando_material"
            | "concluida"
            | "cancelada";
          prioridade: "baixa" | "media" | "alta" | "urgente";
          responsavel_id: string | null;
          aberto_por: string;
          data_abertura: string;
          data_conclusao: string | null;
          tempo_gasto_minutos: number | null;
          custo_mao_obra: number;
          custo_materiais: number;
          custo_total: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          condominio_id?: string;
          numero?: string;
          equipamento_id?: string | null;
          plano_id?: string | null;
          fornecedor_id?: string | null;
          tipo: "preventiva" | "corretiva";
          titulo: string;
          descricao?: string | null;
          status?:
            | "aberta"
            | "em_andamento"
            | "aguardando_fornecedor"
            | "aguardando_material"
            | "concluida"
            | "cancelada";
          prioridade?: "baixa" | "media" | "alta" | "urgente";
          responsavel_id?: string | null;
          aberto_por?: string;
          data_abertura?: string;
          data_conclusao?: string | null;
          tempo_gasto_minutos?: number | null;
          custo_mao_obra?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["ordens_servico"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "ordens_servico_equipamento_id_fkey";
            columns: ["equipamento_id"];
            isOneToOne: false;
            referencedRelation: "equipamentos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ordens_servico_fornecedor_id_fkey";
            columns: ["fornecedor_id"];
            isOneToOne: false;
            referencedRelation: "fornecedores";
            referencedColumns: ["id"];
          },
        ];
      };
      os_materiais: {
        Row: {
          id: string;
          condominio_id: string;
          os_id: string;
          produto_id: string;
          quantidade: number;
          custo_unitario: number;
          custo: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          condominio_id?: string;
          os_id: string;
          produto_id: string;
          quantidade: number;
          custo_unitario?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["os_materiais"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "os_materiais_produto_id_fkey";
            columns: ["produto_id"];
            isOneToOne: false;
            referencedRelation: "produtos";
            referencedColumns: ["id"];
          },
        ];
      };
      os_midias: {
        Row: {
          id: string;
          condominio_id: string;
          os_id: string;
          tipo: "foto" | "video" | "pdf";
          url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          condominio_id?: string;
          os_id: string;
          tipo: "foto" | "video" | "pdf";
          url: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["os_midias"]["Insert"]>;
        Relationships: [];
      };
      notificacoes: {
        Row: {
          id: string;
          condominio_id: string;
          tipo: string;
          titulo: string;
          mensagem: string | null;
          link: string | null;
          lida: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          condominio_id?: string;
          tipo: string;
          titulo: string;
          mensagem?: string | null;
          link?: string | null;
          lida?: boolean;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["notificacoes"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "admin" | "gestor" | "sindico" | "zelador" | "auxiliar";
    };
    CompositeTypes: Record<string, never>;
  };
};
