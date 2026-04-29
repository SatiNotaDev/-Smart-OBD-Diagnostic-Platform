"use client";

import { useState } from "react";
import { Shield, ShieldOff, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/auth-context";
import { authApi } from "@/lib/api/auth-api";
import { useI18n } from "@/lib/i18n/i18n";

type Step = "idle" | "setup" | "verify" | "done" | "disable";

interface SetupData {
  qrCodeUrl: string;
  secret: string;
  backupCodes: string[];
}

export function MfaSetupSection() {
  const { t } = useI18n();
  const { user, refetchUser } = useAuth();
  const [step, setStep] = useState<Step>("idle");
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await authApi.setupMfa();
      setSetupData(data);
      setStep("setup");
    } catch {
      setError(t("dashboard.settings.mfa.setupError"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    setError("");
    try {
      await authApi.verifyMfa(code);
      setStep("done");
      await refetchUser();
    } catch {
      setError(t("dashboard.settings.mfa.invalidCode"));
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    setError("");
    try {
      await authApi.disableMfa(code);
      setStep("idle");
      setCode("");
      await refetchUser();
    } catch {
      setError(t("dashboard.settings.mfa.invalidCode"));
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    if (!setupData) return;
    navigator.clipboard.writeText(setupData.backupCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mfaEnabled = user?.mfaEnabled || false;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] bg-primary/10">
          <Shield size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {t("dashboard.settings.mfa.title")}
          </h3>
          <p className="text-xs text-muted">
            {t("dashboard.settings.mfa.description")}
          </p>
        </div>
      </div>

      {/* Status: idle, MFA not enabled */}
      {step === "idle" && !mfaEnabled && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-[var(--radius)] bg-warning/10 border border-warning/20">
            <ShieldOff size={16} className="text-warning" />
            <span className="text-sm text-foreground">
              {t("dashboard.settings.mfa.disabled")}
            </span>
          </div>
          <Button onClick={handleSetup} isLoading={loading}>
            {t("dashboard.settings.mfa.enable")}
          </Button>
        </div>
      )}

      {/* Status: idle, MFA enabled */}
      {step === "idle" && mfaEnabled && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-[var(--radius)] bg-success/10 border border-success/20">
            <Shield size={16} className="text-success" />
            <span className="text-sm text-foreground">
              {t("dashboard.settings.mfa.enabled")}
            </span>
          </div>
          <Button variant="outline" onClick={() => setStep("disable")}>
            <ShieldOff size={15} className="mr-1.5" />
            {t("dashboard.settings.mfa.disableBtn")}
          </Button>
        </div>
      )}

      {/* Step: Setup — show QR code */}
      {step === "setup" && setupData && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {t("dashboard.settings.mfa.scanQr")}
          </p>

          <div className="flex justify-center p-4 bg-white rounded-[var(--radius)]">
            <img src={setupData.qrCodeUrl} alt="QR Code" className="w-48 h-48" />
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted">{t("dashboard.settings.mfa.manualEntry")}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-accent p-2 rounded-[var(--radius)] font-mono break-all">
                {showSecret ? setupData.secret : "••••••••••••••••"}
              </code>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <Check size={14} /> : <Shield size={14} />}
              </Button>
            </div>
          </div>

          <div className="pt-2">
            <Input
              label={t("dashboard.settings.mfa.enterCode")}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
            />
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex gap-2">
            <Button onClick={handleVerify} disabled={code.length !== 6} isLoading={loading}>
              {t("dashboard.settings.mfa.verify")}
            </Button>
            <Button variant="outline" onClick={() => { setStep("idle"); setCode(""); setError(""); }}>
              {t("dashboard.settings.mfa.cancel")}
            </Button>
          </div>
        </div>
      )}

      {/* Step: Done — show backup codes */}
      {step === "done" && setupData && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-[var(--radius)] bg-success/10 border border-success/20">
            <Shield size={16} className="text-success" />
            <span className="text-sm text-foreground">
              {t("dashboard.settings.mfa.activated")}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              {t("dashboard.settings.mfa.backupCodesTitle")}
            </p>
            <p className="text-xs text-muted">
              {t("dashboard.settings.mfa.backupCodesDesc")}
            </p>
            <div className="grid grid-cols-2 gap-2 p-3 bg-accent rounded-[var(--radius)]">
              {setupData.backupCodes.map((bc, i) => (
                <code key={i} className="text-xs font-mono text-foreground">{bc}</code>
              ))}
            </div>
            <Button variant="outline" onClick={copyBackupCodes} className="text-xs">
              {copied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
              {copied ? t("dashboard.settings.mfa.copied") : t("dashboard.settings.mfa.copyAll")}
            </Button>
          </div>

          <Button onClick={() => { setStep("idle"); setSetupData(null); setCode(""); }}>
            {t("dashboard.settings.mfa.finish")}
          </Button>
        </div>
      )}

      {/* Step: Disable MFA */}
      {step === "disable" && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {t("dashboard.settings.mfa.disableDesc")}
          </p>
          <Input
            label={t("dashboard.settings.mfa.enterCode")}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            maxLength={6}
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex gap-2">
            <Button
              onClick={handleDisable}
              disabled={code.length !== 6}
              isLoading={loading}
              className="bg-error hover:bg-error/90"
            >
              {t("dashboard.settings.mfa.confirmDisable")}
            </Button>
            <Button variant="outline" onClick={() => { setStep("idle"); setCode(""); setError(""); }}>
              {t("dashboard.settings.mfa.cancel")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
