"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/dashboard/protected-route";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { useI18n } from "@/lib/i18n/i18n";

const pageTitles: Record<string, string> = {
  "/": "dashboard.sidebar.dashboard",
  "/vehicles": "dashboard.vehicles.title",
  "/settings": "dashboard.settings.title",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useI18n();

  const titleKey = pageTitles[pathname] || "dashboard.sidebar.dashboard";

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-surface">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col min-w-0">
          <Header
            title={t(titleKey)}
            onMenuToggle={() => setSidebarOpen(true)}
          />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
