"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { I18nProvider } from "@/lib/i18n/i18n";
import { AuthProvider } from "@/lib/auth/auth-context";
import { QueryProvider } from "@/lib/query/query-provider";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <I18nProvider>
          <ToastProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ToastProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
