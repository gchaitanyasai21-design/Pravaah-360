"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppProvider } from "@/store/AppContext";
import { useAuth } from "@/store/AuthContext";
import LiveMap from "@/components/LiveMap";
import {
  AlertTriangle,
  Bike,
  CheckCircle2,
  Coffee,
  MessageCircle,
  Navigation,
  Phone,
  Route,
  ShieldAlert,
  Star,
  Truck,
} from "lucide-react";
import { LatLng, VIJAYAWADA, VIJAYAWADA_HOSPITALS, VIJAYAWADA_SIGNALS, animatePosition, distanceKm, useLiveLocation } from "@/lib/realtime";

type RequestType = "AMBULANCE" | "PARCEL";
type JobStatus = "Going" | "Picked" | "Delivering" | "Delivered";

interface ServiceRequest {
  id: string;
  customer: string;
  phone: string;
  location: string;
  position: LatLng;
  dropoff: LatLng;
  type: RequestType;
  distance: string;
  priority: "High" | "Medium" | "Low";
}

const requestSeed: ServiceRequest[] = [
  { id: "REQ-501", customer: "Ravi Kumar", phone: "+91 98765 43001", location: "Benz Circle", position: { lat: 16.5062, lng: 80.648 }, dropoff: { lat: 16.5033, lng: 80.651 }, type: "AMBULANCE", distance: "1.2 km", priority: "High" },
  { id: "REQ-502", customer: "Priya Sharma", phone: "+91 98765 43002", location: "MG Road", position: { lat: 16.5033, lng: 80.641 }, dropoff: { lat: 16.518, lng: 80.635 }, type: "PARCEL", distance: "2.4 km", priority: "Medium" },
  { id: "REQ-503", customer: "Ananya Rao", phone: "+91 98765 43003", location: "Patamata", position: { lat: 16.522, lng: 80.628 }, dropoff: { lat: 16.5089, lng: 80.652 }, type: "PARCEL", distance: "3.1 km", priority: "Low" },
];

