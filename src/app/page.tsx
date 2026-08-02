"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Award,
  Baby,
  BarChart3,
  CheckCircle2,
  Clock,
  Heart,
  Package,
  Phone,
  Rocket,
  Shield,
  Siren,
  Sparkles,
  Star,
  Truck,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";

interface CounterStat {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  icon: LucideIcon;
  color: string;
}

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  glow: string;
}

interface Step {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
}

const stats: CounterStat[] = [
  { label: "Active Users", value: 12846, icon: Users, color: "text-blue-200" },
  { label: "Alerts Resolved", value: 8392, icon: CheckCircle2, color: "text-green-200" },
  { label: "Avg Response", value: 7.2, suffix: " min", decimals: 1, icon: Clock, color: "text-orange-200" },
  { label: "Success Rate", value: 96.8, suffix: "%", decimals: 1, icon: Award, color: "text-purple-200" },
];

const features: Feature[] = [
  {
    title: "Emergency Services",
    description: "Instant ambulance dispatch with hospital coordination",
    icon: Siren,
    gradient: "from-red-500 to-orange-500",
    glow: "shadow-red-500/20 hover:border-red-300/40",
  },
  {
    title: "Women Safety",
    description: "SOS button, safe walk, and live location sharing",
    icon: Shield,
    gradient: "from-pink-500 to-rose-500",
    glow: "shadow-pink-500/20 hover:border-pink-300/40",
  },
  {
    title: "Child Safety",
    description: "Track children with geo-fence alerts",
    icon: Baby,
    gradient: "from-purple-500 to-indigo-500",
    glow: "shadow-purple-500/20 hover:border-purple-300/40",
  },
  {
    title: "Parent Monitor",
    description: "Real-time child location and activity",
    icon: UserCheck,
    gradient: "from-blue-500 to-cyan-500",
    glow: "shadow-blue-500/20 hover:border-blue-300/40",
  },
  {
    title: "Elder Care",
    description: "Reminders, wellness checks, and family alerts",
    icon: Heart,
    gradient: "from-green-500 to-emerald-500",
    glow: "shadow-green-500/20 hover:border-green-300/40",
  },
  {
    title: "Parcel Delivery",
    description: "Track deliveries with live agent location",
    icon: Package,
    gradient: "from-yellow-500 to-orange-500",
    glow: "shadow-yellow-500/20 hover:border-yellow-300/40",
  },
  {
    title: "Service Provider",
    description: "Manage services and grow your business",
    icon: Truck,
    gradient: "from-orange-500 to-red-500",
    glow: "shadow-orange-500/20 hover:border-orange-300/40",
  },
  {
    title: "Admin Dashboard",
    description: "Complete system control and analytics",
    icon: BarChart3,
    gradient: "from-cyan-500 to-blue-500",
    glow: "shadow-cyan-500/20 hover:border-cyan-300/40",
  },
];

const steps: Step[] = [
  {
    number: "01",
    title: "Sign Up",
    description: "Create your account with your role in seconds",
    icon: Users,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    number: "02",
    title: "Choose Service",
    description: "Select from 8 different safety modules",
    icon: Sparkles,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    number: "03",
    title: "Get Instant Help",
    description: "One tap for emergency, we handle the rest",
    icon: Zap,
    gradient: "from-orange-500 to-red-500",
  },
];

