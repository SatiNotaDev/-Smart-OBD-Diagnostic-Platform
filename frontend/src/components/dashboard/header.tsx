"use client";

import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageSelector } from "@/components/language/language-selector";

interface HeaderProps {
  title: string;
  onMenuToggle: () => void;
}

export function Header({ title, onMenuToggle }: HeaderProps) {
  return (
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-border px-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1 text-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-sm font-medium text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-1">
        <LanguageSelector />
        <ThemeToggle />
      </div>
    </header>
  );
}
