"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Activity,
  Bot,
  Car,
  Shield,
  Zap,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

const HeroScene = dynamic(
  () => import("./hero-scene").then((mod) => ({ default: mod.HeroScene })),
  { ssr: false }
);

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <Navbar />
      <Hero />
      <LogoCloud />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 select-none">
          <div className="h-5 w-5 bg-white rounded-sm" />
          <span className="text-sm font-semibold tracking-tight">Smart OBD</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm text-[#888] hover:text-white transition-colors">
            Log In
          </Link>
          <Link
            href="/login"
            className="h-9 px-4 inline-flex items-center rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-all"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16">
      <HeroScene />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,black_70%)]" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-[#888] mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-blue animate-pulse" />
            AI-Powered Diagnostics Platform
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8, ease }}
          className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9]"
        >
          <span className="gradient-text">Your car,</span>
          <br />
          <span className="gradient-text-color">decoded.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-6 text-base sm:text-lg text-[#888] max-w-xl mx-auto leading-relaxed"
        >
          Smart OBD reads your vehicle&apos;s diagnostic codes, runs AI analysis,
          and gives you clear answers — no mechanic jargon.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="group h-12 px-6 inline-flex items-center rounded-xl bg-white text-black text-sm font-medium hover:shadow-[0_0_30px_4px_rgba(0,112,243,0.3)] transition-all duration-300"
          >
            Start Building
            <ArrowRight size={16} className="ml-2 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="#features"
            className="h-12 px-6 inline-flex items-center rounded-xl border border-white/20 text-sm text-white/80 hover:text-white hover:border-white/40 transition-all"
          >
            See Features
            <ChevronRight size={14} className="ml-1" />
          </Link>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}

function LogoCloud() {
  const techs = ["Next.js", "NestJS", "PostgreSQL", "Claude AI", "Prisma", "TailwindCSS"];

  return (
    <section className="py-12 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-xs uppercase tracking-widest text-[#666] mb-6">Built with</p>
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-[#666]">
          {techs.map((t) => (
            <span key={t} className="hover:text-white transition-colors">{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: Activity,
    title: "DTC Code Analysis",
    description: "Decode any OBD-II error code. P, B, C, U categories with AI severity assessment.",
    gradient: "from-blue to-cyan",
  },
  {
    icon: Bot,
    title: "AI Diagnostic Chat",
    description: "Ask questions in plain language. Claude explains issues, suggests repairs, estimates costs.",
    gradient: "from-purple to-pink",
  },
  {
    icon: BarChart3,
    title: "Health Monitoring",
    description: "Track diagnostic history. See trends, code correlations, and maintenance timelines.",
    gradient: "from-orange to-pink",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "End-to-end encryption, MFA, httpOnly cookies. Your data stays yours.",
    gradient: "from-cyan to-blue",
  },
  {
    icon: Car,
    title: "Fleet Management",
    description: "Track multiple vehicles. Each with its own diagnostic history and AI context.",
    gradient: "from-pink to-purple",
  },
  {
    icon: Zap,
    title: "Instant Reports",
    description: "Export professional PDF reports for your mechanic or insurance provider.",
    gradient: "from-blue to-purple",
  },
];

function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Ship diagnostics,{" "}
            <span className="gradient-text-color">not guesswork</span>
          </h2>
          <p className="mt-4 text-[#888] text-base max-w-lg mx-auto">
            Everything your vehicle needs, from error codes to AI-powered root cause analysis.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group relative rounded-xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient} mb-4`}>
                <feature.icon size={20} className="text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-[#888] leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { num: "01", title: "Connect", desc: "Add your vehicle — enter details or scan VIN. Takes 30 seconds." },
  { num: "02", title: "Scan", desc: "Enter OBD-II codes from any reader, or type them manually." },
  { num: "03", title: "Analyze", desc: "AI processes codes, identifies root causes, suggests next steps." },
];

function HowItWorks() {
  return (
    <section className="py-24 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-16"
        >
          Three steps to clarity
        </motion.h2>

        <div className="grid gap-12 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="text-5xl font-bold text-white/10 block mb-4">{step.num}</span>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-[#888] leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const plans = [
  {
    name: "Hobby",
    price: "$0",
    period: "forever",
    features: ["3 vehicles", "10 AI messages/day", "Basic DTC lookup", "7-day history"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    features: ["10 vehicles", "100 AI messages/day", "Deep analysis", "PDF reports", "Priority support", "Unlimited history"],
    cta: "Get Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$29",
    period: "/month",
    features: ["Unlimited vehicles", "Unlimited AI", "Fleet dashboard", "API access", "Custom branding", "SSO"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

function Pricing() {
  return (
    <section className="py-24 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Predictable pricing
          </h2>
          <p className="mt-4 text-[#888]">Start free. Scale as you grow.</p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-xl border p-6 ${
                plan.highlighted
                  ? "border-white/30 bg-white/[0.04]"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue to-transparent" />
              )}
              <h3 className="text-sm font-medium text-[#888]">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-sm text-[#666]">{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#888]">
                    <CheckCircle2 size={14} className="text-blue shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className={`mt-6 h-10 w-full inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                  plan.highlighted
                    ? "bg-white text-black hover:opacity-90"
                    : "border border-white/20 text-white hover:bg-white/5"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-16 overflow-hidden">
          {/* Gradient blobs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple/10 rounded-full blur-[120px]" />

          <h2 className="relative text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            Ready to ship?
          </h2>
          <p className="relative text-[#888] mb-8 max-w-md mx-auto">
            Deploy your diagnostic workflow in minutes, not weeks.
          </p>
          <Link
            href="/login"
            className="relative h-12 px-8 inline-flex items-center rounded-xl bg-white text-black text-sm font-medium hover:shadow-[0_0_30px_4px_rgba(0,112,243,0.3)] transition-all duration-300"
          >
            Get Started Free
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 select-none">
          <div className="h-4 w-4 bg-white rounded-sm" />
          <span className="text-xs font-medium">Smart OBD</span>
        </div>
        <span className="text-xs text-[#666]">&copy; {new Date().getFullYear()} Smart OBD Platform. All rights reserved.</span>
      </div>
    </footer>
  );
}
