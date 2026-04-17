"use client";

import { useState, useRef } from "react";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { MfaForm } from "./mfa-form";

type CardView = "login" | "register" | "mfa";

interface FlipCardProps {
  onForgotPassword: () => void;
}

export function FlipCard({ onForgotPassword }: FlipCardProps) {
  const [view, setView] = useState<CardView>("login");
  const [displayedView, setDisplayedView] = useState<CardView>("login");
  const [isAnimating, setIsAnimating] = useState(false);
  const [mfaCreds, setMfaCreds] = useState({ email: "", password: "" });
  const cardRef = useRef<HTMLDivElement>(null);

  const switchView = (next: CardView) => {
    if (isAnimating || next === view) return;
    setIsAnimating(true);

    cardRef.current?.classList.add("card-flip-out");

    setTimeout(() => {
      setDisplayedView(next);
      setView(next);
      cardRef.current?.classList.remove("card-flip-out");
      cardRef.current?.classList.add("card-flip-in");

      setTimeout(() => {
        cardRef.current?.classList.remove("card-flip-in");
        setIsAnimating(false);
      }, 300);
    }, 300);
  };

  const handleMfaRequired = (email: string, password: string) => {
    setMfaCreds({ email, password });
    switchView("mfa");
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

      {/* Card */}
      <div
        ref={cardRef}
        className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-10 shadow-2xl card-flip"
      >
        {displayedView === "login" && (
          <LoginForm
            onFlip={() => switchView("register")}
            onForgotPassword={onForgotPassword}
            onMfaRequired={handleMfaRequired}
          />
        )}
        {displayedView === "register" && (
          <RegisterForm onFlip={() => switchView("login")} />
        )}
        {displayedView === "mfa" && (
          <MfaForm
            email={mfaCreds.email}
            password={mfaCreds.password}
            onBack={() => switchView("login")}
          />
        )}
      </div>
    </div>
  );
}
