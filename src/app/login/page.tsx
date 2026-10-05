// PRAVAH 360 - Login / Role Picker Page (Card Grid UI)

"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Siren, Shield, Baby, UserCheck, Heart, CloudRain, Truck, BarChart3, 
  ArrowLeft, Lock, CheckCircle2, Zap, Phone, Sparkles, ArrowRight 
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const roles = [
    {
      id: "patient",
      title: "Patient",
      subtitle: "Emergency medical services",
      icon: Siren,
      color: "bg-orange-500",
      btnGradient: "from-orange-500 to-amber-500",
      bullets: ["SOS alerts", "Nearby hospitals", "Ambulance tracking"],
      email: "patient@pravaah360.in",
      password: "patient123",
      btnText: "Continue as Patient",
    },
    {
      id: "womensafety",
      title: "Women Safety",
      subtitle: "Personal safety companion",
      icon: Shield,
      color: "bg-pink-500",
      btnGradient: "from-pink-500 to-rose-500",
      bullets: ["SOS button", "Safe walk", "Live location"],
      email: "women@pravaah360.in",
      password: "women123",
      btnText: "Continue as Women Safety",
    },
    {
      id: "parent",
      title: "Parent",
      subtitle: "Monitor your children",
      icon: UserCheck,
      color: "bg-blue-500",
      btnGradient: "from-blue-500 to-cyan-500",
      bullets: ["Live tracking", "Screen time", "Geo-fences"],
      email: "parent@pravaah360.in",
      password: "parent123",
      btnText: "Continue as Parent",
    },
    {
      id: "child",
      title: "Child",
      subtitle: "Kid-friendly safety app",
      icon: Baby,
      color: "bg-purple-500",
      btnGradient: "from-purple-500 to-indigo-500",
      bullets: ["SOS button", "Safe zones", "Parent contact"],
      email: "child@pravaah360.in",
      password: "child123",
      btnText: "Continue as Child",
    },
    {
      id: "eldercare",
      title: "Elder Care",
      subtitle: "Senior citizen support",
      icon: Heart,
      color: "bg-emerald-500",
      btnGradient: "from-emerald-500 to-teal-500",
      bullets: ["Reminders", "Emergency help", "Family alerts"],
      email: "elder@pravaah360.in",
      password: "elder123",
      btnText: "Continue as Elder Care",
    },
    {
      /* SWAPPED PARCEL USER FOR FLOOD RESPONSE */
      id: "flood",
      title: "Flood Response",
      subtitle: "Urban flood intelligence",
      icon: CloudRain,
      color: "bg-cyan-500",
      btnGradient: "from-cyan-500 to-blue-600",
      bullets: ["Live flood map", "Safe routing", "Rescue alerts"],
      email: "flood@pravaah360.in",
      password: "flood123",
      btnText: "Continue as Flood Response",
      isFlood: true,
    },
    {
      /* UNTOUCHED SERVICE PROVIDER */
      id: "driver",
      title: "Service Provider",
      subtitle: "Delivery & services",
      icon: Truck,
      color: "bg-orange-500",
      btnGradient: "from-orange-500 to-amber-500",
      bullets: ["Manage orders", "Track earnings", "Rating system"],
      email: "driver@pravaah360.in",
      password: "driver123",
      btnText: "Continue as Service Provider",
    },
    {
      id: "admin",
      title: "System Admin",
      subtitle: "Complete platform control",
      icon: BarChart3,
      color: "bg-blue-500",
      btnGradient: "from-blue-500 to-indigo-500",
      bullets: ["User management", "Analytics", "System settings"],
      email: "admin@pravaah360.in",
      password: "admin123",
      btnText: "Continue as System Admin",
    },
  ];

    const handleLogin = (roleId: string) => {
    // Map role card IDs → real routes
    const routeMap: Record<string, string> = {
      patient: "/emergency",      // Patient card → Emergency dashboard
      flood: "/flood",
      womensafety: "/womensafety",
      parent: "/parent",
      child: "/child",
      eldercare: "/eldercare",
      driver: "/driver",
      admin: "/admin",
    };

    const path = routeMap[roleId] || `/${roleId}`;
    router.push(path);
  };
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans p-6">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between mb-8">
        <Link
          href="/"
          className="flex items-center gap-3 p-2 bg-slate-900 border border-white/10 rounded-2xl hover:bg-slate-800 transition-colors"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Pravaah 360</div>
            <div className="text-[10px] text-slate-400">Back to Home</div>
          </div>
        </Link>

        <a
          href="tel:108"
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold"
        >
          <Phone className="w-4 h-4" />
          <span>Emergency 108</span>
        </a>
      </header>

      {/* Hero Heading */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-4">
          <Sparkles className="w-4 h-4" />
          <span>Choose Your Access</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-white bg-clip-text text-transparent mb-3">
          Choose Your Role
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
          Select how you want to use Pravaah 360. Click any card to instantly access your dashboard.
        </p>
      </div>

      {/* 8 Role Cards Grid */}
      <main className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`bg-slate-900/80 border ${
              role.isFlood ? "border-cyan-500/50 shadow-lg shadow-cyan-500/10" : "border-white/10"
            } rounded-3xl p-6 flex flex-col justify-between hover:border-white/30 transition-all`}
          >
            <div>
              {/* Header row with Icon and Auto Badge */}
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl ${role.color} flex items-center justify-center`}>
                  <role.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] text-slate-400">
                  <Lock className="w-3 h-3" />
                  <span>Auto</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">{role.title}</h3>
              <p className="text-xs text-slate-400 mb-6">{role.subtitle}</p>

              {/* 3 Bullets */}
              <div className="space-y-2 mb-6">
                {role.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Credentials box + CTA Button */}
            <div>
              <div className="bg-slate-950/80 border border-white/5 rounded-2xl p-3 mb-4 font-mono text-xs text-slate-400">
                <p>{role.email}</p>
                <p className="text-slate-600">{role.password}</p>
              </div>

              <button
                onClick={() => handleLogin(role.id)}
                className={`w-full py-3 px-4 bg-gradient-to-r ${role.btnGradient} text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-98`}
              >
                <span>{role.btnText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* 3 Bottom Cards */}
      <footer className="max-w-7xl mx-auto w-full pt-6 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Instant Access</h4>
              <p className="text-xs text-slate-400 mt-1">One click to access your role&apos;s dashboard</p>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Secure Login</h4>
              <p className="text-xs text-slate-400 mt-1">Encrypted authentication for all users</p>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Vijayawada Ready</h4>
              <p className="text-xs text-slate-400 mt-1">Configured for Vijayawada, AP 520013</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-slate-900 rounded-full border border-white/5">108</span>
            <span className="px-3 py-1 bg-slate-900 rounded-full border border-white/5">100</span>
            <span className="px-3 py-1 bg-slate-900 rounded-full border border-white/5">101</span>
          </div>
          <div>© 2026 Pravaah 360 · Built for Vijayawada, Andhra Pradesh</div>
        </div>
      </footer>
    </div>
  );
}
