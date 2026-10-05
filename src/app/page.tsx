// PRAVAH 360 - Main Application Landing Page

import React from 'react';
import Link from 'next/link';
import { 
  Siren, Shield, Baby, UserCheck, Heart, CloudRain, Truck, BarChart3, 
  ArrowRight, Zap, CheckCircle2, Clock, Trophy, Users, Phone, Sparkles 
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-white bg-clip-text text-transparent">
              Pravaah 360
            </span>
            <span className="block text-[10px] text-purple-300/70 font-semibold tracking-wider uppercase">SAFETY COMMAND</span>
          </div>
        </div>

        <Link
          href="/login"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:scale-105 active:scale-95"
        >
          <span>Login</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 max-w-7xl mx-auto text-center flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-8 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Trusted by 12,000+ Users in Vijayawada</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
          Pravaah 360
        </h1>

        <p className="text-2xl md:text-4xl font-bold text-white mb-4">
          One App. Complete Safety. Zero Delays.
        </p>

        <p className="text-slate-400 text-base md:text-lg max-w-2xl mb-10">
          Emergency services, women safety, child tracking, elder care, and flood intelligence — all in one powerful platform.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            href="/login"
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/20 hover:scale-105 transition-all flex items-center gap-2"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="tel:108"
            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all flex items-center gap-2"
          >
            <Phone className="w-5 h-5 text-red-400" />
            <span>Emergency: 108</span>
          </a>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
          <div className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl backdrop-blur-md text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 font-medium">Active Users</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-white">12,846</div>
          </div>
          <div className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl backdrop-blur-md text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 font-medium">Alerts Resolved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">8,392</div>
          </div>
          <div className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl backdrop-blur-md text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 font-medium">Avg Response</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white">7.2 min</div>
          </div>
          <div className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl backdrop-blur-md text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 font-medium">Success Rate</span>
              <Trophy className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-white">96.8%</div>
          </div>
        </div>
      </section>

      {/* 8 Powerful Modules Grid */}
      <section className="px-6 py-20 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
            🚀 8 Powerful Modules
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white">
            Everything You Need in <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">One App</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Emergency */}
          <Link href="/login" className="group bg-slate-900/60 border border-white/10 rounded-3xl p-6 hover:-translate-y-2 transition-all hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-500/10 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Siren className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Emergency Services</h3>
            <p className="text-sm text-slate-400">Instant ambulance dispatch with hospital coordination</p>
          </Link>

          {/* Card 2: Women Safety */}
          <Link href="/login" className="group bg-slate-900/60 border border-white/10 rounded-3xl p-6 hover:-translate-y-2 transition-all hover:border-pink-500/50 hover:shadow-2xl hover:shadow-pink-500/10 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Women Safety</h3>
            <p className="text-sm text-slate-400">SOS button, safe walk, and live location sharing</p>
          </Link>

          {/* Card 3: Child Safety */}
          <Link href="/login" className="group bg-slate-900/60 border border-white/10 rounded-3xl p-6 hover:-translate-y-2 transition-all hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <Baby className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Child Safety</h3>
            <p className="text-sm text-slate-400">Track children with geo-fence alerts</p>
          </Link>

          {/* Card 4: Parent Monitor */}
          <Link href="/login" className="group bg-slate-900/60 border border-white/10 rounded-3xl p-6 hover:-translate-y-2 transition-all hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Parent Monitor</h3>
            <p className="text-sm text-slate-400">Real-time child location and activity</p>
          </Link>

          {/* Card 5: Elder Care */}
          <Link href="/login" className="group bg-slate-900/60 border border-white/10 rounded-3xl p-6 hover:-translate-y-2 transition-all hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Elder Care</h3>
            <p className="text-sm text-slate-400">Reminders, wellness checks, and family alerts</p>
          </Link>

          {/* Card 6: URBAN FLOOD (SWAPPED FROM PARCEL) */}
          <Link href="/flood" className="group bg-slate-900/60 border border-cyan-500/30 rounded-3xl p-6 hover:-translate-y-2 transition-all hover:border-cyan-500/70 hover:shadow-2xl hover:shadow-cyan-500/20 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <CloudRain className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Urban Flood</h3>
            <p className="text-sm text-slate-400">0–3 hr nowcasting and flood-safe route planning</p>
          </Link>

          {/* Card 7: Service Provider (UNTOUCHED) */}
          <Link href="/login" className="group bg-slate-900/60 border border-white/10 rounded-3xl p-6 hover:-translate-y-2 transition-all hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Service Provider</h3>
            <p className="text-sm text-slate-400">Manage services and grow your business</p>
          </Link>

          {/* Card 8: Admin Dashboard */}
          <Link href="/login" className="group bg-slate-900/60 border border-white/10 rounded-3xl p-6 hover:-translate-y-2 transition-all hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Admin Dashboard</h3>
            <p className="text-sm text-slate-400">Complete system control and analytics</p>
          </Link>
        </div>
      </section>

      {/* Simple 3 Steps */}
      <section className="px-6 py-20 bg-slate-900/30 border-y border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-4">
            <CheckCircle2 className="w-4 h-4" />
            <span>Simple 3 Steps</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-12">
            Get Help in <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Seconds</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-slate-900/80 border border-white/10 p-8 rounded-3xl relative overflow-hidden">
              <span className="text-6xl font-black text-white/5 absolute top-4 right-6">01</span>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Step 01</p>
              <h3 className="text-xl font-bold text-white mb-2">Sign Up</h3>
              <p className="text-sm text-slate-400">Create your account with your role in seconds</p>
            </div>

            <div className="bg-slate-900/80 border border-white/10 p-8 rounded-3xl relative overflow-hidden">
              <span className="text-6xl font-black text-white/5 absolute top-4 right-6">02</span>
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-6">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Step 02</p>
              <h3 className="text-xl font-bold text-white mb-2">Choose Service</h3>
              <p className="text-sm text-slate-400">Select from 8 different safety modules</p>
            </div>

            <div className="bg-slate-900/80 border border-white/10 p-8 rounded-3xl relative overflow-hidden">
              <span className="text-6xl font-black text-white/5 absolute top-4 right-6">03</span>
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-6">
                <Zap className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Step 03</p>
              <h3 className="text-xl font-bold text-white mb-2">Get Instant Help</h3>
              <p className="text-sm text-slate-400">One tap for emergency, we handle the rest</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Feel Safe CTA */}
      <section className="px-6 py-20 max-w-5xl mx-auto w-full">
        <div className="bg-gradient-to-br from-purple-900/40 via-slate-900 to-pink-900/40 border border-purple-500/20 rounded-3xl p-12 text-center relative overflow-hidden backdrop-blur-xl">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-6 h-6" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Ready to Feel <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Safe?</span>
          </h2>
          <p className="text-slate-300 text-lg max-w-xl mx-auto mb-8">
            Join thousands who trust Pravaah 360 for their daily safety needs.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-2xl shadow-lg transition-all hover:scale-105"
          >
            <span>Join Pravaah 360 Now</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-slate-950 px-6 py-12 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span>Pravaah 360</span>
            </div>
            <p className="text-xs text-slate-500">SAFETY COMMAND</p>
            <p className="mt-4 text-xs">A unified public safety platform built for faster help and calmer cities.</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Emergency Numbers</h4>
            <ul className="space-y-2 text-xs">
              <li>Ambulance: <span className="text-white font-bold">108</span></li>
              <li>Police: <span className="text-white font-bold">100</span></li>
              <li>Fire: <span className="text-white font-bold">101</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Location</h4>
            <p className="text-xs text-white">Vijayawada, Andhra Pradesh 520013</p>
            <p className="text-xs text-slate-500 mt-1">16.5062, 80.6480</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Get Started</h4>
            <Link href="/login" className="inline-block px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg text-xs hover:bg-purple-500 transition-colors">
              Login →
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/5 pt-6 text-center text-xs text-slate-600">
          © 2026 Pravaah 360. Built with ❤️ for Safety.
        </div>
      </footer>
    </div>
  );
}