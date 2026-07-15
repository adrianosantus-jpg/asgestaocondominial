import { Settings } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function ConfiguracoesPage() {
  return (
    <ModulePlaceholder
      icon={Settings}
      title="Configurações"
      description="Gestão de usuários e perfis chega nas próximas fases."
    />
  );
}
