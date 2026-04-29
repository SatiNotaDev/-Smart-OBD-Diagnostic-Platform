"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Car, Settings, LogOut, X } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n } from "@/lib/i18n/i18n";
import { cn } from "@/lib/utils/cn";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { href: "/overview", icon: LayoutDashboard, labelKey: "dashboard.sidebar.dashboard" },
  { href: "/vehicles", icon: Car, labelKey: "dashboard.sidebar.vehicles" },
  { href: "/settings", icon: Settings, labelKey: "dashboard.sidebar.settings" },
] as const;

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useI18n();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-background border-r border-border transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-border">
          <div className="flex items-center gap-2 select-none">
            <div className="h-4 w-4 bg-foreground rounded-sm" />
            <span className="text-sm font-semibold tracking-tight text-foreground">Smart OBD</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 text-muted hover:text-foreground cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* User */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xs font-medium">
            {initials}
          </div>
          <p className="truncate text-sm text-foreground">{user?.name || user?.email}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, icon: Icon, labelKey }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-accent text-foreground font-medium"
                    : "text-muted hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon size={16} />
                {t(labelKey)}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted hover:text-error hover:bg-error/5 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            {t("dashboard.sidebar.logout")}
          </button>
        </div>
      </aside>
    </>
  );
}
