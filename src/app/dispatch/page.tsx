"use client";

import { useEffect, useState } from "react";
import { AppProvider } from "@/store/AppContext";
import { useAuth } from "@/store/AuthContext";
import LiveMap from "@/components/LiveMap";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Phone,
  Radio,
  ShieldAlert,
  Truck,
  Users,
} from "lucide-react";
import { LatLng, VIJAYAWADA, VIJAYAWADA_HOSPITALS, VIJAYAWADA_SIGNALS, animatePosition, useLiveLocation } from "@/lib/realtime";

interface DispatchRequest {
  id: string;
  customer: string;
  phone: string;
  location: string;
  serviceType: "Ambulance" | "Parcel" | "Police";
  position: LatLng;
  distance: string;
  priority: "High" | "Medium" | "Low";
}

const requestsSeed: DispatchRequest[] = [
  { id: "DSP-001", customer: "Ravi Kumar", phone: "+91 98765 44001", location: "Benz Circle", serviceType: "Ambulance", position: { lat: 16.5062, lng: 80.648 }, distance: "0.9 km", priority: "High" },
  { id: "DSP-002", customer: "Meera Joshi", phone: "+91 98765 44002", location: "One Town", serviceType: "Police", position: { lat: 16.508, lng: 80.63 }, distance: "2.1 km", priority: "High" },
  { id: "DSP-003", customer: "Arjun Reddy", phone: "+91 98765 44003", location: "Autonagar", serviceType: "Parcel", position: { lat: 16.4989, lng: 80.6431 }, distance: "3.4 km", priority: "Medium" },
];

