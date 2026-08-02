// Pravaah 360 - System Admin Dashboard

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowUpDown, Ban,
  BarChart3, Bell, CheckCircle2, ChevronLeft,
  ChevronRight, Clock, Eye, Filter, Gauge,
  HeartPulse, Home, LogOut, MapPin, Moon, Phone,
  Plus, Radio, Save, Search, Settings,
  Shield, Siren, Star, Trash2, Truck,
  UserPlus, Users, Zap,
} from "lucide-react";
import LiveMap from "@/components/LiveMap";
import { AppProvider, useApp } from "@/store/AppContext";
import { useAuth } from "@/store/AuthContext";

type UserRole = "Admin" | "Patient" | "Driver" | "Provider";
type UserStatus = "Active" | "Inactive" | "Banned";
type AlertType = "Emergency" | "Women Safety" | "Child" | "Elder";
type AlertPriority = "High" | "Medium" | "Low";
type AlertStatus = "Active" | "Responding" | "Resolved";
type RoleFilter = "All" | UserRole;
type AlertFilter = "All" | AlertType;

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinedDate: string;
  avatar: string;
}

interface SosAlert {
  id: string;
  type: AlertType;
  userName: string;
  phone: string;
  location: string;
  timeAgo: string;
  priority: AlertPriority;
  status: AlertStatus;
  lat: number;
  lng: number;
}

interface HospitalData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: "Available" | "Busy";
  phone: string;
}

interface AlertDay {
  day: string;
  alerts: number;
}

interface ResponseTrend {
  label: string;
  minutes: number;
}

interface AlertBreakdown {
  type: AlertType;
  value: number;
  colorClass: string;
  dotClass: string;
}

const vijayawadaCenter = { lat: 16.5062, lng: 80.648 };

const users: AdminUser[] = [
  { id: "USR-1001", name: "Ravi Kumar", email: "ravi.kumar@pravaah360.in", role: "Patient", status: "Active", joinedDate: "12 Jan 2026", avatar: "RK" },
  { id: "USR-1002", name: "Priya Sharma", email: "priya.sharma@pravaah360.in", role: "Admin", status: "Active", joinedDate: "24 Jan 2026", avatar: "PS" },
  { id: "USR-1003", name: "Arjun Reddy", email: "arjun.reddy@pravaah360.in", role: "Driver", status: "Inactive", joinedDate: "04 Feb 2026", avatar: "AR" },
  { id: "USR-1004", name: "Sneha Iyer", email: "sneha.iyer@pravaah360.in", role: "Provider", status: "Active", joinedDate: "19 Feb 2026", avatar: "SI" },
  { id: "USR-1005", name: "Kiran Naidu", email: "kiran.naidu@pravaah360.in", role: "Driver", status: "Active", joinedDate: "02 Mar 2026", avatar: "KN" },
  { id: "USR-1006", name: "Meera Joshi", email: "meera.joshi@pravaah360.in", role: "Patient", status: "Banned", joinedDate: "21 Mar 2026", avatar: "MJ" },
  { id: "USR-1007", name: "Sandeep Varma", email: "sandeep.varma@pravaah360.in", role: "Provider", status: "Active", joinedDate: "08 Apr 2026", avatar: "SV" },
  { id: "USR-1008", name: "Ananya Rao", email: "ananya.rao@pravaah360.in", role: "Patient", status: "Inactive", joinedDate: "26 Apr 2026", avatar: "AR" },
  { id: "USR-1009", name: "Vikram Singh", email: "vikram.singh@pravaah360.in", role: "Admin", status: "Active", joinedDate: "10 May 2026", avatar: "VS" },
  { id: "USR-1010", name: "Lakshmi Devi", email: "lakshmi.devi@pravaah360.in", role: "Patient", status: "Active", joinedDate: "30 May 2026", avatar: "LD" },
];

