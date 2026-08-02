"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  Baby,
  BarChart3,
  CheckCircle2,
  Heart,
  Loader2,
  Lock,
  MapPin,
  Package,
  Phone,
  Shield,
  Siren,
  Sparkles,
  Truck,
  UserCheck,
  Zap,
} from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import type { UserRole } from "@/types/roles";

interface RoleCard {
  id: string;
  name: string;
  description: string;
  features: string[];
  email: string;
  password: string;
  role: UserRole;
  route: string;
  icon: LucideIcon;
  gradient: string;
  glow: string;
}

interface InfoCard {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
}

const roles: RoleCard[] = [
  {
    id: "patient",
    name: "Patient",
    description: "Emergency medical services",
    features: ["SOS alerts", "Nearby hospitals", "Ambulance tracking"],
    email: "patient@pravaah360.in",
    password: "patient123",
    role: "patient",
    route: "/emergency",
    icon: Siren,
    gradient: "from-red-500 to-orange-500",
    glow: "shadow-red-500/20 hover:border-red-300/40",
  },
  {
    id: "women",
    name: "Women Safety",
    description: "Personal safety companion",
    features: ["SOS button", "Safe walk", "Live location"],
    email: "women@pravaah360.in",
    password: "women123",
    role: "women_safety",
    route: "/womensafety",
    icon: Shield,
    gradient: "from-pink-500 to-rose-500",
    glow: "shadow-pink-500/20 hover:border-pink-300/40",
  },
  {
    id: "parent",
    name: "Parent",
    description: "Monitor your children",
    features: ["Live tracking", "Screen time", "Geo-fences"],
    email: "parent@pravaah360.in",
    password: "parent123",
    role: "parent_user",
    route: "/parent",
    icon: UserCheck,
    gradient: "from-blue-500 to-cyan-500",
    glow: "shadow-blue-500/20 hover:border-blue-300/40",
  },
  {
    id: "child",
    name: "Child",
    description: "Kid-friendly safety app",
    features: ["SOS button", "Safe zones", "Parent contact"],
    email: "child@pravaah360.in",
    password: "child123",
    role: "child_user",
    route: "/child",
    icon: Baby,
    gradient: "from-purple-500 to-indigo-500",
    glow: "shadow-purple-500/20 hover:border-purple-300/40",
  },
  {
    id: "elder",
    name: "Elder Care",
    description: "Senior citizen support",
    features: ["Reminders", "Emergency help", "Family alerts"],
    email: "elder@pravaah360.in",
    password: "elder123",
    role: "elderly_user",
    route: "/eldercare",
    icon: Heart,
    gradient: "from-green-500 to-emerald-500",
    glow: "shadow-green-500/20 hover:border-green-300/40",
  },
  {
    id: "parcel",
    name: "Parcel User",
    description: "Track deliveries",
    features: ["Live tracking", "Delivery updates", "Rate service"],
    email: "user@pravaah360.in",
    password: "user123",
    role: "parcel_user",
    route: "/parcel",
    icon: Package,
    gradient: "from-yellow-500 to-orange-500",
    glow: "shadow-yellow-500/20 hover:border-yellow-300/40",
  },
  {
    id: "driver",
    name: "Service Provider",
    description: "Delivery & services",
    features: ["Manage orders", "Track earnings", "Rating system"],
    email: "driver@pravaah360.in",
    password: "driver123",
    role: "driver",
    route: "/driver",
    icon: Truck,
    gradient: "from-orange-500 to-red-500",
    glow: "shadow-orange-500/20 hover:border-orange-300/40",
  },
  {
    id: "admin",
    name: "System Admin",
    description: "Complete platform control",
    features: ["User management", "Analytics", "System settings"],
    email: "admin@pravaah360.in",
    password: "admin123",
    role: "admin",
    route: "/admin",
    icon: BarChart3,
    gradient: "from-cyan-500 to-blue-500",
    glow: "shadow-cyan-500/20 hover:border-cyan-300/40",
  },
];

