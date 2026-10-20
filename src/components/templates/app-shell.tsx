"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dices,
  Home,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
} from "lucide-react";

import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";

const NAV = [{ href: "/", icon: Home, label: "Início" }] as const;

const COLLAPSED_KEY = "game-night:sidebar-collapsed";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // A escolha vale para as próximas visitas, não só para esta tela.
  const [collapsed, setCollapsed] = useLocalStorage<boolean>(
    COLLAPSED_KEY,
    false,
  );

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <Sidebar
        pathname={pathname}
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />
      <main className="flex-1 pb-20 md:pb-0">
        <MobileTopBar />
        <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
      <BottomNav pathname={pathname} />
    </div>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Alternar tema"
      title="Alternar tema"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}

function Brand({
  className,
  compact,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        compact && "justify-center",
        className,
      )}
    >
      <Dices className="h-5 w-5 shrink-0 text-primary" />
      {compact ? null : (
        <span className="truncate text-sm font-semibold tracking-tight">
          Sala de Jogos
        </span>
      )}
    </div>
  );
}

function MobileTopBar() {
  return (
    <div className="sticky top-0 z-20 flex h-12 items-center justify-between gap-2 border-b border-border bg-background/95 px-4 backdrop-blur md:hidden">
      <Brand />
      <ThemeToggle />
    </div>
  );
}

function Sidebar({
  pathname,
  collapsed,
  onToggle,
}: {
  pathname: string;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-sidebar py-4 transition-[width] duration-200 md:flex",
        collapsed ? "w-16 px-2" : "w-60 px-3",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1",
          collapsed ? "flex-col" : "justify-between",
        )}
      >
        <Brand className={cn(collapsed ? "py-1" : "px-2")} compact={collapsed} />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggle}
              aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
              aria-expanded={!collapsed}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {collapsed ? "Expandir menu" : "Recolher menu"}
          </TooltipContent>
        </Tooltip>
      </div>

      <Separator className="my-2" />

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          const link = (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "flex items-center gap-3 rounded-md py-2 text-sm transition-colors",
                collapsed ? "justify-center px-0" : "px-3",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {collapsed ? null : item.label}
            </Link>
          );

          if (!collapsed) return link;
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <Separator className="my-2" />

      <div
        className={cn(
          "flex items-center",
          collapsed ? "justify-center" : "justify-between px-1",
        )}
      >
        {collapsed ? null : (
          <span className="text-xs text-muted-foreground">Tema</span>
        )}
        <ThemeToggle />
      </div>
    </aside>
  );
}

function BottomNav({ pathname }: { pathname: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="flex items-stretch">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[11px] transition-colors",
                active
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-primary")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
