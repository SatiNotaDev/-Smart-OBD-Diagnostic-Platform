"use client";

import { useState } from "react";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { MfaForm } from "./mfa-form";

type CardView = "login" | "register" | "mfa";

interface FlipCardProps {
  onForgotPassword: () => void;
}

export function FlipCard({ onForgotPassword }: FlipCardProps) {
  const [view, setView] = useState<CardView>("login");
  const [mfaCreds, setMfaCreds] = useState({ email: "", password: "" });

  const isFlipped = view === "register";

  const handleMfaRequired = (email: string, password: string) => {
    setMfaCreds({ email, password });
    setView("mfa");
  };

  if (view === "mfa") {
    return (
      <div className="w-full max-w-xl">
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-10 shadow-2xl">
          <MfaForm
            email={mfaCreds.email}
            password={mfaCreds.password}
            onBack={() => setView("login")}
          />
        </div>
      </div>
    );
  }

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

      {/* Flip Card */}
      <div className="flip-card">
        <div className={`flip-card-inner relative ${isFlipped ? "flipped" : ""}`}>
          {/* Front — Login */}
          <div className="flip-card-front">
            <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-10 shadow-2xl">
              <LoginForm
                onFlip={() => setView("register")}
                onForgotPassword={onForgotPassword}
                onMfaRequired={handleMfaRequired}
              />
            </div>
          </div>

          {/* Back — Register */}
          <div className="flip-card-back absolute inset-0">
            <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-10 shadow-2xl">
              <RegisterForm onFlip={() => setView("login")} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