const infoCards: InfoCard[] = [
  {
    title: "Instant Access",
    description: "One click to access your role's dashboard",
    icon: Zap,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Secure Login",
    description: "Encrypted authentication for all users",
    icon: Shield,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Vijayawada Ready",
    description: "Configured for Vijayawada, AP 520013",
    icon: MapPin,
    gradient: "from-green-500 to-emerald-500",
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleRoleLogin = async (roleCard: RoleCard) => {
    if (loadingRole) {
      return;
    }

    setLoadingRole(roleCard.id);
    localStorage.setItem("userEmail", roleCard.email);
    localStorage.setItem("selectedService", roleCard.id);

    try {
      const success = await login(roleCard.email, roleCard.password, roleCard.role);
      if (!success) {
        setLoadingRole(null);
        alert("Login failed. Please try again.");
        return;
      }

      window.setTimeout(() => {
        window.location.href = roleCard.route;
      }, 800);
    } catch (error) {
      console.error("Login error:", error);
      setLoadingRole(null);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.2),transparent_30%),linear-gradient(180deg,#020617,#0f172a_45%,#111827)]" />
      <div className="absolute left-8 top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
      <div className="absolute right-10 top-40 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-pink-500/20 blur-3xl animate-pulse" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] transition group-hover:-translate-x-1">
              <ArrowLeft className="h-5 w-5 text-slate-200" />
            </span>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/20">
              <Zap className="h-5 w-5 text-white" />
            </span>
            <span>
              <span className="block font-bold text-white">Pravaah 360</span>
              <span className="block text-xs text-slate-400">Back to Home</span>
            </span>
          </Link>

          <a
            href="tel:108"
            className="group inline-flex h-11 w-fit items-center gap-2 rounded-xl border border-red-300/20 bg-red-500/10 px-4 text-sm font-bold text-red-100 transition hover:-translate-y-0.5 hover:border-red-300/40 hover:bg-red-500/20"
          >
            <Phone className="h-4 w-4 transition group-hover:rotate-12" />
            Emergency 108
          </a>
        </div>
      </header>

      <section className="relative px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-white/[0.07] px-4 py-2 text-sm font-medium text-blue-100 shadow-2xl shadow-blue-950/20 backdrop-blur-xl"
          >
            <Sparkles className="h-4 w-4 text-blue-300" />
            Choose Your Access
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-6 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-7xl"
          >
            Choose Your Role
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-300"
          >
            Select how you want to use Pravaah 360. Click any card to instantly access your dashboard.
          </motion.p>
        </div>

        <div className="mx-auto mt-14 grid max-w-7xl gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {roles.map((roleCard, index) => {
            const Icon = roleCard.icon;
            const isLoading = loadingRole === roleCard.id;
            const isDisabled = Boolean(loadingRole && !isLoading);

            return (
              <motion.button
                key={roleCard.id}
                type="button"
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index, duration: 0.45 }}
                whileHover={isDisabled ? undefined : { y: -8 }}
                onClick={() => handleRoleLogin(roleCard)}
                disabled={Boolean(loadingRole)}
                className={`group relative flex min-h-[360px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-left shadow-2xl shadow-slate-950/25 backdrop-blur-xl transition duration-300 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50 ${roleCard.glow}`}
              >
                <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-200">
                  <Lock className="h-3.5 w-3.5" />
                  Auto
                </span>

                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${roleCard.gradient} shadow-lg transition duration-300 group-hover:rotate-6`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>

                <h2 className="mt-6 text-2xl font-bold text-white">{roleCard.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{roleCard.description}</p>

                <div className="mt-5 space-y-2">
                  {roleCard.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-green-300" />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-3 text-xs text-slate-500">
                  <p className="truncate text-slate-300">{roleCard.email}</p>
                  <p className="mt-1">{roleCard.password}</p>
                </div>

                <span className={`mt-auto inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${roleCard.gradient} px-4 text-sm font-bold text-white shadow-lg transition duration-300 group-hover:shadow-2xl`}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Continue as {roleCard.name}
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {infoCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + index * 0.08 }}
                className="group rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-slate-950/25 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} transition duration-300 group-hover:rotate-6`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">{card.title}</h3>
                <p className="mt-2 leading-7 text-slate-400">{card.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <a href="tel:108" className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 transition hover:text-white">108</a>
            <a href="tel:100" className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 transition hover:text-white">100</a>
            <a href="tel:101" className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 transition hover:text-white">101</a>
          </div>
          <p>© 2026 Pravaah 360 · Built for Vijayawada, Andhra Pradesh</p>
        </div>
      </footer>
    </main>
  );
}
