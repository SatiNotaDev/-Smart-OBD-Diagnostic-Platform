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
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.15, duration: 0.5, ease },
  }),
};

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
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
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-1 select-none">
          <span className="text-xl font-extralight tracking-wide text-foreground">
            Smart
          </span>
          <span className="text-xl font-black tracking-tight text-primary uppercase">
            OBD
          </span>
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
            className="h-9 px-4 inline-flex items-center rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-all hover:shadow-lg hover:shadow-primary/25"
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
    <section className="relative pt-32 pb-20 px-6">
      {/* Gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/50 backdrop-blur-sm text-sm text-muted mb-8">
            <Zap size={14} className="text-primary" />
            AI-Powered Vehicle Diagnostics
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight"
        >
          Understand your car
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
            like a pro mechanic
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-6 text-lg sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed"
        >
          Decode OBD-II error codes, get AI-powered diagnostics, and track your
          vehicle health — all in one platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="h-12 px-8 inline-flex items-center rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary-hover transition-all hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Free
            <ArrowRight size={18} className="ml-2" />
          </Link>
          <span className="text-sm text-muted">No credit card required</span>
        </motion.div>

        {/* Hero visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 relative"
        >
          <div className="relative mx-auto max-w-4xl rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4 shadow-2xl shadow-primary/5">
            <div className="rounded-xl bg-background border border-border overflow-hidden">
              {/* Mock dashboard UI */}
              <div className="flex h-[300px] sm:h-[400px]">
                {/* Sidebar mock */}
                <div className="hidden sm:flex w-48 border-r border-border bg-card/50 flex-col p-4 gap-3">
                  <div className="h-8 w-24 rounded-lg bg-primary/10" />
                  <div className="h-6 w-32 rounded bg-accent" />
                  <div className="h-6 w-28 rounded bg-accent" />
                  <div className="h-6 w-30 rounded bg-accent" />
                </div>
                {/* Content mock */}
                <div className="flex-1 p-6 space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1 h-24 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4">
                      <div className="h-3 w-16 bg-primary/30 rounded mb-2" />
                      <div className="h-6 w-10 bg-primary/50 rounded" />
                    </div>
                    <div className="flex-1 h-24 rounded-xl bg-accent border border-border p-4">
                      <div className="h-3 w-20 bg-muted/30 rounded mb-2" />
                      <div className="h-6 w-12 bg-muted/50 rounded" />
                    </div>
                    <div className="hidden lg:block flex-1 h-24 rounded-xl bg-accent border border-border p-4">
                      <div className="h-3 w-14 bg-muted/30 rounded mb-2" />
                      <div className="h-6 w-8 bg-muted/50 rounded" />
                    </div>
                  </div>
                  <div className="h-40 rounded-xl bg-accent border border-border p-4">
                    <div className="h-3 w-32 bg-muted/30 rounded mb-4" />
                    <div className="flex gap-2 items-end h-24">
                      {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 1.2 + i * 0.05, duration: 0.5 }}
                          className="flex-1 rounded-t bg-gradient-to-t from-primary/60 to-primary/20"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Glow under card */}
          <div className="absolute inset-0 -z-10 top-1/2 mx-auto w-3/4 h-1/2 bg-primary/10 blur-[80px] rounded-full" />
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
      "Decode any OBD-II error code instantly. P, B, C, U — we cover all categories with severity assessment.",
  },
  {
    icon: Bot,
    title: "AI Diagnostic Chat",
    description:
      "Ask questions about your car in plain language. Claude AI explains issues, suggests fixes, and estimates costs.",
  },
  {
    icon: BarChart3,
    title: "Health Tracking",
    description:
      "Monitor diagnostic history over time. See trends, correlations between codes, and maintenance timelines.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "End-to-end encryption, 2FA support, and your data never shared. You own your vehicle data.",
  },
  {
    icon: Car,
    title: "Multi-Vehicle",
    description:
      "Track all your vehicles in one place — cars, trucks, fleet. Each with its own diagnostic history.",
  },
  {
    icon: Zap,
    title: "Instant Reports",
    description:
      "Export PDF diagnostic reports for your mechanic or insurance. Professional-grade documentation.",
  },
];

function Features() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-3xl sm:text-4xl font-bold text-foreground"
          >
            Everything you need for
            <br />
            <span className="text-primary">vehicle diagnostics</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="mt-4 text-muted text-lg max-w-xl mx-auto"
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
              variants={scaleIn}
              custom={i}
              className="group relative rounded-2xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon size={22} />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">
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
  { num: "01", title: "Add your vehicle", desc: "Enter brand, model, year — or decode VIN automatically" },
  { num: "02", title: "Scan or enter codes", desc: "Use any OBD-II reader or type codes manually" },
  { num: "03", title: "Get AI analysis", desc: "Instant interpretation with repair suggestions and cost estimates" },
];

function HowItWorks() {
  return (
    <section className="py-24 px-6 bg-accent/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-3xl sm:text-4xl font-bold text-foreground"
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
              className="text-center"
            >
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold mb-4">
                {step.num}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
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
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-3xl sm:text-4xl font-bold text-foreground"
          >
            Simple pricing
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="mt-4 text-muted text-lg"
          >
            Start free, upgrade when you need more
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto"
        >
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              variants={scaleIn}
              custom={i}
              className={`relative rounded-2xl border p-6 ${
                plan.highlighted
                  ? "border-primary bg-card shadow-xl shadow-primary/10 scale-[1.02]"
                  : "border-border bg-card"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  Popular
                </div>
              )}
              <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted">{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted">
                    <CheckCircle2 size={15} className="text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className={`mt-6 h-10 w-full inline-flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25"
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
    <section className="py-24 px-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center"
      >
        <motion.div
          variants={fadeUp}
          custom={0}
          className="relative rounded-3xl border border-border bg-gradient-to-br from-card to-accent/50 p-12 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          <h2 className="relative text-3xl font-bold text-foreground mb-4">
            Ready to understand your car better?
          </h2>
          <p className="relative text-muted mb-8">
            Join thousands of car owners who save time and money with Smart OBD.
          </p>
          <Link
            href="/login"
            className="relative h-12 px-8 inline-flex items-center rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary-hover transition-all hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started — It's Free
            <ArrowRight size={18} className="ml-2" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1 select-none">
          <span className="text-sm font-extralight text-muted">Smart</span>
          <span className="text-sm font-black text-primary uppercase">OBD</span>
        </div>
        <div className="flex gap-6 text-xs text-muted">
          <span>&copy; {new Date().getFullYear()} Smart OBD Platform</span>
        </div>
      </div>
    </footer>
  );
}
