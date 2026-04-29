"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  Bot,
  Car,
  Shield,
  Zap,
  BarChart3,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease },
  }),
};

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border"
    >
      <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
        <div className="flex items-center gap-1 select-none">
          <span className="text-sm font-light text-muted">Smart</span>
          <span className="text-sm font-bold text-foreground">OBD</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="h-8 px-3 inline-flex items-center rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

function Hero() {
  return (
    <section className="pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="max-w-2xl"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-[1.15] tracking-tight">
            Understand your car{" "}
            <span className="text-primary">like a pro mechanic</span>
          </h1>

          <p className="mt-5 text-base text-muted leading-relaxed max-w-lg">
            Decode OBD-II error codes, get AI-powered diagnostics, and track your
            vehicle health — all in one platform.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <Link
              href="/login"
              className="h-9 px-4 inline-flex items-center rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              Start Free
              <ArrowRight size={14} className="ml-1.5" />
            </Link>
            <span className="text-xs text-muted">No credit card required</span>
          </div>
        </motion.div>

        {/* Hero visual */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease }}
          className="mt-14"
        >
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex h-[280px] sm:h-[360px]">
              {/* Sidebar mock */}
              <div className="hidden sm:flex w-44 border-r border-border bg-surface flex-col p-3 gap-2">
                <div className="h-6 w-16 rounded bg-primary/10" />
                <div className="h-5 w-24 rounded bg-accent" />
                <div className="h-5 w-20 rounded bg-accent" />
                <div className="h-5 w-22 rounded bg-accent" />
              </div>
              {/* Content mock */}
              <div className="flex-1 p-5 space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1 h-20 rounded-md bg-primary/5 border border-primary/10 p-3">
                    <div className="h-2.5 w-12 bg-primary/20 rounded mb-2" />
                    <div className="h-5 w-8 bg-primary/30 rounded" />
                  </div>
                  <div className="flex-1 h-20 rounded-md bg-surface border border-border p-3">
                    <div className="h-2.5 w-16 bg-muted/20 rounded mb-2" />
                    <div className="h-5 w-10 bg-muted/30 rounded" />
                  </div>
                  <div className="hidden lg:block flex-1 h-20 rounded-md bg-surface border border-border p-3">
                    <div className="h-2.5 w-10 bg-muted/20 rounded mb-2" />
                    <div className="h-5 w-6 bg-muted/30 rounded" />
                  </div>
                </div>
                <div className="h-36 rounded-md bg-surface border border-border p-4">
                  <div className="h-2.5 w-24 bg-muted/20 rounded mb-4" />
                  <div className="flex gap-1.5 items-end h-20">
                    {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 0.8 + i * 0.04, duration: 0.4 }}
                        className="flex-1 rounded-sm bg-primary/30"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: Activity,
    title: "DTC Code Analysis",
    description:
      "Decode any OBD-II error code instantly. P, B, C, U — all categories with severity assessment.",
  },
  {
    icon: Bot,
    title: "AI Diagnostic Chat",
    description:
      "Ask questions in plain language. Claude AI explains issues, suggests fixes, estimates costs.",
  },
  {
    icon: BarChart3,
    title: "Health Tracking",
    description:
      "Monitor diagnostic history over time. See trends, correlations, and maintenance timelines.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "End-to-end encryption, 2FA support. Your data is never shared.",
  },
  {
    icon: Car,
    title: "Multi-Vehicle",
    description:
      "Track all vehicles in one place — cars, trucks, fleet. Each with its own history.",
  },
  {
    icon: Zap,
    title: "Instant Reports",
    description:
      "Export PDF reports for your mechanic or insurance. Professional documentation.",
  },
];

function Features() {
  return (
    <section className="py-20 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-12"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-2xl font-bold text-foreground"
          >
            Everything you need for vehicle diagnostics
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="mt-2 text-sm text-muted"
          >
            From error code lookup to AI-powered root cause analysis
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              custom={i}
              className="space-y-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/8 text-primary">
                <feature.icon size={16} />
              </div>
              <h3 className="text-sm font-medium text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const steps = [
  { num: "1", title: "Add your vehicle", desc: "Enter brand, model, year — or decode VIN automatically" },
  { num: "2", title: "Scan or enter codes", desc: "Use any OBD-II reader or type codes manually" },
  { num: "3", title: "Get AI analysis", desc: "Instant interpretation with repair suggestions and cost estimates" },
];

function HowItWorks() {
  return (
    <section className="py-20 px-6 bg-surface">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-2xl font-bold text-foreground"
          >
            How it works
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-3"
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              variants={fadeUp}
              custom={i}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/8 text-primary text-sm font-semibold mb-3">
                {step.num}
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">{step.title}</h3>
              <p className="text-sm text-muted">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["3 vehicles", "10 AI messages/day", "Basic DTC lookup", "Diagnostic history"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    features: ["10 vehicles", "100 AI messages/day", "Deep analysis", "PDF reports", "Priority support"],
    cta: "Go Pro",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$29.99",
    period: "/month",
    features: ["Unlimited vehicles", "Unlimited AI", "Fleet management", "API access", "Custom branding"],
    cta: "Contact Us",
    highlighted: false,
  },
];

function Pricing() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-2xl font-bold text-foreground"
          >
            Simple pricing
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="mt-2 text-sm text-muted"
          >
            Start free, upgrade when you need more
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-4 md:grid-cols-3 max-w-3xl"
        >
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              custom={i}
              className={`rounded-lg border p-5 ${
                plan.highlighted
                  ? "border-primary bg-primary/3"
                  : "border-border bg-card"
              }`}
            >
              {plan.highlighted && (
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-primary text-primary-foreground mb-3">
                  Popular
                </span>
              )}
              <h3 className="text-sm font-medium text-foreground">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-0.5">
                <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                <span className="text-xs text-muted">{plan.period}</span>
              </div>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted">
                    <CheckCircle2 size={13} className="text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className={`mt-5 h-8 w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                    : "border border-border text-foreground hover:bg-accent"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20 px-6 border-t border-border">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-5xl mx-auto"
      >
        <motion.div
          variants={fadeUp}
          custom={0}
          className="rounded-lg border border-border bg-surface p-10"
        >
          <h2 className="text-xl font-bold text-foreground mb-2">
            Ready to understand your car better?
          </h2>
          <p className="text-sm text-muted mb-6">
            Join thousands of car owners who save time and money with Smart OBD.
          </p>
          <Link
            href="/login"
            className="h-9 px-4 inline-flex items-center rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Get Started — It&apos;s Free
            <ArrowRight size={14} className="ml-1.5" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-6 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 select-none">
          <span className="text-xs font-light text-muted">Smart</span>
          <span className="text-xs font-bold text-foreground">OBD</span>
        </div>
        <span className="text-xs text-muted">&copy; {new Date().getFullYear()} Smart OBD Platform</span>
      </div>
    </footer>
  );
}
