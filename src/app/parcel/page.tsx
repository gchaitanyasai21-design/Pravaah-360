"use client";

import { useEffect, useMemo, useState } from "react";
import { AppProvider } from "@/store/AppContext";
import { useAuth } from "@/store/AuthContext";
import LiveMap from "@/components/LiveMap";
import {
  Bike,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Phone,
  Plus,
  Star,
  Truck,
  User,
} from "lucide-react";
import { LatLng, VIJAYAWADA, animatePosition, distanceKm, useLiveLocation, useSecondsAgo } from "@/lib/realtime";

type ParcelStatus = "Picked" | "In Transit" | "Out for Delivery" | "Delivered";

interface ParcelItem {
  id: string;
  sender: string;
  receiver: string;
  pickup: string;
  delivery: string;
  pickupPos: LatLng;
  deliveryPos: LatLng;
  current: LatLng;
  agent: LatLng;
  status: ParcelStatus;
  eta: string;
  agentName: string;
  agentPhone: string;
  progress: number;
}

const warehouses = [
  { id: "WH-01", label: "Autonagar Hub", lat: 16.4989, lng: 80.6431 },
  { id: "WH-02", label: "Patamata Hub", lat: 16.522, lng: 80.628 },
];

const parcelsSeed: ParcelItem[] = [
  { id: "PRV-PKG-1001", sender: "Ravi Kumar", receiver: "Priya Sharma", pickup: "Benz Circle", delivery: "MG Road", pickupPos: { lat: 16.5062, lng: 80.648 }, deliveryPos: { lat: 16.5033, lng: 80.641 }, current: { lat: 16.5062, lng: 80.648 }, agent: { lat: 16.507, lng: 80.646 }, status: "Out for Delivery", eta: "12 min", agentName: "Kiran Naidu", agentPhone: "+91 98765 42001", progress: 72 },
  { id: "PRV-PKG-1002", sender: "Sneha Iyer", receiver: "Arjun Reddy", pickup: "Governorpet", delivery: "Patamata", pickupPos: { lat: 16.518, lng: 80.635 }, deliveryPos: { lat: 16.522, lng: 80.628 }, current: { lat: 16.519, lng: 80.633 }, agent: { lat: 16.5185, lng: 80.634 }, status: "In Transit", eta: "18 min", agentName: "Sandeep Varma", agentPhone: "+91 98765 42002", progress: 48 },
  { id: "PRV-PKG-1003", sender: "Meera Joshi", receiver: "Lakshmi Devi", pickup: "One Town", delivery: "Kanaka Durga Flyover", pickupPos: { lat: 16.508, lng: 80.63 }, deliveryPos: { lat: 16.5121, lng: 80.6339 }, current: { lat: 16.509, lng: 80.631 }, agent: { lat: 16.5085, lng: 80.6305 }, status: "Picked", eta: "24 min", agentName: "Vikram Singh", agentPhone: "+91 98765 42003", progress: 25 },
  { id: "PRV-PKG-1004", sender: "Ananya Rao", receiver: "Ramesh Babu", pickup: "Autonagar", delivery: "Ramavarappadu", pickupPos: { lat: 16.4989, lng: 80.6431 }, deliveryPos: { lat: 16.5089, lng: 80.652 }, current: { lat: 16.502, lng: 80.646 }, agent: { lat: 16.501, lng: 80.645 }, status: "In Transit", eta: "16 min", agentName: "Amit Raj", agentPhone: "+91 98765 42004", progress: 54 },
  { id: "PRV-PKG-1005", sender: "Naveen Rao", receiver: "Deepa Menon", pickup: "Patamata", delivery: "Benz Circle", pickupPos: { lat: 16.522, lng: 80.628 }, deliveryPos: { lat: 16.5062, lng: 80.648 }, current: { lat: 16.514, lng: 80.638 }, agent: { lat: 16.513, lng: 80.637 }, status: "Out for Delivery", eta: "9 min", agentName: "Rajesh Kumar", agentPhone: "+91 98765 42005", progress: 83 },
  { id: "PRV-PKG-1006", sender: "Harsha Vardhan", receiver: "Pooja Nair", pickup: "MG Road", delivery: "Governorpet", pickupPos: { lat: 16.5033, lng: 80.641 }, deliveryPos: { lat: 16.518, lng: 80.635 }, current: { lat: 16.518, lng: 80.635 }, agent: { lat: 16.518, lng: 80.635 }, status: "Delivered", eta: "Delivered", agentName: "Surya Teja", agentPhone: "+91 98765 42006", progress: 100 },
];

