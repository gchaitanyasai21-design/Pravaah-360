"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Eye,
  Home,
  LogOut,
  Moon,
  Phone,
  Radio,
  Search,
  Settings,
  Shield,
  Trash2,
  Truck,
  Users,
} from "lucide-react";
import LiveMap from "@/components/LiveMap";
import { AppProvider } from "@/store/AppContext";
import {
  ambulances,
  hospitals,
  sosAlerts,
  trafficSignals,
  vijayawadaCenter,
} from "@/lib/pravaahDashboardData";

const stats = [
  { label: "Total Users", value: "12,846", note: "+18.4% this month", icon: Users, color: "bg-blue-500/20 text-blue-300" },
  { label: "Active Emergencies", value: "8", note: "3 high priority", icon: AlertTriangle, color: "bg-rose-500/20 text-rose-300" },
  { label: "Response Time Avg", value: "7.2 min", note: "-14% faster today", icon: Activity, color: "bg-emerald-500/20 text-emerald-300" },
  { label: "Success Rate", value: "96.8%", note: "SLA badge active", icon: CheckCircle2, color: "bg-orange-500/20 text-orange-300" },
];

const feed = [
  "AMB-002 dispatched from Benz Circle to Andhra Hospitals",
  "Women Safety alert moved to responding at MG Road",
  "Provider KIMS Hospital updated bed availability",
  "Signal jump approved for AMB-005 on MG Road",
  "SOS-103 escalated to high priority",
];

const users = [
  { a: "RK", n: "Ravi Kumar", e: "ravi.kumar@pravaah360.in", r: "Patient", rc: "bg-blue-500/20 text-blue-300", s: "Active", j: "12 Jan 2026" },
  { a: "PS", n: "Priya Sharma", e: "priya.sharma@pravaah360.in", r: "Admin", rc: "bg-purple-500/20 text-purple-300", s: "Active", j: "24 Jan 2026" },
  { a: "AR", n: "Arjun Reddy", e: "arjun.reddy@pravaah360.in", r: "Driver", rc: "bg-green-500/20 text-green-300", s: "Inactive", j: "04 Feb 2026" },
  { a: "SI", n: "Sneha Iyer", e: "sneha.iyer@pravaah360.in", r: "Provider", rc: "bg-orange-500/20 text-orange-300", s: "Active", j: "19 Feb 2026" },
  { a: "KN", n: "Kiran Naidu", e: "kiran.naidu@pravaah360.in", r: "Driver", rc: "bg-green-500/20 text-green-300", s: "Active", j: "02 Mar 2026" },
];

const liveAlerts = [
  { type: "Emergency", name: "Ravi Kumar", phone: "+91 98765 41001", place: "Benz Circle", status: "Active", ago: "2 min ago", high: true },
  { type: "Women Safety", name: "Priya Sharma", phone: "+91 98765 41002", place: "MG Road", status: "Responding", ago: "5 min ago", high: true },
  { type: "Emergency", name: "Kiran Naidu", phone: "+91 98765 41005", place: "Kanaka Durga Flyover", status: "Active", ago: "14 min ago", high: true },
];

const providers = [
  { name: "Aster Ramesh Hospital", phone: "+91 866 246 3463", rating: "4.6", status: "Available" },
  { name: "Manipal Hospital Vijayawada", phone: "+91 866 681 1111", rating: "4.7", status: "Available" },
  { name: "Andhra Hospitals", phone: "+91 866 257 4757", rating: "4.8", status: "Available" },
  { name: "Government General Hospital", phone: "+91 866 257 0000", rating: "4.9", status: "Busy" },
  { name: "Nagarjuna Hospital", phone: "+91 866 246 9700", rating: "4.6", status: "Available" },
  { name: "Rainbow Children's Hospital", phone: "+91 866 668 8000", rating: "4.7", status: "Available" },
];