function DriverPageContent() {
  const { login } = useAuth();
  const { location, locationStatus, accuracy } = useLiveLocation("driver_location");
  const [requests, setRequests] = useState<ServiceRequest[]>(requestSeed);
  const [currentJob, setCurrentJob] = useState<ServiceRequest | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus>("Going");
  const [vehiclePos, setVehiclePos] = useState<LatLng>(VIJAYAWADA);
  const [available, setAvailable] = useState(true);
  const [eta, setEta] = useState(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    void login("driver@pravaah360.in", "driver123", "driver");
  }, [login]);

  useEffect(() => setVehiclePos(location), [location]);

  useEffect(() => {
    if (!currentJob || eta <= 0) return;
    const timer = window.setInterval(() => setEta((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [currentJob, eta]);

  const trafficSignals = useMemo(
    () => VIJAYAWADA_SIGNALS.map((signal, index) => ({ ...signal, status: currentJob?.type === "AMBULANCE" ? "GREEN" : signal.status, id: `${signal.id}-${index}` })),
    [currentJob]
  );

  const acceptRequest = (request: ServiceRequest) => {
    cleanupRef.current?.();
    setRequests((items) => items.filter((item) => item.id !== request.id));
    setCurrentJob(request);
    setJobStatus("Going");
    setEta(request.type === "AMBULANCE" ? 8 : 12);
    cleanupRef.current = animatePosition(location, request.position, request.type === "AMBULANCE" ? 6000 : 8000, setVehiclePos, () => {
      if (request.type === "PARCEL") {
        setJobStatus("Picked");
        cleanupRef.current = animatePosition(request.position, request.dropoff, 7000, setVehiclePos, () => setJobStatus("Delivered"));
        setTimeout(() => setJobStatus("Delivering"), 1000);
      }
    });
  };

  const completeJob = () => {
    cleanupRef.current?.();
    setJobStatus("Delivered");
    setEta(0);
    window.setTimeout(() => setCurrentJob(null), 1200);
  };

  const route = currentJob ? [location, vehiclePos, currentJob.type === "PARCEL" && jobStatus !== "Going" ? currentJob.dropoff : currentJob.position] : [];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_30%),linear-gradient(180deg,#020617,#0f172a_45%,#111827)]" />
      <header className="border-b border-white/10 bg-slate-950/70 px-6 py-4 backdrop-blur-xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-slate-400">Service Provider · Vijayawada</p>
            <h1 className="mt-1 flex items-center gap-3 text-3xl font-bold text-white"><Truck className="h-8 w-8 text-orange-300" /> Rajesh Kumar</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-xl border border-green-400/20 bg-green-500/10 px-3 py-2 text-sm text-green-100">GPS {locationStatus} · ±{accuracy}m</span>
            <button onClick={() => setAvailable((value) => !value)} className={`rounded-xl px-4 py-2 font-semibold transition hover:-translate-y-0.5 ${available ? "bg-green-500/20 text-green-100 border border-green-400/30" : "bg-orange-500/20 text-orange-100 border border-orange-400/30"}`}><Coffee className="mr-2 inline h-4 w-4" /> {available ? "Available" : "On Break"}</button>
          </div>
        </div>
      </header>

      <section className="grid gap-6 p-6 xl:grid-cols-[330px_minmax(0,1fr)_330px]">
        <aside className="space-y-4">
          <h2 className="text-xl font-bold text-white">Pending Requests</h2>
          {requests.map((request) => (
            <div key={request.id} className="rounded-3xl border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div><p className="font-bold text-white">{request.customer}</p><p className="text-sm text-slate-400">{request.location}</p></div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${request.priority === "High" ? "bg-red-500/20 text-red-100" : "bg-blue-500/20 text-blue-100"}`}>{request.priority}</span>
              </div>
              <p className="mt-3 text-sm text-slate-300">{request.type} · {request.distance}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => acceptRequest(request)} disabled={!available || Boolean(currentJob)} className="rounded-xl bg-green-500/20 px-3 py-2 font-semibold text-green-100 transition hover:bg-green-500/30 disabled:opacity-40">Accept</button>
                <button onClick={() => setRequests((items) => items.filter((item) => item.id !== request.id))} className="rounded-xl bg-red-500/20 px-3 py-2 font-semibold text-red-100 transition hover:bg-red-500/30">Reject</button>
              </div>
            </div>
          ))}
        </aside>

        <div className="h-[680px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] p-3 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <LiveMap
            center={[VIJAYAWADA.lat, VIJAYAWADA.lng]}
            zoom={13}
            autoFitBounds={Boolean(currentJob)}
            userLocation={location}
            showUserLocation
            trafficSignals={trafficSignals}
            hospitals={VIJAYAWADA_HOSPITALS.slice(0, 5)}
            customMarkers={[
              ...(currentJob ? [{ id: "vehicle", label: "Vehicle", lat: vehiclePos.lat, lng: vehiclePos.lng, emoji: currentJob.type === "AMBULANCE" ? "🚑" : "🛵", color: currentJob.type === "AMBULANCE" ? "#ef4444" : "#3b82f6", pulse: true }] : []),
              ...requests.map((request) => ({ id: request.id, label: request.customer, lat: request.position.lat, lng: request.position.lng, emoji: request.type === "AMBULANCE" ? "🆘" : "📦", color: request.type === "AMBULANCE" ? "#dc2626" : "#f97316" })),
            ]}
            polylines={currentJob ? [{ id: "job-route", positions: route, color: currentJob.type === "AMBULANCE" ? "#ef4444" : "#f97316", dashed: currentJob.type !== "AMBULANCE", weight: 5 }] : []}
          />
        </div>

        <aside className="space-y-5">
          <Panel>
            <h2 className="flex items-center gap-2 text-xl font-bold text-white"><Route className="h-5 w-5 text-blue-300" /> Current Job</h2>
            {currentJob ? (
              <div className="mt-4 space-y-3">
                <p className="text-2xl font-bold text-white">{currentJob.type}</p>
                <p className="text-slate-400">{currentJob.customer} · {currentJob.location}</p>
                <p className="rounded-2xl bg-white/10 p-3 text-sm text-slate-200">Status: {jobStatus} · ETA {eta}s</p>
                <Action href={`tel:${currentJob.phone}`} icon={Phone} label="Call Customer" />
                <Action href={`https://www.google.com/maps/dir/?api=1&destination=${currentJob.position.lat},${currentJob.position.lng}`} icon={Navigation} label="Navigate" />
                <Action href={`sms:${currentJob.phone}`} icon={MessageCircle} label="Chat" />
                <button onClick={completeJob} className="w-full rounded-xl bg-green-500/20 px-4 py-3 font-semibold text-green-100 transition hover:bg-green-500/30"><CheckCircle2 className="mr-2 inline h-4 w-4" /> Complete</button>
                <button onClick={() => alert("Admin notified with current job and location.")} className="w-full rounded-xl bg-red-500/20 px-4 py-3 font-semibold text-red-100 transition hover:bg-red-500/30"><ShieldAlert className="mr-2 inline h-4 w-4" /> Emergency</button>
              </div>
            ) : (
              <p className="mt-4 text-slate-400">Accept a request to begin live routing.</p>
            )}
          </Panel>

          <Panel>
            <h3 className="mb-4 text-lg font-bold text-white">Today</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <Metric icon={Star} label="Rating" value="4.9" />
              <Metric icon={Bike} label="Earnings" value="₹2,840" />
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

function Action({ href, icon: Icon, label }: { href: string; icon: typeof Phone; label: string }) {
  return <a href={href} target={href.startsWith("http") ? "_blank" : undefined} className="block w-full rounded-xl border border-blue-400/30 bg-blue-500/15 px-4 py-3 font-semibold text-blue-100 transition hover:bg-blue-500/25"><Icon className="mr-2 inline h-4 w-4" /> {label}</a>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><Icon className="mx-auto h-5 w-5 text-orange-300" /><p className="mt-2 text-2xl font-bold text-white">{value}</p><p className="text-xs text-slate-400">{label}</p></div>;
}

export default function DriverPage() {
  return (
    <AppProvider>
      <DriverPageContent />
    </AppProvider>
  );
}