function DispatchPageContent() {
  const { login } = useAuth();
  const { location, locationStatus } = useLiveLocation("dispatch_location");
  const [requests, setRequests] = useState(requestsSeed);
  const [active, setActive] = useState<DispatchRequest | null>(null);
  const [unitPos, setUnitPos] = useState<LatLng>(VIJAYAWADA);
  const [completed, setCompleted] = useState(42);

  useEffect(() => {
    void login("dispatch@pravaah360.in", "dispatch123", "dispatcher");
  }, [login]);

  const accept = (request: DispatchRequest) => {
    setRequests((items) => items.filter((item) => item.id !== request.id));
    setActive(request);
    setUnitPos(location);
    animatePosition(location, request.position, 7000, setUnitPos);
  };

  const complete = () => {
    setCompleted((value) => value + 1);
    setActive(null);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_30%),linear-gradient(180deg,#020617,#0f172a_45%,#111827)]" />
      <header className="border-b border-white/10 bg-slate-950/70 px-6 py-4 backdrop-blur-xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-slate-400">Dispatch Command · Vijayawada</p>
            <h1 className="mt-1 flex items-center gap-3 text-3xl font-bold text-white"><Radio className="h-8 w-8 text-blue-300" /> Live Dispatch Center</h1>
          </div>
          <span className="rounded-xl border border-green-400/20 bg-green-500/10 px-3 py-2 text-sm text-green-100">GPS {locationStatus}</span>
        </div>
      </header>

      <section className="grid gap-6 p-6 xl:grid-cols-[340px_minmax(0,1fr)_330px]">
        <aside className="space-y-4">
          <h2 className="text-xl font-bold text-white">Pending Queue</h2>
          {requests.map((request) => (
            <div key={request.id} className="rounded-3xl border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
              <div className="flex justify-between gap-3">
                <div><p className="font-bold text-white">{request.customer}</p><p className="text-sm text-slate-400">{request.location}</p></div>
                <span className={`h-fit rounded-full px-2.5 py-1 text-xs font-bold ${request.priority === "High" ? "bg-red-500/20 text-red-100" : "bg-orange-500/20 text-orange-100"}`}>{request.priority}</span>
              </div>
              <p className="mt-3 text-sm text-slate-300">{request.serviceType} · {request.distance}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => accept(request)} className="rounded-xl bg-green-500/20 px-3 py-2 font-semibold text-green-100 transition hover:bg-green-500/30">Accept</button>
                <button onClick={() => setRequests((items) => items.filter((item) => item.id !== request.id))} className="rounded-xl bg-red-500/20 px-3 py-2 font-semibold text-red-100 transition hover:bg-red-500/30">Reject</button>
              </div>
            </div>
          ))}
        </aside>

        <div className="h-[680px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] p-3 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <LiveMap
            center={[VIJAYAWADA.lat, VIJAYAWADA.lng]}
            zoom={13}
            autoFitBounds={Boolean(active)}
            userLocation={location}
            showUserLocation
            hospitals={VIJAYAWADA_HOSPITALS.slice(0, 8)}
            trafficSignals={VIJAYAWADA_SIGNALS.map((signal) => ({ ...signal, status: active?.serviceType === "Ambulance" ? "GREEN" : signal.status }))}
            customMarkers={[
              ...(active ? [{ id: "unit", label: "Assigned Unit", lat: unitPos.lat, lng: unitPos.lng, emoji: active.serviceType === "Ambulance" ? "🚑" : active.serviceType === "Parcel" ? "🛵" : "🚓", color: active.serviceType === "Ambulance" ? "#ef4444" : "#3b82f6", pulse: true }] : []),
              ...requests.map((request) => ({ id: request.id, label: request.customer, lat: request.position.lat, lng: request.position.lng, emoji: request.serviceType === "Ambulance" ? "🆘" : "📍", color: request.priority === "High" ? "#ef4444" : "#f97316" })),
            ]}
            polylines={active ? [{ id: "dispatch-route", positions: [location, unitPos, active.position], color: active.serviceType === "Ambulance" ? "#ef4444" : "#3b82f6", weight: 5, dashed: active.serviceType !== "Ambulance" }] : []}
          />
        </div>

        <aside className="space-y-5">
          <Panel>
            <h2 className="flex items-center gap-2 text-xl font-bold text-white"><Truck className="h-5 w-5 text-red-300" /> Active Assignment</h2>
            {active ? (
              <div className="mt-4 space-y-3">
                <p className="text-2xl font-bold text-white">{active.serviceType}</p>
                <p className="text-slate-400">{active.customer} · {active.location}</p>
                <a href={`tel:${active.phone}`} className="block rounded-xl bg-blue-500/15 px-4 py-3 font-semibold text-blue-100"><Phone className="mr-2 inline h-4 w-4" /> Call Customer</a>
                <a target="_blank" href={`https://www.google.com/maps/dir/?api=1&destination=${active.position.lat},${active.position.lng}`} className="block rounded-xl bg-purple-500/15 px-4 py-3 font-semibold text-purple-100"><Navigation className="mr-2 inline h-4 w-4" /> Navigate</a>
                <button onClick={complete} className="w-full rounded-xl bg-green-500/20 px-4 py-3 font-semibold text-green-100"><CheckCircle2 className="mr-2 inline h-4 w-4" /> Complete</button>
                <button onClick={() => alert("Admin escalation sent.")} className="w-full rounded-xl bg-red-500/20 px-4 py-3 font-semibold text-red-100"><ShieldAlert className="mr-2 inline h-4 w-4" /> Emergency</button>
              </div>
            ) : <p className="mt-4 text-slate-400">No active assignment.</p>}
          </Panel>
          <Panel>
            <div className="grid grid-cols-2 gap-3 text-center">
              <Metric icon={AlertTriangle} label="Pending" value={String(requests.length)} />
              <Metric icon={Clock} label="Completed" value={String(completed)} />
            </div>
          </Panel>
        </aside>
      </section>
    </main>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">{children}</div>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><Icon className="mx-auto h-5 w-5 text-blue-300" /><p className="mt-2 text-2xl font-bold text-white">{value}</p><p className="text-xs text-slate-400">{label}</p></div>;
}

export default function DispatchPage() {
  return (
    <AppProvider>
      <DispatchPageContent />
    </AppProvider>
  );
}
