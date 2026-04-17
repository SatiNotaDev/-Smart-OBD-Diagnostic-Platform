"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n, type Locale } from "@/lib/i18n/i18n";
import { useTheme } from "next-themes";
import { Check } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const [saved, setSaved] = useState(false);

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "ru", label: "Русский" },
    { value: "fr", label: "Français" },
  ];

  const themeOptions = [
    { value: "light", label: t("dashboard.settings.profile.themeLight") },
    { value: "dark", label: t("dashboard.settings.profile.themeDark") },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-8">
      {/* Profile */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-5">
          {t("dashboard.settings.profile.title")}
        </h3>

        <div className="space-y-4">
          <Input
            label={t("dashboard.settings.profile.name")}
            value={user?.name || ""}
            disabled
          />
          <Input
            label={t("dashboard.settings.profile.email")}
            value={user?.email || ""}
            disabled
          />

          <Select
            label={t("dashboard.settings.profile.language")}
            options={languageOptions}
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
          />
          <Select
            label={t("dashboard.settings.profile.theme")}
            options={themeOptions}
            value={theme || "light"}
            onChange={(e) => setTheme(e.target.value)}
          />

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave}>
              {t("dashboard.settings.profile.save")}
            </Button>
            {saved && (
              <span className="flex items-center gap-1 text-sm text-success">
                <Check size={16} />
                {t("dashboard.settings.profile.saved")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tariff */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t("dashboard.settings.tariff.title")}
        </h3>

        <div className="flex items-center justify-between rounded-[var(--radius)] border border-border bg-surface p-4">
          <div>
            <p className="text-sm text-muted">{t("dashboard.settings.tariff.currentPlan")}</p>
            <p className="text-lg font-bold text-foreground">
              {t("dashboard.settings.tariff.freePlan")}
            </p>
            <p className="text-xs text-muted mt-1">
              {t("dashboard.settings.tariff.freePlanDesc")}
            </p>
          </div>
          <Button variant="outline" disabled>
            {t("dashboard.settings.tariff.upgrade")}
          </Button>
        </div>
      </div>
    </div>
  );
}
