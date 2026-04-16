"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/i18n";
import { authApi } from "@/lib/api/auth-api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl">
      {/* Logo */}
      <div className="mb-10 flex items-center justify-center gap-1 select-none">
        <span className="text-3xl font-extralight tracking-wide text-foreground">
          Smart
        </span>
        <span className="text-3xl font-black tracking-tight text-primary uppercase">
          OBD
        </span>
      </div>

      <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-10 shadow-2xl">
        {sent ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle size={32} className="text-success" />
            </div>
            <p className="text-sm text-muted">{t("auth.forgotPassword.success")}</p>
            <Button variant="outline" onClick={() => router.push("/login")}>
              {t("auth.forgotPassword.backToLogin")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <button
              onClick={() => router.push("/login")}
              className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors self-start cursor-pointer"
            >
              <ArrowLeft size={16} />
              {t("auth.forgotPassword.backToLogin")}
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">{t("auth.forgotPassword.title")}</h2>
              <p className="mt-1 text-sm text-muted">{t("auth.forgotPassword.subtitle")}</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label={t("auth.forgotPassword.email")}
                placeholder={t("auth.forgotPassword.emailPlaceholder")}
                type="email"
                icon={<Mail size={16} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
                {t("auth.forgotPassword.submit")}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
