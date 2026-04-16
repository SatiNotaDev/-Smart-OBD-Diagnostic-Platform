"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/i18n";
import { authApi } from "@/lib/api/auth-api";

function VerifyEmailContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useI18n();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    authApi.verifyEmail(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [params]);

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
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          {status === "loading" && (
            <>
              <Loader2 size={48} className="animate-spin text-primary" />
              <p className="text-sm text-muted">{t("auth.verifyEmail.verifying")}</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle size={32} className="text-success" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t("auth.verifyEmail.title")}</h2>
              <p className="text-sm text-muted">{t("auth.verifyEmail.success")}</p>
              <Button onClick={() => router.push("/login")}>
                {t("auth.verifyEmail.loginButton")}
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
                <XCircle size={32} className="text-error" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t("auth.verifyEmail.title")}</h2>
              <p className="text-sm text-muted">{t("auth.verifyEmail.error")}</p>
              <Button variant="outline" onClick={() => router.push("/login")}>
                {t("auth.verifyEmail.loginButton")}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
