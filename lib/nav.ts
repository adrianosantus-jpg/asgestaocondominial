import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Boxes,
  Wrench,
  ClipboardCheck,
  ClipboardList,
  CalendarDays,
  Truck,
  FileBarChart,
  Settings,
  PartyPopper,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Estoque", href: "/estoque", icon: Boxes },
  { title: "Inventário Salões", href: "/inventario-saloes", icon: PartyPopper },
  { title: "Equipamentos", href: "/equipamentos", icon: Wrench },
  { title: "Manutenção", href: "/manutencao", icon: ClipboardCheck },
  { title: "Ordens de Serviço", href: "/os", icon: ClipboardList },
  { title: "Agenda", href: "/agenda", icon: CalendarDays },
  { title: "Fornecedores", href: "/fornecedores", icon: Truck },
  { title: "Relatórios", href: "/relatorios", icon: FileBarChart },
  { title: "Configurações", href: "/configuracoes", icon: Settings },
];