function AdminPageContent() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [autoDispatch, setAutoDispatch] = useState(true);
  const [signalPreempt, setSignalPreempt] = useState(true);
  const [adminApproval, setAdminApproval] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [digestNotif, setDigestNotif] = useState(false);
  const [ambNum, setAmbNum] = useState("108");
  const [policeNum, setPoliceNum] = useState("100");
  const [fireNum, setFireNum] = useState("101");
  const [saved, setSaved] = useState(false);

  const nav = [
    { label: "Dashboard", icon: Home },
    { label: "Users", icon: Users },
    { label: "Alerts", icon: AlertTriangle },
    { label: "Analytics", icon: Activity },
    { label: "Providers", icon: Truck },
    { label: "Settings", icon: Settings },
  ];

  return (
    <main className="flex min-h-screen overflow-y-auto pb-12 bg-[#0B0F19] text-white">
      {/* SIDEBAR */}
      <aside className="flex w-[288px] shrink-0 flex-col border-r border-white/5 bg-[#080C17] p-5 sticky top-0 h-screen">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 shadow-[0_0_28px_rgba(99,102,241,.45)]">
            <Shield className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-black">Pravaah 360</h1>
            <p className="text-xs font-black uppercase tracking-[.32em] text-slate-400">Safety Command</p>
          </div>
        </div>

        <nav className="space-y-2">
          {nav.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => setActiveTab(label)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-black transition-all ${
                activeTab === label
                  ? "border-blue-500 bg-blue-600 text-white"
                  : "border-white/10 bg-transparent text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-blue-500/20 bg-blue-950/35 p-4">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-black">
            <Radio className="h-4 w-4 text-emerald-400" />
            Vijayawada Grid
          </h2>
          <p className="text-sm font-semibold text-slate-300">
            Emergency numbers live: <span className="font-black text-white">108, 100, 101</span>
          </p>
          <p className="mt-4 text-sm text-slate-500">16.5062, 80.6480</p>
        </div>
      </aside>

      {/* MAIN */}
      <section className="min-w-0 flex-1 overflow-y-auto">
        <header className="border-b border-white/5 px-8 py-5 sticky top-0 z-40 bg-[#0B0F19]/95 backdrop-blur">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-400">
                Admin Console - Vijayawada, Andhra Pradesh - {activeTab}
              </p>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Auto-refresh live
              </span>
              <h2 className="mt-3 max-w-xl text-4xl font-black leading-tight tracking-tight">
                Public Safety Operations Dashboard
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-72 items-center gap-3 rounded-xl border border-white/10 bg-[#1A1F2E] px-4 text-slate-500">
                <Search className="h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search users, email, ID..."
                  className="bg-transparent text-sm text-white outline-none w-full placeholder:text-slate-500"
                />
              </div>
              <button type="button" className="relative rounded-xl border border-white/10 bg-[#1A1F2E] p-3">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
              </button>
              <button type="button" className="rounded-xl border border-white/10 bg-[#1A1F2E] p-3">
                <Moon className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#1A1F2E] px-4 py-2">
                <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-violet-500 font-black">
                  AD
                </span>
                <div>
                  <p className="text-sm font-black">System Admin</p>
                  <p className="text-xs text-slate-400">admin@pravaah360.in</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => (window.location.href = "/login")}
                className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-black"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="space-y-6 p-8">
          {/* ========== DASHBOARD ========== */}
          {activeTab === "Dashboard" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map(({ label, value, note, icon: Icon, color }) => (
                  <article key={label} className="rounded-3xl border border-white/5 bg-[#131826] p-5">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-semibold text-slate-400">{label}</p>
                      <div className={`rounded-2xl p-3 ${color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <p className="mt-2 text-3xl font-black">{value}</p>
                    <span className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-black text-slate-300">
                      {note}
                    </span>
                  </article>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <article className="xl:col-span-8 rounded-3xl border border-white/5 bg-[#131826] p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="flex items-center gap-2 text-2xl font-black">
                        <Shield className="h-5 w-5 text-blue-400" />
                        Vijayawada Live Command Map
                      </h3>
                      <p className="mt-2 text-sm font-semibold text-slate-400">
                        Ambulances, SOS units, hospitals, and signal health around Benz Circle.
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-black text-emerald-300">
                      Live feed ready
                    </span>
                  </div>
                  <div className="h-[420px] overflow-hidden rounded-2xl border border-white/5">
                    <LiveMap
                      center={vijayawadaCenter}
                      zoom={13}
                      ambulances={ambulances}
                      hospitals={hospitals}
                      sosVehicles={sosAlerts}
                      trafficSignals={trafficSignals}
                      responseVehicles={sosAlerts.slice(0, 3)}
                    />
                  </div>
                </article>

                <article className="xl:col-span-4 rounded-3xl border border-white/5 bg-[#131826] p-5">
                  <h3 className="flex items-center gap-2 text-2xl font-black">
                    <Activity className="h-5 w-5 text-blue-400" />
                    Recent Activity
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-slate-400">Live operations feed</p>
                  <div className="mt-6 space-y-3">
                    {feed.map((item, index) => (
                      <div key={item} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                        <div className="flex gap-3">
                          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400" />
                          <p className="text-sm font-bold text-slate-200">{item}</p>
                        </div>
                        <p className="ml-5 mt-2 text-xs text-slate-500">{index + 2} min ago</p>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </>
          )}

          {/* ========== USERS ========== */}
          {activeTab === "Users" && (
            <div className="rounded-3xl border border-white/5 bg-[#131826] p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-400" /> User Management
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Manage admins, patients, drivers, and emergency providers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Add New User form would open here")}
                  className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-sm font-black"
                >
                  + Add New User
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-slate-500 border-b border-white/5">
                    <tr>
                      <th className="pb-4">Avatar</th>
                      <th className="pb-4">Name</th>
                      <th className="pb-4">Email</th>
                      <th className="pb-4">Role</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4">Joined</th>
                      <th className="pb-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr key={u.e}>
                        <td className="py-4">
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-xs font-black">
                            {u.a}
                          </div>
                        </td>
                        <td className="py-4 font-bold">{u.n}</td>
                        <td className="py-4 text-slate-400">{u.e}</td>
                        <td className="py-4">
                          <span className={`rounded px-2 py-1 text-xs font-bold ${u.rc}`}>{u.r}</span>
                        </td>
                        <td className="py-4">
                          <span className="inline-flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                u.s === "Active" ? "bg-emerald-400" : "bg-slate-500"
                              }`}
                            />
                            {u.s}
                          </span>
                        </td>
                        <td className="py-4 text-slate-400">{u.j}</td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => alert(`View ${u.n}`)}
                              className="rounded-lg bg-white/5 p-2 hover:bg-white/10"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => alert(`Remove ${u.n}?`)}
                              className="rounded-lg bg-white/5 p-2 hover:bg-white/10"
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs text-slate-500">Showing 5 of 10 users</p>
            </div>
          )}

          {/* ========== ALERTS ========== */}
          {activeTab === "Alerts" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <article className="xl:col-span-7 rounded-3xl border border-white/5 bg-[#131826] p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-black">Vijayawada Live Command Map</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      Ambulances, SOS units, hospitals, and signal health around Benz Circle.
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-black text-emerald-300">
                    Live feed ready
                  </span>
                </div>
                <div className="h-[420px] overflow-hidden rounded-2xl border border-white/5">
                  <LiveMap
                    center={vijayawadaCenter}
                    zoom={13}
                    ambulances={ambulances}
                    hospitals={hospitals}
                    sosVehicles={sosAlerts}
                    trafficSignals={trafficSignals}
                    responseVehicles={sosAlerts.slice(0, 3)}
                  />
                </div>
              </article>

              <article className="xl:col-span-5 rounded-3xl border border-white/5 bg-[#131826] p-5">
                <h3 className="mb-2 flex items-center gap-2 text-xl font-black text-rose-300">
                  <AlertTriangle className="h-5 w-5" /> Live SOS Alerts
                </h3>
                <p className="mb-4 text-sm text-slate-400">
                  8 active Vijayawada incidents in dispatch queue.
                </p>
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {liveAlerts.map((a) => (
                    <div key={a.phone + a.ago} className="rounded-2xl border border-white/5 bg-[#1A2235] p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-black flex items-center gap-2">
                          {a.type}
                          {a.high && (
                            <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] text-rose-300">
                              High
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-slate-500">{a.ago}</span>
                      </div>
                      <p className="text-sm text-slate-300">
                        {a.name} · {a.phone}
                      </p>
                      <p className="mt-2 text-xs text-cyan-400">
                        📍 {a.place} · {a.status}
                      </p>
                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => alert(`Responding to ${a.name}`)}
                          className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-black"
                        >
                          Respond
                        </button>
                        <button
                          type="button"
                          onClick={() => alert(`Dispatching unit to ${a.place}`)}
                          className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-black"
                        >
                          Dispatch
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          )}

          {/* ========== ANALYTICS ========== */}
          {activeTab === "Analytics" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">Analytics Command Center</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Operational trends, response performance, and alert mix.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Exporting reports...")}
                  className="rounded-xl border border-white/10 bg-[#1A1F2E] px-4 py-2 text-sm font-black"
                >
                  Export Reports
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map(({ label, value, note, icon: Icon, color }) => (
                  <article key={label} className="rounded-3xl border border-white/5 bg-[#131826] p-5">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-semibold text-slate-400">{label}</p>
                      <div className={`rounded-2xl p-3 ${color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <p className="mt-2 text-3xl font-black">{value}</p>
                    <span className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-black text-slate-300">
                      {note}
                    </span>
                  </article>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="rounded-3xl border border-white/5 bg-[#131826] p-6">
                  <h3 className="font-black text-slate-300 mb-4">Alerts per Day · Last 7 days</h3>
                  <div className="flex h-40 items-end gap-3">
                    {[40, 55, 48, 72, 88, 70, 58].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-blue-600 to-violet-400"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/5 bg-[#131826] p-6">
                  <h3 className="font-black text-slate-300 mb-4">Response Trend · Last 30 days</h3>
                  <div className="h-40 flex items-center justify-center gap-6 text-emerald-400 font-black">
                    <span className="rounded-full border border-emerald-500/40 px-3 py-2">9.8</span>
                    <span className="rounded-full border border-emerald-500/40 px-3 py-2">9.1</span>
                    <span className="rounded-full border border-emerald-500/40 px-3 py-2">8.6</span>
                    <span className="rounded-full border border-emerald-500/40 px-3 py-2">7.9</span>
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-400 px-3 py-2">
                      7.2
                    </span>
                  </div>
                  <p className="text-center text-xs text-slate-500 mt-2">W1 → W2 → W3 → W4 → Now (min)</p>
                </div>

                <div className="rounded-3xl border border-white/5 bg-[#131826] p-6">
                  <h3 className="font-black text-slate-300 mb-4">Alert Types</h3>
                  <div className="flex flex-col items-center">
                    <div className="relative grid h-36 w-36 place-items-center rounded-full border-[14px] border-rose-500 border-r-blue-500 border-b-orange-500 border-l-emerald-500">
                      <div className="text-center">
                        <div className="text-2xl font-black">239</div>
                        <div className="text-[10px] text-slate-400">alerts</div>
                      </div>
                    </div>
                    <div className="mt-4 w-full space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-rose-500" /> Emergency
                        </span>
                        <span>38%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-500" /> Women Safety
                        </span>
                        <span>27%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-orange-500" /> Child
                        </span>
                        <span>20%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Elder
                        </span>
                        <span>15%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { l: "Resolved Today", v: "54", c: "text-emerald-400" },
                  { l: "Avg Dispatch", v: "2.4 min", c: "text-blue-400" },
                  { l: "Provider SLA", v: "98.1%", c: "text-orange-400" },
                  { l: "System Uptime", v: "99.98%", c: "text-violet-400" },
                ].map((x) => (
                  <div key={x.l} className="rounded-2xl border border-white/5 bg-[#131826] p-5">
                    <p className="text-xs text-slate-400">{x.l}</p>
                    <p className={`mt-2 text-3xl font-black ${x.c}`}>{x.v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== PROVIDERS ========== */}
          {activeTab === "Providers" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-8 rounded-3xl border border-white/5 bg-[#131826] p-6">
                <h3 className="mb-6 flex items-center gap-2 text-xl font-black">
                  <Truck className="h-5 w-5 text-blue-400" /> Provider Network
                </h3>
                <p className="mb-4 text-sm text-slate-400">Hospital readiness and onboarding</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {providers.map((p) => (
                    <div key={p.name} className="rounded-2xl border border-white/5 bg-[#1A2235] p-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h4 className="font-black text-sm">{p.name}</h4>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${
                            p.status === "Available"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-orange-500/20 text-orange-300"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-1">{p.phone}</p>
                      <p className="text-xs text-orange-300 mb-4">Rating {p.rating} / 5.0</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => alert(`Approved: ${p.name}`)}
                          className="flex-1 rounded-lg border border-emerald-500/30 bg-emerald-900/40 py-1.5 text-xs font-black text-emerald-300"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => alert(`Rejected: ${p.name}`)}
                          className="flex-1 rounded-lg border border-rose-500/30 bg-rose-900/40 py-1.5 text-xs font-black text-rose-300"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="xl:col-span-4 rounded-3xl border border-white/5 bg-[#131826] p-6">
                <h3 className="mb-6 flex items-center gap-2 text-xl font-black">
                  <Phone className="h-5 w-5 text-emerald-400" /> Emergency Lines
                </h3>
                <div className="space-y-4">
                  {[
                    { l: "Ambulance", v: "108", c: "bg-emerald-500/20 text-emerald-300" },
                    { l: "Police", v: "100", c: "bg-blue-500/20 text-blue-300" },
                    { l: "Fire", v: "101", c: "bg-rose-500/20 text-rose-300" },
                  ].map((x) => (
                    <div
                      key={x.l}
                      className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4"
                    >
                      <span className="font-bold text-slate-300">{x.l}</span>
                      <span className={`rounded-full px-4 py-2 font-black ${x.c}`}>{x.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========== SETTINGS ========== */}
          {activeTab === "Settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="rounded-3xl border border-white/5 bg-[#131826] p-6">
                <h3 className="mb-6 flex items-center gap-2 text-lg font-black">
                  <Settings className="h-5 w-5 text-blue-400" /> System Settings
                </h3>
                <p className="mb-4 text-xs text-slate-400">Operations control</p>
                <div className="space-y-3">
                  {[
                    { label: "Auto dispatch nearest ambulance", val: autoDispatch, set: setAutoDispatch },
                    { label: "Enable traffic signal preemption", val: signalPreempt, set: setSignalPreempt },
                    { label: "Require admin approval for providers", val: adminApproval, set: setAdminApproval },
                  ].map((row) => (
                    <label
                      key={row.label}
                      className="flex cursor-pointer items-center justify-between rounded-xl bg-white/5 p-3"
                    >
                      <span className="text-sm pr-3">{row.label}</span>
                      <input
                        type="checkbox"
                        checked={row.val}
                        onChange={(e) => row.set(e.target.checked)}
                        className="h-4 w-4 accent-blue-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/5 bg-[#131826] p-6">
                <h3 className="mb-6 flex items-center gap-2 text-lg font-black">
                  <Bell className="h-5 w-5 text-violet-400" /> Notifications
                </h3>
                <p className="mb-4 text-xs text-slate-400">Alert preferences</p>
                <div className="space-y-3">
                  {[
                    { label: "High priority SMS", val: smsNotif, set: setSmsNotif },
                    { label: "Provider status emails", val: emailNotif, set: setEmailNotif },
                    { label: "Daily analytics digest", val: digestNotif, set: setDigestNotif },
                  ].map((row) => (
                    <label
                      key={row.label}
                      className="flex cursor-pointer items-center justify-between rounded-xl bg-white/5 p-3"
                    >
                      <span className="text-sm pr-3">{row.label}</span>
                      <input
                        type="checkbox"
                        checked={row.val}
                        onChange={(e) => row.set(e.target.checked)}
                        className="h-4 w-4 accent-violet-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/5 bg-[#131826] p-6">
                <h3 className="mb-6 flex items-center gap-2 text-lg font-black">
                  <Phone className="h-5 w-5 text-emerald-400" /> Emergency Config
                </h3>
                <p className="mb-4 text-xs text-slate-400">Public helplines</p>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">AMBULANCE</label>
                    <input
                      value={ambNum}
                      onChange={(e) => setAmbNum(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">POLICE</label>
                    <input
                      value={policeNum}
                      onChange={(e) => setPoliceNum(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">FIRE</label>
                    <input
                      value={fireNum}
                      onChange={(e) => setFireNum(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSaved(true);
                      setTimeout(() => setSaved(false), 2000);
                    }}
                    className="mt-2 w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 py-3 font-black"
                  >
                    {saved ? "✓ Saved!" : "Save Settings"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default function AdminPage() {
  return (
    <AppProvider>
      <AdminPageContent />
    </AppProvider>
  );
}