const sosAlerts: SosAlert[] = [
  { id: "SOS-9101", type: "Emergency", userName: "Ravi Kumar", phone: "+91 98765 41001", location: "Benz Circle", timeAgo: "2 min ago", priority: "High", status: "Active", lat: 16.5062, lng: 80.648 },
  { id: "SOS-9102", type: "Women Safety", userName: "Priya Sharma", phone: "+91 98765 41002", location: "MG Road", timeAgo: "5 min ago", priority: "High", status: "Responding", lat: 16.5033, lng: 80.641 },
  { id: "SOS-9103", type: "Child", userName: "Ananya Rao", phone: "+91 98765 41003", location: "Governorpet", timeAgo: "8 min ago", priority: "Medium", status: "Active", lat: 16.518, lng: 80.635 },
  { id: "SOS-9104", type: "Elder", userName: "Lakshmi Devi", phone: "+91 98765 41004", location: "Patamata", timeAgo: "11 min ago", priority: "Medium", status: "Responding", lat: 16.522, lng: 80.628 },
  { id: "SOS-9105", type: "Emergency", userName: "Kiran Naidu", phone: "+91 98765 41005", location: "Kanaka Durga Flyover", timeAgo: "14 min ago", priority: "High", status: "Active", lat: 16.5121, lng: 80.6339 },
  { id: "SOS-9106", type: "Women Safety", userName: "Meera Joshi", phone: "+91 98765 41006", location: "One Town", timeAgo: "18 min ago", priority: "Low", status: "Resolved", lat: 16.508, lng: 80.63 },
  { id: "SOS-9107", type: "Child", userName: "Sandeep Varma", phone: "+91 98765 41007", location: "Ramavarappadu", timeAgo: "21 min ago", priority: "Medium", status: "Active", lat: 16.5089, lng: 80.652 },
  { id: "SOS-9108", type: "Elder", userName: "Sneha Iyer", phone: "+91 98765 41008", location: "Autonagar", timeAgo: "27 min ago", priority: "Low", status: "Responding", lat: 16.4989, lng: 80.6431 },
];

const hospitals: HospitalData[] = [
  { id: "HSP-01", name: "Aster Ramesh Hospital", lat: 16.5109, lng: 80.6395, status: "Available", phone: "+91 866 246 3463" },
  { id: "HSP-02", name: "Manipal Hospital Vijayawada", lat: 16.5449, lng: 80.644, status: "Available", phone: "+91 866 681 1111" },
  { id: "HSP-03", name: "Andhra Hospitals", lat: 16.5033, lng: 80.651, status: "Available", phone: "+91 866 257 4757" },
  { id: "HSP-04", name: "Government General Hospital", lat: 16.5089, lng: 80.6187, status: "Busy", phone: "+91 866 257 0000" },
  { id: "HSP-05", name: "Nagarjuna Hospital", lat: 16.4856, lng: 80.6917, status: "Available", phone: "+91 866 246 9700" },
  { id: "HSP-06", name: "Rainbow Children's Hospital", lat: 16.5017, lng: 80.6557, status: "Available", phone: "+91 866 668 8000" },
  { id: "HSP-07", name: "KIMS Hospital Vijayawada", lat: 16.5151, lng: 80.6429, status: "Busy", phone: "+91 866 247 7777" },
  { id: "HSP-08", name: "LV Prasad Eye Institute", lat: 16.4898, lng: 80.6652, status: "Available", phone: "+91 866 671 2000" },
  { id: "HSP-09", name: "Capital Hospitals", lat: 16.5085, lng: 80.7004, status: "Available", phone: "+91 866 243 9999" },
  { id: "HSP-10", name: "Kamineni Hospital Vijayawada", lat: 16.493, lng: 80.671, status: "Available", phone: "+91 866 257 7777" },
];

const alertsPerDay: AlertDay[] = [
  { day: "Mon", alerts: 22 },
  { day: "Tue", alerts: 31 },
  { day: "Wed", alerts: 28 },
  { day: "Thu", alerts: 42 },
  { day: "Fri", alerts: 36 },
  { day: "Sat", alerts: 47 },
  { day: "Sun", alerts: 33 },
];

const responseTrend: ResponseTrend[] = [
  { label: "W1", minutes: 9.8 },
  { label: "W2", minutes: 9.1 },
  { label: "W3", minutes: 8.6 },
  { label: "W4", minutes: 7.9 },
  { label: "Now", minutes: 7.2 },
];

const alertBreakdown: AlertBreakdown[] = [
  { type: "Emergency", value: 38, colorClass: "bg-red-500", dotClass: "bg-red-400" },
  { type: "Women Safety", value: 27, colorClass: "bg-blue-500", dotClass: "bg-blue-400" },
  { type: "Child", value: 20, colorClass: "bg-orange-500", dotClass: "bg-orange-400" },
  { type: "Elder", value: 15, colorClass: "bg-green-500", dotClass: "bg-green-400" },
];

const roleStyles: Record<UserRole, string> = {
  Admin: "border-purple-400/30 bg-purple-500/15 text-purple-200",
  Patient: "border-blue-400/30 bg-blue-500/15 text-blue-200",
  Driver: "border-green-400/30 bg-green-500/15 text-green-200",
  Provider: "border-orange-400/30 bg-orange-500/15 text-orange-200",
};