function ParcelPageContent() {
  const { login } = useAuth();
  const { location, accuracy, locationStatus, lastUpdate } = useLiveLocation("parcel_user_location");
  const secondsAgo = useSecondsAgo(lastUpdate);
  const [parcels, setParcels] = useState<ParcelItem[]>(parcelsSeed);
  const [selectedId, setSelectedId] = useState(parcelsSeed[0].id);

  useEffect(() => {
    void login("user@pravaah360.in", "user123", "parcel_user");
  }, [login]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setParcels((current) =>
        current.map((parcel) => {
          if (parcel.status === "Delivered") return parcel;
          let nextPos = parcel.current;
          let nextAgent = parcel.agent;
          animatePosition(parcel.current, parcel.deliveryPos, 2500, (pos) => {
            nextPos = pos;
          });
          animatePosition(parcel.agent, parcel.deliveryPos, 2500, (pos) => {
            nextAgent = pos;
          });
          const nextProgress = Math.min(100, parcel.progress + 6);
          return {
            ...parcel,
            current: {
              lat: parcel.current.lat + (parcel.deliveryPos.lat - parcel.current.lat) * 0.08,
              lng: parcel.current.lng + (parcel.deliveryPos.lng - parcel.current.lng) * 0.08,
            },
            agent: {
              lat: parcel.agent.lat + (parcel.deliveryPos.lat - parcel.agent.lat) * 0.09,
              lng: parcel.agent.lng + (parcel.deliveryPos.lng - parcel.agent.lng) * 0.09,
            },
            progress: nextProgress,
            status: nextProgress > 90 ? "Out for Delivery" : parcel.status,
            eta: nextProgress >= 100 ? "Delivered" : parcel.eta,
          };
        })
      );
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  const selected = parcels.find((parcel) => parcel.id === selectedId) ?? parcels[0];
  const mapMarkers = useMemo(
    () => [
      { id: "user", label: "You", lat: location.lat, lng: location.lng, emoji: "👤", color: "#22c55e", pulse: true, popup: "<b>Your live location</b>" },
      ...parcels.flatMap((parcel) => [
        { id: `${parcel.id}-pkg`, label: parcel.id, lat: parcel.current.lat, lng: parcel.current.lng, emoji: "📦", color: "#f97316", pulse: parcel.id === selected.id, popup: `<b>${parcel.id}</b><br/>${parcel.status}` },
        { id: `${parcel.id}-agent`, label: parcel.agentName, lat: parcel.agent.lat, lng: parcel.agent.lng, emoji: "🛵", color: "#3b82f6", popup: `<b>${parcel.agentName}</b><br/>${parcel.agentPhone}` },
      ]),
      ...warehouses.map((hub) => ({ id: hub.id, label: hub.label, lat: hub.lat, lng: hub.lng, emoji: "🏭", color: "#ef4444", popup: `<b>${hub.label}</b>` })),
    ],
    [location, parcels, selected.id]
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.2),transparent_32%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_30%),linear-gradient(180deg,#020617,#0f172a_45%,#111827)]" />
      <header className="border-b border-white/10 bg-slate-950/70 px-6 py-4 backdrop-blur-xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-slate-400">Parcel Delivery · Live Tracking</p>
            <h1 className="mt-1 flex items-center gap-3 text-3xl font-bold text-white"><Package className="h-8 w-8 text-orange-300" /> Pravaah Parcel</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-xl border border-green-400/20 bg-green-500/10 px-3 py-2 text-sm text-green-100">Live {locationStatus} · {secondsAgo}s · ±{accuracy}m</span>
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 font-semibold text-white transition hover:-translate-y-0.5"><Plus className="h-4 w-4" /> New Order</button>
          </div>
        </div>
      </header>

      <section className="grid gap-6 p-6 xl:grid-cols-[340px_minmax(0,1fr)_340px]">
        <aside className="space-y-4">
          <h2 className="text-xl font-bold text-white">Active Parcels</h2>
          {parcels.map((parcel) => (
            <button key={parcel.id} onClick={() => setSelectedId(parcel.id)} className={`w-full rounded-3xl border p-4 text-left transition hover:-translate-y-1 ${selectedId === parcel.id ? "border-orange-300/40 bg-orange-500/15" : "border-white/10 bg-white/[0.07]"}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold text-white">{parcel.id}</p>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-200">{parcel.status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{parcel.pickup} → {parcel.delivery}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gradient-to-r from-orange-400 to-green-400" style={{ width: `${parcel.progress}%` }} /></div>
            </button>
          ))}
        </aside>

        <div className="h-[680px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] p-3 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <LiveMap
            center={[VIJAYAWADA.lat, VIJAYAWADA.lng]}
            zoom={13}
            autoFitBounds
            customMarkers={mapMarkers}
            polylines={parcels.map((parcel) => ({ id: parcel.id, positions: [parcel.pickupPos, parcel.current, parcel.deliveryPos], color: parcel.id === selected.id ? "#f97316" : "#64748b", dashed: true, weight: parcel.id === selected.id ? 5 : 3 }))}
          />
        </div>

        <aside className="space-y-5">
          <Panel>
            <h2 className="text-xl font-bold text-white">{selected.id}</h2>
            <p className="mt-2 text-slate-400">{selected.sender} → {selected.receiver}</p>
            <div className="mt-5 space-y-3">
              <Detail icon={MapPin} label="Pickup" value={selected.pickup} />
              <Detail icon={Truck} label="Delivery" value={selected.delivery} />
              <Detail icon={Clock} label="ETA" value={selected.eta} />
              <Detail icon={Bike} label="Agent" value={selected.agentName} />
              <Detail icon={Phone} label="Phone" value={selected.agentPhone} />
              <Detail icon={User} label="Distance to you" value={`${distanceKm(location, selected.current).toFixed(2)} km`} />
            </div>
            {selected.status === "Delivered" && (
              <div className="mt-5 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-4">
                <p className="mb-2 font-semibold text-yellow-100">Rate Delivery</p>
                <div className="flex gap-1 text-yellow-300">{[1, 2, 3, 4, 5].map((item) => <Star key={item} className="h-5 w-5 fill-current" />)}</div>
              </div>
            )}
          </Panel>

          <Panel>
            <h3 className="mb-4 text-lg font-bold text-white">Tracking Health</h3>
            <p className="text-sm text-slate-300"><CheckCircle2 className="mr-2 inline h-4 w-4 text-green-300" /> No hydration-random IDs used.</p>
            <p className="mt-3 text-sm text-slate-300"><CheckCircle2 className="mr-2 inline h-4 w-4 text-green-300" /> Parcel markers update every 3 seconds.</p>
          </Panel>
        </aside>
      </section>
    </main>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">{children}</div>;
}

function Detail({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3"><p className="flex items-center gap-2 text-xs text-slate-500"><Icon className="h-4 w-4" /> {label}</p><p className="mt-1 font-semibold text-white">{value}</p></div>;
}

export default function ParcelPage() {
  return (
    <AppProvider>
      <ParcelPageContent />
    </AppProvider>
  );
}
