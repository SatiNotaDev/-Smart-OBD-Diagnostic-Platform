"use client";

import { useRouter } from "next/navigation";
import { FlipCard } from "@/components/auth/flip-card";

export default function LoginPage() {
  const router = useRouter();

  return (
    <FlipCard onForgotPassword={() => router.push("/forgot-password")} />
  );
}
