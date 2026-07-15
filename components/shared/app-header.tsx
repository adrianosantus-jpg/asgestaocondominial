"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/shared/user-menu";
import { NotificationsBell } from "@/components/shared/notifications-bell";
import { NAV_ITEMS } from "@/lib/nav";

export function AppHeader({
  profile,
}: {
  profile: { nome: string; email: string; role: string };
}) {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((item) => pathname.startsWith(item.href));

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="text-sm font-medium">{current?.title ?? "AS Gestão"}</h1>

      <Button
        variant="outline"
        size="sm"
        className="ml-4 hidden text-muted-foreground sm:flex"
        onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
      >
        <Search />
        Buscar em todos os módulos...
        <kbd className="ml-auto rounded border bg-muted px-1.5 text-[10px]">
          ⌘K
        </kbd>
      </Button>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
        >
          <Search className="size-4" />
        </Button>
        <NotificationsBell />
        <ThemeToggle />
        <UserMenu {...profile} />
      </div>
    </header>
  );
}