function formatCounter(value: number, decimals = 0) {
  return value.toLocaleString("en-IN", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
}

export default function HomePage() {
  const [animatedStats, setAnimatedStats] = useState(stats.map(() => 0));

  useEffect(() => {
    const duration = 1700;
    const frameMs = 24;
    const totalFrames = duration / frameMs;
    let frame = 0;

    const interval = window.setInterval(() => {
      frame += 1;
      const progress = Math.min(frame / totalFrames, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedStats(stats.map((stat) => stat.value * eased));

      if (progress >= 1) {
        window.clearInterval(interval);
      }
    }, frameMs);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.2),transparent_30%),linear-gradient(180deg,#020617,#0f172a_45%,#111827)]" />

      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/20">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-wide text-white">Pravaah 360</p>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Safety Command</p>
            </div>
          </Link>

          <Link
            href="/login"
            className="group inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-blue-500/30"
          >
            Login
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </nav>

      <section className="relative flex min-h-screen items-center px-4 pb-20 pt-32 sm:px-6 lg:px-10">
        <div className="absolute left-8 top-28 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
        <div className="absolute right-8 top-40 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-pink-500/20 blur-3xl animate-pulse" />

        <div className="relative mx-auto max-w-7xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-white/[0.07] px-4 py-2 text-sm font-medium text-blue-100 shadow-2xl shadow-blue-950/20 backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-blue-300" />
            Trusted by 12,000+ Users in Vijayawada
          </div>

          <h1 className="mt-8 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-6xl font-black tracking-tight text-transparent sm:text-7xl lg:text-9xl">
            Pravaah 360
          </h1>
          <p className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            One App. Complete Safety. Zero Delays.
          </p>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
            Emergency services, women safety, child tracking, elder care, and delivery - all in one powerful platform.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="group inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 px-8 text-base font-bold text-white shadow-2xl shadow-blue-500/25 transition duration-300 hover:-translate-y-1 hover:shadow-blue-500/40"
            >
              Get Started
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
            <a
              href="tel:108"
              className="group inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-red-300/20 bg-white/[0.07] px-8 text-base font-bold text-white shadow-2xl shadow-slate-950/30 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-red-300/40 hover:bg-red-500/15"
            >
              <Phone className="h-5 w-5 text-red-300 transition group-hover:rotate-12" />
              Emergency: 108
            </a>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="group rounded-3xl border border-white/10 bg-white/[0.07] p-5 text-left shadow-2xl shadow-slate-950/30 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">{stat.label}</p>
                      <p className={`mt-2 text-3xl font-bold tracking-tight ${stat.color}`}>
                        {formatCounter(animatedStats[index], stat.decimals)}
                        {stat.suffix}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-white/15 to-white/5 p-3 shadow-lg">
                      <Icon className="h-6 w-6 text-white transition duration-300 group-hover:scale-110 group-hover:rotate-6" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-white/[0.07] px-4 py-2 text-sm font-medium text-purple-100 backdrop-blur-xl">
              <Rocket className="h-4 w-4 text-purple-300" />
              8 Powerful Modules
            </div>
            <h2 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-6xl">
              Everything You Need in{" "}
              <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">One App</span>
            </h2>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-slate-950/25 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:bg-white/[0.07] ${feature.glow}`}
                >
                  <ArrowRight className="absolute right-5 top-5 h-5 w-5 text-slate-500 transition duration-300 group-hover:translate-x-1 group-hover:text-white" />
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg transition duration-300 group-hover:rotate-6`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-white">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-slate-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-300/20 bg-white/[0.07] px-4 py-2 text-sm font-medium text-green-100 backdrop-blur-xl">
              <CheckCircle2 className="h-4 w-4 text-green-300" />
              Simple 3 Steps
            </div>
            <h2 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-6xl">
              Get Help in{" "}
              <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Seconds</span>
            </h2>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-2xl shadow-slate-950/25 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-white/20 hover:bg-white/[0.07]"
                >
                  <span className="absolute right-6 top-3 text-8xl font-black text-white opacity-[0.05]">{step.number}</span>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient} shadow-lg transition duration-300 group-hover:rotate-6`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <p className="mt-8 text-sm font-bold uppercase tracking-[0.24em] text-slate-500">Step {step.number}</p>
                  <h3 className="mt-3 text-2xl font-bold text-white">{step.title}</h3>
                  <p className="mt-3 leading-7 text-slate-400">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 p-8 text-center shadow-2xl shadow-purple-950/30 backdrop-blur-xl sm:p-14">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 shadow-2xl">
            <Star className="h-8 w-8 animate-pulse text-yellow-300" />
          </div>
          <h2 className="mt-8 text-4xl font-black tracking-tight text-white sm:text-6xl">
            Ready to Feel{" "}
            <span className="bg-gradient-to-r from-yellow-200 to-orange-300 bg-clip-text text-transparent">Safe?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Join thousands who trust Pravaah 360 for their daily safety needs.
          </p>
          <Link
            href="/login"
            className="group mt-9 inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 px-8 text-base font-black text-slate-950 shadow-2xl shadow-orange-500/25 transition duration-300 hover:-translate-y-1 hover:shadow-orange-500/40"
          >
            Join Pravaah 360 Now
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-12 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white">Pravaah 360</p>
                <p className="text-xs text-slate-500">Safety Command</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-400">A unified public safety platform built for faster help and calmer cities.</p>
          </div>
          <div>
            <h3 className="font-semibold text-white">Emergency Numbers</h3>
            <div className="mt-4 space-y-2 text-sm text-slate-400">
              <a href="tel:108" className="block hover:text-white">Ambulance 108</a>
              <a href="tel:100" className="block hover:text-white">Police 100</a>
              <a href="tel:101" className="block hover:text-white">Fire 101</a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white">Location</h3>
            <p className="mt-4 text-sm leading-7 text-slate-400">Vijayawada, Andhra Pradesh 520013</p>
            <p className="mt-2 text-xs text-slate-500">16.5062, 80.6480</p>
          </div>
          <div>
            <h3 className="font-semibold text-white">Get Started</h3>
            <Link
              href="/login"
              className="mt-4 inline-flex rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              Login
            </Link>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-sm text-slate-500">
          © 2026 Pravaah 360. Built with ❤️ for Safety.
        </p>
      </footer>
    </main>
  );
}
