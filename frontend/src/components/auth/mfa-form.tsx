"use client";

import { useState } from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n } from "@/lib/i18n/i18n";

interface MfaFormProps {
  email: string;
  password: string;
  onBack: () => void;
}

export function MfaForm({ email, password, onBack }: MfaFormProps) {
  const { login } = useAuth();
  const { t } = useI18n();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useBackup, setUseBackup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password, code);
    } catch {
      setError(t("auth.mfa.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors self-start cursor-pointer"
      >
        <ArrowLeft size={16} />
        {t("auth.forgotPassword.backToLogin")}
      </button>

      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck size={28} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">{t("auth.mfa.title")}</h2>
        <p className="text-sm text-muted">{t("auth.mfa.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          placeholder={useBackup ? t("auth.mfa.backupCodePlaceholder") : t("auth.mfa.codePlaceholder")}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="text-center text-lg tracking-[0.3em] font-mono"
          maxLength={useBackup ? 20 : 6}
          autoFocus
        />

        {error && (
          <div className="rounded-[var(--radius)] bg-error/10 px-4 py-2.5 text-sm text-error text-center">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
          {t("auth.mfa.submit")}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => {
          setUseBackup(!useBackup);
          setCode("");
          setError("");
        }}
        className="text-xs text-primary hover:text-primary-hover transition-colors text-center cursor-pointer"
      >
        {useBackup ? t("auth.mfa.title") : t("auth.mfa.useBackupCode")}
      </button>
    </div>
  );
}