const statusStyles: Record<UserStatus, string> = {
  Active: "bg-green-400",
  Inactive: "bg-slate-400",
  Banned: "bg-red-400",
};

const priorityStyles: Record<AlertPriority, string> = {
  High: "border-red-400/40 bg-red-500/15 text-red-200",
  Medium: "border-orange-400/40 bg-orange-500/15 text-orange-200",
  Low: "border-green-400/40 bg-green-500/15 text-green-200",
};

const alertTypeStyles: Record<AlertType, { icon: typeof Siren; className: string }> = {
  Emergency: { icon: Siren, className: "bg-red-500/15 text-red-200 ring-red-400/20" },
  "Women Safety": { icon: Shield, className: "bg-blue-500/15 text-blue-200 ring-blue-400/20" },
  Child: { icon: UserPlus, className: "bg-orange-500/15 text-orange-200 ring-orange-400/20" },
  Elder: { icon: HeartPulse, className: "bg-green-500/15 text-green-200 ring-green-400/20" },
};

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "users", label: "Users", icon: Users },
  { id: "alerts", label: "Alerts", icon: AlertTriangle },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "providers", label: "Providers", icon: Truck },
  { id: "settings", label: "Settings", icon: Settings },
];

const trafficSignals = [
  { id: "TS-001", lat: 16.5062, lng: 80.648, name: "Benz Circle", status: "Busy" },
  { id: "TS-002", lat: 16.5121, lng: 80.6339, name: "Kanaka Durga Flyover", status: "Normal" },
  { id: "TS-003", lat: 16.5033, lng: 80.641, name: "MG Road Junction", status: "Normal" },
  { id: "TS-004", lat: 16.5089, lng: 80.652, name: "Ramavarappadu Ring", status: "Congested" },
  { id: "TS-005", lat: 16.4989, lng: 80.6431, name: "Autonagar Signal", status: "Congested" },
  { id: "TS-006", lat: 16.518, lng: 80.635, name: "Governorpet", status: "Normal" },
  { id: "TS-007", lat: 16.508, lng: 80.63, name: "One Town", status: "Busy" },
  { id: "TS-008", lat: 16.522, lng: 80.628, name: "Patamata", status: "Normal" },
];

const ambulances = [
  { id: "AMB-001", lat: 16.515, lng: 80.652, status: "Available" },
  { id: "AMB-002", lat: 16.502, lng: 80.641, status: "On Duty" },
  { id: "AMB-003", lat: 16.518, lng: 80.635, status: "Available" },
  { id: "AMB-004", lat: 16.495, lng: 80.66, status: "Available" },
  { id: "AMB-005", lat: 16.525, lng: 80.645, status: "On Duty" },
  { id: "AMB-006", lat: 16.489, lng: 80.652, status: "Available" },
];

const deliveryVehicles = [
  { id: "MED-001", lat: 16.509, lng: 80.645, status: "In Transit" },
  { id: "MED-002", lat: 16.52, lng: 80.638, status: "Delivered" },
  { id: "MED-003", lat: 16.513, lng: 80.651, status: "In Transit" },
];

const sosVehicles = [
  { id: "POL-001", lat: 16.51, lng: 80.642, type: "police" },
  { id: "POL-002", lat: 16.515, lng: 80.655, type: "police" },
  { id: "POL-003", lat: 16.505, lng: 80.638, type: "police" },
  { id: "FIR-001", lat: 16.52, lng: 80.63, type: "fire" },
];

