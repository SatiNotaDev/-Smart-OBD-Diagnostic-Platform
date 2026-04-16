"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoogleButton } from "./google-button";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n } from "@/lib/i18n/i18n";

const registerSchema = z
  .object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, "Need uppercase")
      .regex(/[a-z]/, "Need lowercase")
      .regex(/[0-9]/, "Need number")
      .regex(/[^A-Za-z0-9]/, "Need special char"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onFlip: () => void;
}

export function RegisterForm({ onFlip }: RegisterFormProps) {
  const { register: registerUser } = useAuth();
  const { t } = useI18n();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterValues) => {
    setError("");
    setIsLoading(true);
    try {
      await registerUser(values.email, values.password, values.name);
      setSuccess(true);
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("already exists")) {
        setError(t("auth.register.errors.emailTaken"));
      } else {
        setError(msg || t("common.error"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <Mail size={32} className="text-success" />
        </div>
        <h2 className="text-xl font-bold text-foreground">{t("auth.register.success")}</h2>
        <p className="text-sm text-muted">
          {t("auth.verifyEmail.title")}
        </p>
        <Button variant="outline" onClick={onFlip}>
          {t("auth.register.login")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">
          {t("auth.register.title")}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {t("auth.register.subtitle")}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
        <Input
          label={t("auth.register.name")}
          placeholder={t("auth.register.namePlaceholder")}
          icon={<User size={16} />}
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label={t("auth.register.email")}
          placeholder={t("auth.register.emailPlaceholder")}
          type="email"
          icon={<Mail size={16} />}
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label={t("auth.register.password")}
          placeholder={t("auth.register.passwordPlaceholder")}
          type="password"
          icon={<Lock size={16} />}
          error={errors.password?.message}
          {...register("password")}
        />
        <p className="text-[11px] text-muted-foreground -mt-1">
          {t("auth.register.passwordRequirements")}
        </p>
        <Input
          label={t("auth.register.confirmPassword")}
          placeholder={t("auth.register.confirmPasswordPlaceholder")}
          type="password"
          icon={<Lock size={16} />}
          error={
            errors.confirmPassword?.message === "passwordMismatch"
              ? t("auth.register.errors.passwordMismatch")
              : errors.confirmPassword?.message
          }
          {...register("confirmPassword")}
        />

        {error && (
          <div className="rounded-[var(--radius)] bg-error/10 px-4 py-2.5 text-sm text-error">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full mt-1" isLoading={isLoading}>
          {t("auth.register.submit")}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted uppercase">{t("auth.register.or")}</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Google */}
      <GoogleButton label={t("auth.register.googleButton")} />

      {/* Switch to login */}
      <p className="text-center text-sm text-muted">
        {t("auth.register.hasAccount")}{" "}
        <button
          type="button"
          onClick={onFlip}
          className="font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
        >
          {t("auth.register.login")}
        </button>
      </p>
    </div>
  );
}
