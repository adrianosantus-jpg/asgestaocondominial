"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Boxes, ClipboardList, PartyPopper, Truck, Wrench } from "lucide-react";
import { useProdutos } from "@/lib/hooks/use-produtos";
import { useEquipamentos } from "@/lib/hooks/use-equipamentos";
import { useOrdensServico } from "@/lib/hooks/use-ordens-servico";
import { useFornecedores } from "@/lib/hooks/use-fornecedores";
import { useSalaoItens } from "@/lib/hooks/use-salao-itens";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { data: produtos } = useProdutos();
  const { data: equipamentos } = useEquipamentos();
  const { data: ordens } = useOrdensServico();
  const { data: fornecedores } = useFornecedores();
  const { data: itensSalao } = useSalaoItens();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    function onOpenEvent() {
      setOpen(true);
    }
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("open-command-palette", onOpenEvent);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-command-palette", onOpenEvent);
    };
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Busca global"
      description="Pesquise produtos, equipamentos, OS, fornecedores e itens dos salões"
    >
      <Command>
        <CommandInput placeholder="Buscar em todos os módulos..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

          <CommandGroup heading="Estoque">
            {produtos?.slice(0, 30).map((p) => (
              <CommandItem
                key={p.id}
                value={`${p.codigo} ${p.nome}`}
                onSelect={() => go("/estoque")}
              >
                <Boxes /> {p.nome}
                <span className="ml-auto text-xs text-muted-foreground">{p.codigo}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Equipamentos">
            {equipamentos?.slice(0, 30).map((e) => (
              <CommandItem
                key={e.id}
                value={e.nome}
                onSelect={() => go(`/manutencao?equipamento=${e.id}`)}
              >
                <Wrench /> {e.nome}
                <span className="ml-auto text-xs text-muted-foreground">
                  {e.categoria}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Ordens de Serviço">
            {ordens?.slice(0, 30).map((os) => (
              <CommandItem
                key={os.id}
                value={`${os.numero} ${os.titulo}`}
                onSelect={() => go("/os")}
              >
                <ClipboardList /> {os.numero} — {os.titulo}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Fornecedores">
            {fornecedores?.slice(0, 30).map((f) => (
              <CommandItem
                key={f.id}
                value={f.nome}
                onSelect={() => go("/fornecedores")}
              >
                <Truck /> {f.nome}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Inventário Salões">
            {itensSalao?.slice(0, 30).map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.salao} ${item.nome}`}
                onSelect={() => go("/inventario-saloes")}
              >
                <PartyPopper /> {item.nome}
                <span className="ml-auto text-xs text-muted-foreground">{item.salao}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