const recentActivity = [
  "AMB-002 dispatched from Benz Circle to Andhra Hospitals",
  "Women Safety alert moved to responding at MG Road",
  "Provider KIMS Hospital updated bed availability",
  "Traffic preemption requested near Kanaka Durga Flyover",
  "Police unit POL-003 acknowledged One Town incident",
];

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function AdminPageContent() {
  const { login, user } = useAuth();
  const { isSimulationRunning } = useApp();
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
  const [alertFilter, setAlertFilter] = useState<AlertFilter>("All");
  const [sortByPriority, setSortByPriority] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
   const handleBackToLogin = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error("Error clearing storage:", e);
    }
    window.location.href = "/login";
  };
  useEffect(() => {
    void login("admin@pravaah360.in", "admin123", "admin");

    const timer = window.setTimeout(() => setIsLoading(false), 700);
    return () => window.clearTimeout(timer);
  }, [login]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return users.filter((adminUser) => {
      const matchesSearch =
        !query ||
        adminUser.name.toLowerCase().includes(query) ||
        adminUser.email.toLowerCase().includes(query) ||
        adminUser.id.toLowerCase().includes(query);
      const matchesRole = roleFilter === "All" || adminUser.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [roleFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / 5));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * 5, currentPage * 5);

  const filteredAlerts = useMemo(() => {
    const priorityRank: Record<AlertPriority, number> = { High: 1, Medium: 2, Low: 3 };
    const visibleAlerts = sosAlerts.filter((alert) => alertFilter === "All" || alert.type === alertFilter);
    return sortByPriority
      ? [...visibleAlerts].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
      : visibleAlerts;
  }, [alertFilter, sortByPriority]);

  const maxAlerts = Math.max(...alertsPerDay.map((item) => item.alerts));
  const maxResponse = Math.max(...responseTrend.map((item) => item.minutes));
  const minResponse = Math.min(...responseTrend.map((item) => item.minutes));
  const activeNavItem = navItems.find((item) => item.id === activeTab) ?? navItems[0];

  const statsSection = (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={Users} label="Total Users" value="12,846" meta="+18.4% this month" color="blue" />
      <StatCard icon={Siren} label="Active Emergencies" value="8" meta="3 high priority" color="red" />
      <StatCard icon={Clock} label="Response Time Avg" value="7.2 min" meta="-14% faster today" color="green" />
      <StatCard icon={CheckCircle2} label="Success Rate" value="96.8%" meta="SLA badge active" color="orange" />
    </section>
  );

  const mapPanel = (
    <GlassPanel className="min-h-[520px]">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <MapPin className="h-5 w-5 text-blue-300" />
            Vijayawada Live Command Map
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Ambulances, SOS units, hospitals, and signal health around Benz Circle.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-green-400/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-200">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          {isSimulationRunning ? "Simulation running" : "Live feed ready"}
        </span>
      </div>
      <div className="h-[450px] overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-slate-950/40">
        <LiveMap
          ambulances={ambulances}
          deliveryVehicles={deliveryVehicles}
          trafficSignals={trafficSignals}
          sosVehicles={sosVehicles}
          hospitals={hospitals}
          emergencies={sosAlerts.map((alert) => ({
            id: alert.id,
            pickupLat: alert.lat,
            pickupLng: alert.lng,
            patientName: alert.userName,
            status: alert.status.toLowerCase(),
            type: alert.type,
          }))}
          center={[vijayawadaCenter.lat, vijayawadaCenter.lng]}
          zoom={12}
        />
      </div>
    </GlassPanel>
  );

  const alertsPanel = (
    <GlassPanel>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <AlertTriangle className="h-5 w-5 text-red-300" />
            Live SOS Alerts
          </h2>
          <p className="mt-1 text-sm text-slate-400">8 active Vijayawada incidents in dispatch queue.</p>
        </div>
        <div className="flex gap-2">
          <SelectPill
            icon={Filter}
            value={alertFilter}
            onChange={(value) => setAlertFilter(value as AlertFilter)}
            options={["All", "Emergency", "Women Safety", "Child", "Elder"]}
          />
          <button
            onClick={() => setSortByPriority((value) => !value)}
            className={classNames(
              "group flex h-10 items-center gap-2 rounded-xl border px-3 text-sm transition",
              sortByPriority
                ? "border-blue-400/40 bg-blue-500/15 text-blue-100"
                : "border-white/10 bg-white/10 text-slate-300 hover:bg-white/15"
            )}
          >
            <ArrowUpDown className="h-4 w-4 transition group-hover:scale-110" />
            Priority
          </button>
        </div>
      </div>

      <div className="max-h-[560px] space-y-3 overflow-y-auto pr-1">
        {isLoading ? (
          <LoadingRows label="Syncing SOS feed" />
        ) : filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
        ) : (
          <EmptyState icon={Radio} title="No alerts match this filter" />
        )}
      </div>
    </GlassPanel>
  );

  const chartsSection = (
    <div className="grid gap-6 lg:grid-cols-3">
      <GlassPanel>
        <ChartHeader icon={BarChart3} title="Alerts per Day" subtitle="Last 7 days" />
        <div className="mt-6 flex h-56 items-end gap-3">
          {alertsPerDay.map((item) => (
            <div key={item.day} className="flex h-full flex-1 flex-col justify-end gap-2">
              <div className="flex flex-1 items-end">
                <div
                  className="group relative w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-purple-400 shadow-lg shadow-blue-950/40 transition duration-300 hover:scale-[1.03]"
                  style={{ height: `${(item.alerts / maxAlerts) * 100}%` }}
                >
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-200 opacity-0 transition group-hover:opacity-100">
                    {item.alerts}
                  </span>
                </div>
              </div>
              <span className="text-center text-xs text-slate-400">{item.day}</span>
            </div>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel>
        <ChartHeader icon={Gauge} title="Response Trend" subtitle="Last 30 days" />
        <div className="relative mt-6 h-56 rounded-2xl border border-white/10 bg-slate-950/50 p-5">
          <div className="absolute inset-x-5 top-8 border-t border-dashed border-white/10" />
          <div className="absolute inset-x-5 top-24 border-t border-dashed border-white/10" />
          <div className="absolute inset-x-5 top-40 border-t border-dashed border-white/10" />
          <div className="relative flex h-full items-end justify-between">
            {responseTrend.map((point, index) => {
              const height = 24 + ((maxResponse - point.minutes) / (maxResponse - minResponse)) * 130;
              return (
                <div key={point.label} className="group flex h-full flex-1 flex-col items-center justify-end">
                  {index > 0 && (
                    <div
                      className="absolute h-1 rounded-full bg-gradient-to-r from-green-400 to-blue-400"
                      style={{
                        bottom: `${height + 27}px`,
                        left: `${((index - 1) / (responseTrend.length - 1)) * 100 + 8}%`,
                        width: "17%",
                        transform: `rotate(${-8 + index * 2}deg)`,
                      }}
                    />
                  )}
                  <div
                    className="z-10 flex h-9 w-9 items-center justify-center rounded-full border border-green-300/40 bg-green-400/20 text-xs font-bold text-green-100 shadow-lg shadow-green-950/40 transition group-hover:scale-110"
                    style={{ marginBottom: `${height}px` }}
                  >
                    {point.minutes.toFixed(1)}
                  </div>
                  <span className="absolute bottom-3 text-xs text-slate-400">{point.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </GlassPanel>

      <GlassPanel>
        <ChartHeader icon={Activity} title="Alert Types" subtitle="Breakdown" />
        <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row lg:flex-col">
          <div
            className="h-44 w-44 rounded-full border border-white/10 shadow-2xl shadow-slate-950/40"
            style={{
              background: "conic-gradient(#ef4444 0deg 136deg,#3b82f6 136deg 233deg,#f97316 233deg 305deg,#22c55e 305deg 360deg)",
            }}
          >
            <div className="m-8 flex h-28 w-28 flex-col items-center justify-center rounded-full bg-slate-950 text-center">
              <span className="text-2xl font-bold text-white">239</span>
              <span className="text-xs text-slate-400">alerts</span>
            </div>
          </div>
          <div className="w-full space-y-3">
            {alertBreakdown.map((item) => (
              <div key={item.type} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className={classNames("h-2.5 w-2.5 rounded-full", item.dotClass)} />
                  {item.type}
                </span>
                <span className="font-semibold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </GlassPanel>
    </div>
  );

  const usersPanel = (
    <GlassPanel>
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <Users className="h-5 w-5 text-blue-300" />
            User Management
          </h2>
          <p className="mt-1 text-sm text-slate-400">Manage admins, patients, drivers, and emergency providers.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SelectPill
            icon={Filter}
            value={roleFilter}
            onChange={(value) => {
              setRoleFilter(value as RoleFilter);
              setCurrentPage(1);
            }}
            options={["All", "Patient", "Driver", "Admin", "Provider"]}
          />
          <button className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-blue-500/30">
            <Plus className="h-4 w-4 transition group-hover:rotate-90" />
            Add New User
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="hidden grid-cols-[80px_1.1fr_1.35fr_0.75fr_0.8fr_0.9fr_1fr] bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:grid">
          <span>Avatar</span>
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span>Joined</span>
          <span>Actions</span>
        </div>

        {isLoading ? (
          <div className="p-4">
            <LoadingRows label="Loading user records" />
          </div>
        ) : paginatedUsers.length > 0 ? (
          paginatedUsers.map((adminUser) => <UserRow key={adminUser.id} user={adminUser} />)
        ) : (
          <div className="p-8">
            <EmptyState icon={Users} title="No users found" />
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-400">
          Showing <span className="font-semibold text-slate-200">{paginatedUsers.length}</span> of{" "}
          <span className="font-semibold text-slate-200">{filteredUsers.length}</span> users
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-slate-300 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
          </button>
          <span className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-200">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-slate-300 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </GlassPanel>
  );

  const providersPanel = (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <GlassPanel>
        <ChartHeader icon={Truck} title="Provider Network" subtitle="Hospital readiness and onboarding" />
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {hospitals.map((hospital, index) => (
            <div
              key={hospital.id}
              className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-blue-300/30 hover:bg-white/[0.07]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{hospital.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{hospital.phone}</p>
                  <p className="mt-2 text-sm text-orange-200">Rating {(4.6 + (index % 4) / 10).toFixed(1)} / 5.0</p>
                </div>
                <span
                  className={classNames(
                    "rounded-full px-2.5 py-1 text-xs font-semibold",
                    hospital.status === "Available" ? "bg-green-500/15 text-green-200" : "bg-orange-500/15 text-orange-200"
                  )}
                >
                  {hospital.status}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="rounded-xl border border-green-400/30 bg-green-500/15 px-3 py-2 text-sm font-semibold text-green-100 transition hover:bg-green-500/25">
                  Approve
                </button>
                <button className="rounded-xl border border-red-400/30 bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/25">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel>
        <ChartHeader icon={Phone} title="Emergency Lines" subtitle="Operational contacts" />
        <div className="mt-5 space-y-3">
          {[
            ["Ambulance", "108", "bg-green-500/15 text-green-200"],
            ["Police", "100", "bg-blue-500/15 text-blue-200"],
            ["Fire", "101", "bg-red-500/15 text-red-200"],
          ].map(([label, number, className]) => (
            <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <span className="text-sm text-slate-300">{label}</span>
              <span className={classNames("rounded-full px-4 py-2 text-lg font-bold", className)}>{number}</span>
            </div>
          ))}
        </div>
      </GlassPanel>
    </section>
  );

  const settingsPanel = (
    <section className="grid gap-6 xl:grid-cols-3">
      <GlassPanel>
        <ChartHeader icon={Settings} title="System Settings" subtitle="Operations control" />
        <div className="mt-5 space-y-4">
          {["Auto dispatch nearest ambulance", "Enable traffic signal preemption", "Require admin approval for providers"].map((setting) => (
            <label key={setting} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <span className="text-sm text-slate-300">{setting}</span>
              <input type="checkbox" defaultChecked className="h-5 w-5 accent-blue-500" />
            </label>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel>
        <ChartHeader icon={Bell} title="Notifications" subtitle="Alert preferences" />
        <div className="mt-5 space-y-4">
          {["High priority SMS", "Provider status emails", "Daily analytics digest"].map((setting, index) => (
            <label key={setting} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <span className="text-sm text-slate-300">{setting}</span>
              <input type="checkbox" defaultChecked={index !== 2} className="h-5 w-5 accent-purple-500" />
            </label>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel>
        <ChartHeader icon={Phone} title="Emergency Config" subtitle="Public helplines" />
        <div className="mt-5 space-y-3">
          {[
            ["Ambulance", "108"],
            ["Police", "100"],
            ["Fire", "101"],
          ].map(([label, number]) => (
            <label key={label} className="block rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</span>
              <input
                defaultValue={number}
                className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm font-semibold text-white outline-none focus:border-blue-400/60"
              />
            </label>
          ))}
          <button className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5">
            <CheckCircle2 className="h-4 w-4 transition group-hover:scale-110" />
            Save Settings
          </button>
        </div>
      </GlassPanel>
    </section>
  );

  const renderActiveTab = () => {
    if (activeTab === "users") {
      return usersPanel;
    }

    if (activeTab === "alerts") {
      return <section className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(420px,1.15fr)]">{mapPanel}{alertsPanel}</section>;
    }

    if (activeTab === "analytics") {
      return (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Analytics Command Center</h2>
              <p className="mt-1 text-sm text-slate-400">Operational trends, response performance, and alert mix.</p>
            </div>
            <button className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/15 px-4 text-sm font-semibold text-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-500/25">
              <BarChart3 className="h-4 w-4 transition group-hover:scale-110" />
              Export Reports
            </button>
          </div>
          {statsSection}
          {chartsSection}
          <section className="grid gap-4 md:grid-cols-4">
            {[
              ["Resolved Today", "54", "text-green-200"],
              ["Avg Dispatch", "2.4 min", "text-blue-200"],
              ["Provider SLA", "98.1%", "text-orange-200"],
              ["System Uptime", "99.98%", "text-purple-200"],
            ].map(([label, value, color]) => (
              <GlassPanel key={label}>
                <p className="text-sm text-slate-400">{label}</p>
                <p className={classNames("mt-2 text-3xl font-bold", color)}>{value}</p>
              </GlassPanel>
            ))}
          </section>
        </>
      );
    }

    if (activeTab === "providers") {
      return providersPanel;
    }

    if (activeTab === "settings") {
      return settingsPanel;
    }

    return (
      <>
        {statsSection}
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
          {mapPanel}
          <GlassPanel>
            <ChartHeader icon={Activity} title="Recent Activity" subtitle="Live operations feed" />
            <div className="mt-5 space-y-3">
              {recentActivity.map((item, index) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-green-400 shadow-lg shadow-green-400/30" />
                  <div>
                    <p className="text-sm text-slate-200">{item}</p>
                    <p className="mt-1 text-xs text-slate-500">{index + 2} min ago</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </section>
      </>
    );
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.2),transparent_30%),linear-gradient(180deg,#020617,#0f172a_45%,#111827)]" />

      <div className="flex min-h-screen">
        {/* Sidebar navigation */}
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/20">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-wide text-white">Pravaah 360</p>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Safety Command</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveTab(item.id)}
                  className={classNames(
                    "group flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition duration-300 hover:-translate-y-0.5",
                    isActive
                      ? "border-blue-300/40 bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-slate-400 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon
                    className={classNames(
                      "h-5 w-5 transition duration-300 group-hover:scale-110",
                      isActive ? "text-white" : "group-hover:text-blue-300"
                    )}
                  />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4 shadow-xl shadow-blue-950/20">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-100">
              <Radio className="h-4 w-4 animate-pulse text-green-300" />
              Vijayawada Grid
            </div>
            <p className="text-sm leading-6 text-slate-300">
              Emergency numbers live: <span className="font-semibold text-white">108</span>,{" "}
              <span className="font-semibold text-white">100</span>,{" "}
              <span className="font-semibold text-white">101</span>
            </p>
            <p className="mt-3 text-xs text-slate-400">
              {vijayawadaCenter.lat.toFixed(4)}, {vijayawadaCenter.lng.toFixed(4)}
            </p>
          </div>
        </aside>

        <section className="flex-1 overflow-hidden">
          {/* Top header */}
          <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                  <span>Admin Console</span>
                  <span className="h-1 w-1 rounded-full bg-slate-500" />
                  <span>Vijayawada, Andhra Pradesh</span>
                  <span className="h-1 w-1 rounded-full bg-slate-500" />
                  <span className="text-blue-200">{activeNavItem.label}</span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-500/10 px-2.5 py-1 text-xs text-green-200">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                    Auto-refresh live
                  </span>
                </div>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Public Safety Operations Dashboard
                </h1>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="relative flex min-w-0 items-center">
                  <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search users, email, ID..."
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/10 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400/60 focus:bg-white/15 sm:w-72"
                  />
                </label>
                <button className="group relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 transition hover:border-blue-400/40 hover:bg-white/15">
                  <Bell className="h-5 w-5 text-slate-200 transition group-hover:rotate-12 group-hover:text-blue-200" />
                  <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-slate-950" />
                </button>
                <button className="group flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 transition hover:border-purple-400/40 hover:bg-white/15">
                  <Moon className="h-5 w-5 text-slate-200 transition group-hover:scale-110 group-hover:text-purple-200" />
                </button>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-3 py-2">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950 text-xs font-bold">
                      {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-white">System Admin</p>
                    <p className="text-xs text-slate-400">admin@pravaah360.in</p>
                  </div>
                </div>
                <button
  onClick={handleBackToLogin}
  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold shadow-lg hover:from-red-600 hover:to-orange-600 hover:scale-105 transition-all"
  title="Back to Login"
>
  <LogOut className="w-4 h-4" />
  <span className="hidden sm:inline">Logout</span>
</button>
              </div>
            </div>
          </header>

          <div key={activeTab} className="space-y-6 p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 sm:p-6 lg:p-8">
            {renderActiveTab()}
          </div>
        </section>
      </div>
    </main>
  );
}

function GlassPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={classNames(
        "rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl transition duration-300 hover:border-white/20",
        className
      )}
    >
      {children}
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  meta,
  color,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  meta: string;
  color: "blue" | "red" | "green" | "orange";
}) {
  const styles = {
    blue: "from-blue-500/25 to-blue-500/5 text-blue-200 shadow-blue-950/30",
    red: "from-red-500/25 to-red-500/5 text-red-200 shadow-red-950/30",
    green: "from-green-500/25 to-green-500/5 text-green-200 shadow-green-950/30",
    orange: "from-orange-500/25 to-orange-500/5 text-orange-200 shadow-orange-950/30",
  };

  return (
    <div className="group rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</p>
          <p className="mt-3 inline-flex rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs text-slate-200">{meta}</p>
        </div>
        <div className={classNames("rounded-2xl bg-gradient-to-br p-3 shadow-lg", styles[color])}>
          <Icon className="h-6 w-6 transition duration-300 group-hover:scale-110 group-hover:rotate-6" />
        </div>
      </div>
    </div>
  );
}

function SelectPill({
  icon: Icon,
  value,
  onChange,
  options,
}: {
  icon: typeof Filter;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="relative flex h-11 items-center">
      <Icon className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 appearance-none rounded-xl border border-white/10 bg-slate-900/90 pl-10 pr-9 text-sm text-slate-200 outline-none transition hover:bg-slate-800 focus:border-blue-400/60"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronRight className="pointer-events-none absolute right-3 h-4 w-4 rotate-90 text-slate-500" />
    </label>
  );
}

function AlertCard({ alert }: { alert: SosAlert }) {
  const typeConfig = alertTypeStyles[alert.type];
  const TypeIcon = typeConfig.icon;

  return (
    <article className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-red-300/30 hover:bg-white/[0.07]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={classNames("rounded-xl p-2 ring-1", typeConfig.className)}>
            <TypeIcon className="h-5 w-5 transition group-hover:scale-110" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-white">{alert.type}</h3>
              <span className={classNames("rounded-full border px-2 py-0.5 text-xs font-semibold", priorityStyles[alert.priority])}>
                {alert.priority}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-300">{alert.userName}</p>
            <p className="text-xs text-slate-500">{alert.phone}</p>
          </div>
        </div>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-300">{alert.timeAgo}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-400">
        <MapPin className="h-4 w-4 text-blue-300" />
        {alert.location}
        <span className="h-1 w-1 rounded-full bg-slate-600" />
        <span className="text-slate-300">{alert.status}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="rounded-xl border border-blue-400/30 bg-blue-500/15 px-3 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/25">
          Respond
        </button>
        <button className="rounded-xl border border-green-400/30 bg-green-500/15 px-3 py-2 text-sm font-semibold text-green-100 transition hover:bg-green-500/25">
          Dispatch
        </button>
      </div>
    </article>
  );
}

function UserRow({ user }: { user: AdminUser }) {
  return (
    <div className="grid gap-3 border-t border-white/10 px-4 py-4 transition hover:bg-white/[0.04] lg:grid-cols-[80px_1.1fr_1.35fr_0.75fr_0.8fr_0.9fr_1fr] lg:items-center">
      <div className="flex items-center justify-between gap-3 lg:block">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-bold text-white ring-2 ring-white/10">
          {user.avatar}
        </div>
        <span className="text-xs font-semibold text-slate-500 lg:hidden">{user.id}</span>
      </div>
      <div>
        <p className="font-semibold text-white">{user.name}</p>
        <p className="text-xs text-slate-500 lg:hidden">{user.joinedDate}</p>
      </div>
      <p className="break-all text-sm text-slate-300">{user.email}</p>
      <div>
        <span className={classNames("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", roleStyles[user.role])}>
          {user.role}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-300">
        <span className={classNames("h-2.5 w-2.5 rounded-full", statusStyles[user.status])} />
        {user.status}
      </div>
      <p className="hidden text-sm text-slate-400 lg:block">{user.joinedDate}</p>
      <div className="flex items-center gap-2">
        <ActionButton icon={Eye} label="View" color="blue" />
        <ActionButton icon={Ban} label="Ban" color="orange" />
        <ActionButton icon={Trash2} label="Delete" color="red" />
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  color,
}: {
  icon: typeof Eye;
  label: string;
  color: "blue" | "orange" | "red";
}) {
  const styles = {
    blue: "hover:border-blue-400/40 hover:bg-blue-500/15 hover:text-blue-100",
    orange: "hover:border-orange-400/40 hover:bg-orange-500/15 hover:text-orange-100",
    red: "hover:border-red-400/40 hover:bg-red-500/15 hover:text-red-100",
  };

  return (
    <button
      title={label}
      className={classNames(
        "group flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-slate-300 transition",
        styles[color]
      )}
    >
      <Icon className="h-4 w-4 transition group-hover:scale-110" />
    </button>
  );
}

function ChartHeader({ icon: Icon, title, subtitle }: { icon: typeof BarChart3; title: string; subtitle: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <Icon className="h-5 w-5 text-blue-300" />
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>
      <Activity className="h-5 w-5 animate-pulse text-green-300" />
    </div>
  );
}

function LoadingRows({ label }: { label: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
        {label}
      </div>
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-20 animate-pulse rounded-2xl bg-white/[0.06]" />
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, title }: { icon: typeof Users; title: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
      <Icon className="h-10 w-10 text-slate-500" />
      <p className="mt-3 font-semibold text-slate-200">{title}</p>
      <p className="mt-1 text-sm text-slate-500">Try adjusting the search or filter controls.</p>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AppProvider>
      <AdminPageContent />
    </AppProvider>
  );
}
