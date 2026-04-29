"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n, type Locale } from "@/lib/i18n/i18n";
import { useTheme } from "next-themes";
import { Check } from "lucide-react";
import { MfaSetupSection } from "@/components/settings/mfa-setup-section";
import { SubscriptionSection } from "@/components/settings/subscription-section";
import { PageTransition } from "@/components/ui/page-transition";

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
    <PageTransition className="max-w-xl space-y-6">
      {/* Profile */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">
          {t("dashboard.settings.profile.title")}
        </h3>

        <div className="space-y-3">
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
            <Button onClick={handleSave} size="sm">
              {t("dashboard.settings.profile.save")}
            </Button>
            {saved && (
              <span className="flex items-center gap-1 text-xs text-success">
                <Check size={14} />
                {t("dashboard.settings.profile.saved")}
              </span>
            )}
          </div>
        </div>
      </div>

      <MfaSetupSection />
      <SubscriptionSection />
    </PageTransition>
  );
}
