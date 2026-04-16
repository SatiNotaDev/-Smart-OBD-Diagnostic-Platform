"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoogleButton } from "./google-button";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n } from "@/lib/i18n/i18n";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type LoginValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onFlip: () => void;
  onForgotPassword: () => void;
  onMfaRequired: (email: string, password: string) => void;
}

export function LoginForm({ onFlip, onForgotPassword, onMfaRequired }: LoginFormProps) {
  const { login } = useAuth();
  const { t } = useI18n();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginValues) => {
    setError("");
    setIsLoading(true);
    try {
      const result = await login(values.email, values.password);
      if (result.requiresMfa) {
        onMfaRequired(values.email, values.password);
      }
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("verify your email")) {
        setError(t("auth.login.errors.emailNotVerified"));
      } else {
        setError(t("auth.login.errors.invalidCredentials"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">
          {t("auth.login.title")}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {t("auth.login.subtitle")}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label={t("auth.login.email")}
          placeholder={t("auth.login.emailPlaceholder")}
          type="email"
          icon={<Mail size={16} />}
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label={t("auth.login.password")}
          placeholder={t("auth.login.passwordPlaceholder")}
          type="password"
          icon={<Lock size={16} />}
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs text-primary hover:text-primary-hover transition-colors cursor-pointer"
          >
            {t("auth.login.forgotPassword")}
          </button>
        </div>

        {error && (
          <div className="rounded-[var(--radius)] bg-error/10 px-4 py-2.5 text-sm text-error">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
          {t("auth.login.submit")}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted uppercase">{t("auth.login.or")}</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Google */}
      <GoogleButton label={t("auth.login.googleButton")} />

      {/* Switch to register */}
      <p className="text-center text-sm text-muted">
        {t("auth.login.noAccount")}{" "}
        <button
          type="button"
          onClick={onFlip}
          className="font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
        >
          {t("auth.login.register")}
        </button>
      </p>
    </div>
  );
}
