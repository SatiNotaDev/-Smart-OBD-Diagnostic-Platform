"use client";

import { useI18n, type Locale } from "@/lib/i18n/i18n";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const flags: Record<Locale, string> = {
  en: "EN",
  ru: "RU",
  fr: "FR",
};

export function LanguageSelector() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 items-center gap-1.5 rounded-[var(--radius)] border border-border bg-card px-3 text-sm text-muted hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
        aria-label="Select language"
      >
        <Globe size={14} />
        <span className="font-medium">{flags[locale]}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-28 rounded-[var(--radius)] border border-border bg-card shadow-lg overflow-hidden">
          {(Object.keys(flags) as Locale[]).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLocale(lang);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors cursor-pointer ${
                locale === lang
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              {flags[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
