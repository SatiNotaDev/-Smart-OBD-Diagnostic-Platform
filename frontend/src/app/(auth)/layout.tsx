"use client";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageSelector } from "@/components/language/language-selector";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-8 overflow-hidden">
      {/* Background mesh */}
      <div className="pointer-events-none absolute inset-0">
        {/* Large gradient orbs */}
        <div className="absolute -top-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[500px] w-[500px] rounded-full bg-primary/6 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-primary/4 blur-[80px]" />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Theme & Language controls */}
      <div className="absolute right-5 top-5 flex items-center gap-2 z-20">
        <LanguageSelector />
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
