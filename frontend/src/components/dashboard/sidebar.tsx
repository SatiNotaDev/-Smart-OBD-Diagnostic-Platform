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
  { href: "/", icon: LayoutDashboard, labelKey: "dashboard.sidebar.dashboard" },
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
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo + close */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-1 select-none">
            <span className="text-xl font-extralight tracking-wide text-foreground">
              Smart
            </span>
            <span className="text-xl font-black tracking-tight text-primary uppercase">
              OBD
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.name || user?.email}
            </p>
            {user?.name && (
              <p className="truncate text-xs text-muted">{user.email}</p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, icon: Icon, labelKey }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-[var(--radius)] px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon size={18} />
                {t(labelKey)}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-[var(--radius)] px-3 py-2.5 text-sm text-muted hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            {t("dashboard.sidebar.logout")}
          </button>
        </div>
      </aside>
    </>
  );
}
