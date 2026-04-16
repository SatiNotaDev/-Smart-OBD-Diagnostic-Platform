"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/i18n";
import { authApi } from "@/lib/api/auth-api";

const schema = z
  .object({
    password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Values = z.infer<typeof schema>;

function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useI18n();
  const token = params.get("token") || "";
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: Values) => {
    setError("");
    setIsLoading(true);
    try {
      await authApi.resetPassword(token, values.password);
      setDone(true);
    } catch (err: any) {
      setError(err?.message || t("auth.resetPassword.invalidToken"));
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
        {done ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle size={32} className="text-success" />
            </div>
            <p className="text-sm text-muted">{t("auth.resetPassword.success")}</p>
            <Button onClick={() => router.push("/login")}>
              {t("auth.verifyEmail.loginButton")}
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
              <h2 className="text-2xl font-bold text-foreground">{t("auth.resetPassword.title")}</h2>
              <p className="mt-1 text-sm text-muted">{t("auth.resetPassword.subtitle")}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label={t("auth.resetPassword.password")}
                type="password"
                icon={<Lock size={16} />}
                error={errors.password?.message}
                {...register("password")}
              />
              <Input
                label={t("auth.resetPassword.confirmPassword")}
                type="password"
                icon={<Lock size={16} />}
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />

              {error && (
                <div className="rounded-[var(--radius)] bg-error/10 px-4 py-2.5 text-sm text-error">
                  {error}
                </div>
              )}

              <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
                {t("auth.resetPassword.submit")}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
