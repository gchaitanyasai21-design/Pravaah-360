"use client";
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import BackToLogin from "@/components/BackToLogin";

const LiveMap = dynamic(() => import("@/components/LiveMap"), { ssr: false });

// ─── Types ───────────────────────────────────────────────────────────────────
interface Contact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  isSharing: boolean;
}

interface SafeZone {
  id: string;
  name: string;
  type: "home" | "office" | "college" | "other";
  lat: number;
  lng: number;
  radius: number;
}

interface Incident {
  id: string;
  type: string;
  location: string;
  description: string;
  timestamp: string;
  lat: number;
  lng: number;
}

interface Alert {
  id: string;
  message: string;
  timestamp: string;
  type: "sos" | "zone" | "share" | "info";
}

// ─── Constants ────────────────────────────────────────────────────────────────
const RELATION_OPTIONS = ["Mother", "Father", "Sister", "Brother", "Friend", "Partner", "Other"];
const INCIDENT_TYPES = ["Harassment", "Unsafe Area", "Suspicious Person", "Poor Lighting", "Other"];
const ZONE_ICONS: Record<string, string> = { home: "🏠", office: "🏢", college: "🎓", other: "📍" };

const NEARBY_HELP = [
  { type: "Police", name: "City Police Station", distance: "0.8 km", icon: "👮" },
  { type: "Hospital", name: "General Hospital", distance: "1.2 km", icon: "🏥" },
  { type: "Police", name: "Women's Help Center", distance: "1.5 km", icon: "🛡️" },
  { type: "Hospital", name: "Apollo Clinic", distance: "2.1 km", icon: "🏥" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const genId = () => Math.random().toString(36).slice(2, 9);
const now = () => new Date().toLocaleString("en-IN", { hour12: true });

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WomenSafetyPage() {
  const userId = "user_001";

  // State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [fakeCallTimer, setFakeCallTimer] = useState(0);
  const [activeTab, setActiveTab] = useState<"contacts" | "zones" | "incidents" | "alerts">("contacts");
  const [shakeEnabled, setShakeEnabled] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(0);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddZone, setShowAddZone] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);

  // Forms
  const [newContact, setNewContact] = useState({ name: "", phone: "", relation: "Friend" });
  const [newZone, setNewZone] = useState({ name: "", type: "home" as SafeZone["type"] });
  const [newIncident, setNewIncident] = useState({ type: "Harassment", location: "", description: "" });

  const sosTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fakeCallRef = useRef<NodeJS.Timeout | null>(null);
  const shakeRef = useRef({ lastX: 0, lastY: 0, lastZ: 0, lastTime: 0 });

  // ─── Load from localStorage ──────────────────────────────────────────────
  useEffect(() => {
    const savedContacts = localStorage.getItem(`ws_contacts_${userId}`);
    const savedZones = localStorage.getItem(`ws_zones_${userId}`);
    const savedIncidents = localStorage.getItem(`ws_incidents_${userId}`);
    const savedAlerts = localStorage.getItem(`ws_alerts_${userId}`);

    if (savedContacts) setContacts(JSON.parse(savedContacts));
    if (savedZones) setSafeZones(JSON.parse(savedZones));
    if (savedIncidents) setIncidents(JSON.parse(savedIncidents));
    if (savedAlerts) setAlerts(JSON.parse(savedAlerts));

    // Default contacts if empty
    if (!savedContacts) {
      const defaults: Contact[] = [
        { id: genId(), name: "Mom", phone: "9876543210", relation: "Mother", isSharing: false },
        { id: genId(), name: "Priya", phone: "9123456780", relation: "Friend", isSharing: false },
      ];
      setContacts(defaults);
      localStorage.setItem(`ws_contacts_${userId}`, JSON.stringify(defaults));
    }
  }, []);

  // ─── GPS ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watcher = navigator.geolocation.watchPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => setUserLocation([28.6139, 77.2090]),
      { enableHighAccuracy: false, timeout: 30000 }
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  // ─── Shake Detection ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!shakeEnabled) return;
    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const { x = 0, y = 0, z = 0 } = acc;
      const now_ = Date.now();
      const { lastX, lastY, lastZ, lastTime } = shakeRef.current;
      const dt = now_ - lastTime;
      if (dt > 100) {
        const delta = Math.abs(x! - lastX) + Math.abs(y! - lastY) + Math.abs(z! - lastZ);
        if (delta > 40) triggerSOS();
        shakeRef.current = { lastX: x!, lastY: y!, lastZ: z!, lastTime: now_ };
      }
    };
    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [shakeEnabled]);

  // ─── Save helpers ────────────────────────────────────────────────────────
  const saveContacts = (data: Contact[]) => {
    setContacts(data);
    localStorage.setItem(`ws_contacts_${userId}`, JSON.stringify(data));
  };
  const saveZones = (data: SafeZone[]) => {
    setSafeZones(data);
    localStorage.setItem(`ws_zones_${userId}`, JSON.stringify(data));
  };
  const saveIncidents = (data: Incident[]) => {
    setIncidents(data);
    localStorage.setItem(`ws_incidents_${userId}`, JSON.stringify(data));
  };
  const saveAlerts = (data: Alert[]) => {
    setAlerts(data);
    localStorage.setItem(`ws_alerts_${userId}`, JSON.stringify(data));
  };

  const addAlert = (message: string, type: Alert["type"]) => {
    const newAlert: Alert = { id: genId(), message, timestamp: now(), type };
    const updated = [newAlert, ...alerts].slice(0, 20);
    saveAlerts(updated);
  };

  // ─── SOS ─────────────────────────────────────────────────────────────────
  const triggerSOS = () => {
    if (isSOSActive) {
      cancelSOS();
      return;
    }
    setIsSOSActive(true);
    setSosCountdown(5);
    let count = 5;
    sosTimerRef.current = setInterval(() => {
      count--;
      setSosCountdown(count);
      if (count <= 0) {
        clearInterval(sosTimerRef.current!);
        sendSOSAlert();
      }
    }, 1000);
  };

  const cancelSOS = () => {
    if (sosTimerRef.current) clearInterval(sosTimerRef.current);
    setIsSOSActive(false);
    setSosCountdown(0);
    addAlert("SOS cancelled by user", "info");
  };

  const sendSOSAlert = () => {
    setIsSOSActive(false);
    setSosCountdown(0);
    const loc = userLocation ? `${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)}` : "Unknown";
    addAlert(`🚨 SOS SENT! Location: ${loc} — Notified ${contacts.length} contacts`, "sos");
  };

  // ─── Fake Call ───────────────────────────────────────────────────────────
  const startFakeCall = () => {
    setFakeCallActive(true);
    setFakeCallTimer(3);
    let t = 3;
    fakeCallRef.current = setInterval(() => {
      t--;
      setFakeCallTimer(t);
      if (t <= 0) clearInterval(fakeCallRef.current!);
    }, 1000);
    addAlert("📞 Fake call triggered", "info");
  };

  const endFakeCall = () => {
    if (fakeCallRef.current) clearInterval(fakeCallRef.current);
    setFakeCallActive(false);
    setFakeCallTimer(0);
  };

  // ─── Location Sharing ────────────────────────────────────────────────────
  const toggleSharing = () => {
    const next = !isSharingLocation;
    setIsSharingLocation(next);
    if (next) {
      const loc = userLocation ? `${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)}` : "Unknown";
      addAlert(`📍 Live location sharing started — ${loc}`, "share");
    } else {
      addAlert("📍 Location sharing stopped", "info");
    }
  };

  // ─── Contacts ────────────────────────────────────────────────────────────
  const addContact = () => {
    if (!newContact.name || !newContact.phone) return;
    const contact: Contact = { ...newContact, id: genId(), isSharing: false };
    saveContacts([...contacts, contact]);
    setNewContact({ name: "", phone: "", relation: "Friend" });
    setShowAddContact(false);
  };

  const deleteContact = (id: string) => saveContacts(contacts.filter((c) => c.id !== id));

  const toggleContactSharing = (id: string) => {
    saveContacts(contacts.map((c) => c.id === id ? { ...c, isSharing: !c.isSharing } : c));
  };

  // ─── Safe Zones ──────────────────────────────────────────────────────────
  const addZone = () => {
    if (!newZone.name || !userLocation) return;
    const zone: SafeZone = {
      id: genId(), name: newZone.name, type: newZone.type,
      lat: userLocation[0], lng: userLocation[1], radius: 200,
    };
    saveZones([...safeZones, zone]);
    setNewZone({ name: "", type: "home" });
    setShowAddZone(false);
    addAlert(`✅ Safe zone "${zone.name}" added`, "zone");
  };

  const deleteZone = (id: string) => saveZones(safeZones.filter((z) => z.id !== id));

  // ─── Incidents ───────────────────────────────────────────────────────────
  const submitIncident = () => {
    if (!newIncident.location) return;
    const incident: Incident = {
      id: genId(), ...newIncident, timestamp: now(),
      lat: userLocation?.[0] ?? 28.6139,
      lng: userLocation?.[1] ?? 77.2090,
    };
    saveIncidents([incident, ...incidents]);
    setNewIncident({ type: "Harassment", location: "", description: "" });
    setShowReportForm(false);
    addAlert(`⚠️ Incident reported: ${incident.type} at ${incident.location}`, "info");
  };

  // ─── Stats ───────────────────────────────────────────────────────────────
  const stats = [
    { label: "Trusted Contacts", value: contacts.length, icon: "👥", color: "#3b82f6" },
    { label: "Safe Zones", value: safeZones.length, icon: "🛡️", color: "#22c55e" },
    { label: "Incidents Reported", value: incidents.length, icon: "⚠️", color: "#f59e0b" },
    { label: "Recent Alerts", value: alerts.length, icon: "🔔", color: "#ef4444" },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
      fontFamily: "'Inter', sans-serif",
      color: "#f1f5f9",
    }}>

      {/* ── Fake Call Overlay ── */}
      {fakeCallActive && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 24,
        }}>
          <div style={{ fontSize: "5rem" }}>📱</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f1f5f9" }}>
            {fakeCallTimer > 0 ? `Calling in ${fakeCallTimer}s...` : "Incoming Call..."}
          </div>
          <div style={{ fontSize: "1.1rem", color: "#94a3b8" }}>Mom</div>
          <div style={{ fontSize: "0.9rem", color: "#64748b" }}>+91 98765 43210</div>
          <div style={{ display: "flex", gap: 32, marginTop: 24 }}>
            <button onClick={endFakeCall} style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "#ef4444", border: "none",
              fontSize: "2rem", cursor: "pointer",
            }}>📵</button>
            <button onClick={endFakeCall} style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "#22c55e", border: "none",
              fontSize: "2rem", cursor: "pointer",
            }}>📞</button>
          </div>
          <p style={{ color: "#64748b", fontSize: "0.8rem", marginTop: 8 }}>
            Tap either button to dismiss
          </p>
        </div>
      )}

      {/* ── Navbar ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(15,23,42,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <BackToLogin />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.5rem" }}>🚺</span>
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f1f5f9" }}>
                Women's Safety
              </div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Pravaah 360</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Shake toggle */}
          <button
            onClick={() => setShakeEnabled(!shakeEnabled)}
            style={{
              padding: "8px 14px",
              background: shakeEnabled ? "rgba(234,179,8,0.2)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${shakeEnabled ? "rgba(234,179,8,0.4)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 10, color: shakeEnabled ? "#fbbf24" : "#94a3b8",
              fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
            }}>
            📳 Shake {shakeEnabled ? "ON" : "OFF"}
          </button>

          {/* Location sharing */}
          <button
            onClick={toggleSharing}
            style={{
              padding: "8px 14px",
              background: isSharingLocation ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${isSharingLocation ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 10, color: isSharingLocation ? "#4ade80" : "#94a3b8",
              fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
            }}>
            📍 {isSharingLocation ? "Sharing" : "Share"}
          </button>

          {/* ID badge */}
          <div style={{
            padding: "6px 14px",
            background: "rgba(236,72,153,0.15)",
            border: "1px solid rgba(236,72,153,0.3)",
            borderRadius: 10, color: "#f9a8d4",
            fontSize: "0.8rem", fontWeight: 600,
          }}>
            ID: {userId}
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 20px" }}>

        {/* ── Stat Cards ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16, marginBottom: 24,
        }}>
          {stats.map((s) => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, padding: "20px 24px",
              display: "flex", alignItems: "center", gap: 16,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: `${s.color}22`,
                border: `1px solid ${s.color}44`,
                display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "1.5rem",
              }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr 340px",
          gap: 20,
        }}>

          {/* ── LEFT: SOS + Quick Actions ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* SOS Button */}
            <div style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 20, padding: 24,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
            }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#fca5a5", letterSpacing: 2 }}>
                EMERGENCY SOS
              </div>

              {/* Big SOS Button */}
              <button
                onClick={triggerSOS}
                style={{
                  width: 160, height: 160, borderRadius: "50%",
                  background: isSOSActive
                    ? `radial-gradient(circle, #7f1d1d, #ef4444)`
                    : `radial-gradient(circle, #991b1b, #dc2626)`,
                  border: `6px solid ${isSOSActive ? "#fca5a5" : "#ef4444"}`,
                  boxShadow: isSOSActive
                    ? "0 0 40px rgba(239,68,68,0.8), 0 0 80px rgba(239,68,68,0.4)"
                    : "0 0 20px rgba(239,68,68,0.4)",
                  cursor: "pointer",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 4,
                  animation: isSOSActive ? "pulse 0.8s infinite" : "none",
                  transition: "all 0.3s",
                }}>
                <span style={{ fontSize: "2.5rem" }}>🆘</span>
                <span style={{
                  color: "#fff", fontWeight: 900, fontSize: "1.2rem", letterSpacing: 3
                }}>
                  {isSOSActive ? `${sosCountdown}s` : "SOS"}
                </span>
              </button>

              {isSOSActive ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "#fca5a5", fontWeight: 700, fontSize: "1rem" }}>
                    Sending in {sosCountdown}s...
                  </div>
                  <button
                    onClick={cancelSOS}
                    style={{
                      marginTop: 10, padding: "8px 24px",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: 10, color: "#f1f5f9",
                      fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
                    }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <p style={{ color: "#94a3b8", fontSize: "0.8rem", textAlign: "center", margin: 0 }}>
                  Hold to send SOS to all trusted contacts
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, padding: 20,
            }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#94a3b8", marginBottom: 14, letterSpacing: 1 }}>
                QUICK ACTIONS
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                {/* Fake Call */}
                <button onClick={startFakeCall} style={{
                  padding: "14px 16px",
                  background: "rgba(168,85,247,0.12)",
                  border: "1px solid rgba(168,85,247,0.25)",
                  borderRadius: 12, color: "#c4b5fd",
                  fontSize: "0.9rem", fontWeight: 600,
                  cursor: "pointer", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ fontSize: "1.3rem" }}>📞</span>
                  <div>
                    <div>Fake Call</div>
                    <div style={{ fontSize: "0.75rem", color: "#a78bfa", fontWeight: 400 }}>
                      Simulates incoming call
                    </div>
                  </div>
                </button>

                {/* Share Location */}
                <button onClick={toggleSharing} style={{
                  padding: "14px 16px",
                  background: isSharingLocation ? "rgba(34,197,94,0.12)" : "rgba(59,130,246,0.12)",
                  border: `1px solid ${isSharingLocation ? "rgba(34,197,94,0.25)" : "rgba(59,130,246,0.25)"}`,
                  borderRadius: 12,
                  color: isSharingLocation ? "#86efac" : "#93c5fd",
                  fontSize: "0.9rem", fontWeight: 600,
                  cursor: "pointer", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ fontSize: "1.3rem" }}>📍</span>
                  <div>
                    <div>{isSharingLocation ? "Stop Sharing" : "Share Location"}</div>
                    <div style={{ fontSize: "0.75rem", color: isSharingLocation ? "#4ade80" : "#60a5fa", fontWeight: 400 }}>
                      {isSharingLocation ? "Live sharing active" : "Send to trusted contacts"}
                    </div>
                  </div>
                </button>

                {/* Report Incident */}
                <button onClick={() => { setShowReportForm(true); setActiveTab("incidents"); }} style={{
                  padding: "14px 16px",
                  background: "rgba(245,158,11,0.12)",
                  border: "1px solid rgba(245,158,11,0.25)",
                  borderRadius: 12, color: "#fcd34d",
                  fontSize: "0.9rem", fontWeight: 600,
                  cursor: "pointer", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ fontSize: "1.3rem" }}>⚠️</span>
                  <div>
                    <div>Report Incident</div>
                    <div style={{ fontSize: "0.75rem", color: "#fbbf24", fontWeight: 400 }}>
                      Flag unsafe area
                    </div>
                  </div>
                </button>

                {/* Add Safe Zone */}
                <button onClick={() => { setShowAddZone(true); setActiveTab("zones"); }} style={{
                  padding: "14px 16px",
                  background: "rgba(34,197,94,0.12)",
                  border: "1px solid rgba(34,197,94,0.25)",
                  borderRadius: 12, color: "#86efac",
                  fontSize: "0.9rem", fontWeight: 600,
                  cursor: "pointer", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ fontSize: "1.3rem" }}>🛡️</span>
                  <div>
                    <div>Mark Safe Zone</div>
                    <div style={{ fontSize: "0.75rem", color: "#4ade80", fontWeight: 400 }}>
                      Save current location
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Nearby Help */}
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, padding: 20,
            }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#94a3b8", marginBottom: 14, letterSpacing: 1 }}>
                NEARBY HELP
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {NEARBY_HELP.map((h, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 10,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: "1.2rem" }}>{h.icon}</span>
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f1f5f9" }}>{h.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{h.type}</div>
                      </div>
                    </div>
                    <div style={{
                      fontSize: "0.78rem", fontWeight: 700,
                      color: h.type === "Police" ? "#60a5fa" : "#4ade80",
                      background: h.type === "Police" ? "rgba(59,130,246,0.1)" : "rgba(34,197,94,0.1)",
                      padding: "4px 8px", borderRadius: 8,
                    }}>{h.distance}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── MIDDLE: Map ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20, overflow: "hidden",
            }}>
              {/* Map header */}
              <div style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "1.2rem" }}>🗺️</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Live Map</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      {userLocation
                        ? `${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)}`
                        : "Getting location..."}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {isSharingLocation && (
                    <div style={{
                      padding: "4px 10px",
                      background: "rgba(34,197,94,0.15)",
                      border: "1px solid rgba(34,197,94,0.3)",
                      borderRadius: 8, color: "#4ade80",
                      fontSize: "0.75rem", fontWeight: 600,
                    }}>
                      🔴 LIVE
                    </div>
                  )}
                  <div style={{
                    padding: "4px 10px",
                    background: "rgba(236,72,153,0.1)",
                    border: "1px solid rgba(236,72,153,0.2)",
                    borderRadius: 8, color: "#f9a8d4",
                    fontSize: "0.75rem", fontWeight: 600,
                  }}>
                    {safeZones.length} Safe Zones
                  </div>
                </div>
              </div>

             {/* Map */}
<div style={{ height: 420 }}>
  <LiveMap
    key={userLocation ? `${userLocation[0]}-${userLocation[1]}` : "default"}
    center={userLocation ?? [28.6139, 77.2090]}
    zoom={14}
    showUserLocation={!!userLocation}
    showControls={true}
    userLocation={
      userLocation
        ? { lat: userLocation[0], lng: userLocation[1] }
        : undefined
    }
  />
</div>
            </div>

            {/* Map Legend */}
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14, padding: "14px 20px",
              display: "flex", gap: 20, flexWrap: "wrap",
            }}>
              {[
                { icon: "🔵", label: "Your Location" },
                { icon: "🛡️", label: "Safe Zone" },
                { icon: "⚠️", label: "Incident Reported" },
                { icon: "👮", label: "Police Station" },
                { icon: "🏥", label: "Hospital" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{item.icon}</span>
                  <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Tabs Panel ── */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20, display: "flex", flexDirection: "column",
            overflow: "hidden",
          }}>
            {/* Tab headers */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}>
              {(["contacts", "zones", "incidents", "alerts"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "14px 4px",
                    background: activeTab === tab ? "rgba(236,72,153,0.12)" : "transparent",
                    border: "none",
                    borderBottom: activeTab === tab ? "2px solid #ec4899" : "2px solid transparent",
                    color: activeTab === tab ? "#f9a8d4" : "#64748b",
                    fontSize: "0.72rem", fontWeight: 600,
                    cursor: "pointer", textTransform: "uppercase", letterSpacing: 0.5,
                    transition: "all 0.2s",
                  }}>
                  {tab === "contacts" ? "👥" : tab === "zones" ? "🛡️" : tab === "incidents" ? "⚠️" : "🔔"}
                  <br />
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>

              {/* CONTACTS TAB */}
              {activeTab === "contacts" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button onClick={() => setShowAddContact(!showAddContact)} style={{
                    padding: "10px",
                    background: "rgba(34,197,94,0.12)",
                    border: "1px solid rgba(34,197,94,0.25)",
                    borderRadius: 10, color: "#86efac",
                    fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
                  }}>
                    + Add Trusted Contact
                  </button>

                  {showAddContact && (
                    <div style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12, padding: 14,
                      display: "flex", flexDirection: "column", gap: 8,
                    }}>
                      <input
                        placeholder="Name"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        style={inputStyle}
                      />
                      <input
                        placeholder="Phone number"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        style={inputStyle}
                      />
                      <select
                        value={newContact.relation}
                        onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                        style={inputStyle}>
                        {RELATION_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={addContact} style={saveBtnStyle}>Save</button>
                        <button onClick={() => setShowAddContact(false)} style={cancelBtnStyle}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {contacts.map((c) => (
                    <div key={c.id} style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12, padding: 14,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: "rgba(236,72,153,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "1rem", fontWeight: 700, color: "#f9a8d4",
                          }}>
                            {c.name[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{c.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{c.relation}</div>
                          </div>
                        </div>
                        <button onClick={() => deleteContact(c.id)} style={{
                          background: "none", border: "none",
                          color: "#ef4444", cursor: "pointer", fontSize: "1rem",
                        }}>🗑️</button>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: 8 }}>📱 {c.phone}</div>
                      <button
                        onClick={() => toggleContactSharing(c.id)}
                        style={{
                          width: "100%", padding: "6px",
                          background: c.isSharing ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)",
                          border: `1px solid ${c.isSharing ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`,
                          borderRadius: 8, color: c.isSharing ? "#4ade80" : "#64748b",
                          fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                        }}>
                        {c.isSharing ? "📍 Sharing Location" : "Share Location"}
                      </button>
                    </div>
                  ))}

                  {contacts.length === 0 && (
                    <div style={{ textAlign: "center", color: "#64748b", padding: 20, fontSize: "0.85rem" }}>
                      No trusted contacts yet
                    </div>
                  )}
                </div>
              )}

              {/* SAFE ZONES TAB */}
              {activeTab === "zones" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button onClick={() => setShowAddZone(!showAddZone)} style={{
                    padding: "10px",
                    background: "rgba(34,197,94,0.12)",
                    border: "1px solid rgba(34,197,94,0.25)",
                    borderRadius: 10, color: "#86efac",
                    fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
                  }}>
                    + Add Safe Zone (Current Location)
                  </button>

                  {showAddZone && (
                    <div style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12, padding: 14,
                      display: "flex", flexDirection: "column", gap: 8,
                    }}>
                      <input
                        placeholder="Zone name (e.g. Home, Office)"
                        value={newZone.name}
                        onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                        style={inputStyle}
                      />
                      <select
                        value={newZone.type}
                        onChange={(e) => setNewZone({ ...newZone, type: e.target.value as SafeZone["type"] })}
                        style={inputStyle}>
                        <option value="home">🏠 Home</option>
                        <option value="office">🏢 Office</option>
                        <option value="college">🎓 College</option>
                        <option value="other">📍 Other</option>
                      </select>
                      <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                        📍 Will save your current GPS location
                      </p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={addZone} style={saveBtnStyle}>Save Zone</button>
                        <button onClick={() => setShowAddZone(false)} style={cancelBtnStyle}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {safeZones.map((z) => (
                    <div key={z.id} style={{
                      background: "rgba(34,197,94,0.06)",
                      border: "1px solid rgba(34,197,94,0.15)",
                      borderRadius: 12, padding: 14,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "1.5rem" }}>{ZONE_ICONS[z.type]}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{z.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                            {z.lat.toFixed(4)}, {z.lng.toFixed(4)} • r={z.radius}m
                          </div>
                        </div>
                      </div>
                      <button onClick={() => deleteZone(z.id)} style={{
                        background: "none", border: "none",
                        color: "#ef4444", cursor: "pointer", fontSize: "1rem",
                      }}>🗑️</button>
                    </div>
                  ))}

                  {safeZones.length === 0 && (
                    <div style={{ textAlign: "center", color: "#64748b", padding: 20, fontSize: "0.85rem" }}>
                      No safe zones added
                    </div>
                  )}
                </div>
              )}

              {/* INCIDENTS TAB */}
              {activeTab === "incidents" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button onClick={() => setShowReportForm(!showReportForm)} style={{
                    padding: "10px",
                    background: "rgba(245,158,11,0.12)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    borderRadius: 10, color: "#fcd34d",
                    fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
                  }}>
                    + Report Incident
                  </button>

                  {showReportForm && (
                    <div style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12, padding: 14,
                      display: "flex", flexDirection: "column", gap: 8,
                    }}>
                      <select
                        value={newIncident.type}
                        onChange={(e) => setNewIncident({ ...newIncident, type: e.target.value })}
                        style={inputStyle}>
                        {INCIDENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input
                        placeholder="Location / Area name"
                        value={newIncident.location}
                        onChange={(e) => setNewIncident({ ...newIncident, location: e.target.value })}
                        style={inputStyle}
                      />
                      <textarea
                        placeholder="Description (optional)"
                        value={newIncident.description}
                        onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                        rows={3}
                        style={{ ...inputStyle, resize: "vertical" }}
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={submitIncident} style={saveBtnStyle}>Submit Report</button>
                        <button onClick={() => setShowReportForm(false)} style={cancelBtnStyle}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {incidents.map((inc) => (
                    <div key={inc.id} style={{
                      background: "rgba(245,158,11,0.06)",
                      border: "1px solid rgba(245,158,11,0.15)",
                      borderRadius: 12, padding: 14,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{
                          padding: "3px 8px",
                          background: "rgba(245,158,11,0.15)",
                          borderRadius: 6, color: "#fbbf24",
                          fontSize: "0.75rem", fontWeight: 600,
                        }}>{inc.type}</span>
                        <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{inc.timestamp}</span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#f1f5f9", marginTop: 6 }}>
                        📍 {inc.location}
                      </div>
                      {inc.description && (
                        <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: 4 }}>{inc.description}</div>
                      )}
                    </div>
                  ))}

                  {incidents.length === 0 && (
                    <div style={{ textAlign: "center", color: "#64748b", padding: 20, fontSize: "0.85rem" }}>
                      No incidents reported
                    </div>
                  )}
                </div>
              )}

              {/* ALERTS TAB */}
              {activeTab === "alerts" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {alerts.length > 0 && (
                    <button
                      onClick={() => saveAlerts([])}
                      style={{
                        padding: "8px",
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: 8, color: "#fca5a5",
                        fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                      }}>
                      Clear All Alerts
                    </button>
                  )}

                  {alerts.map((a) => {
                    const alertColors: Record<Alert["type"], string> = {
                      sos: "#ef4444", zone: "#22c55e", share: "#3b82f6", info: "#94a3b8"
                    };
                    return (
                      <div key={a.id} style={{
                        background: `${alertColors[a.type]}0d`,
                        border: `1px solid ${alertColors[a.type]}22`,
                        borderRadius: 10, padding: "10px 12px",
                        borderLeft: `3px solid ${alertColors[a.type]}`,
                      }}>
                        <div style={{ fontSize: "0.82rem", color: "#f1f5f9", fontWeight: 500 }}>{a.message}</div>
                        <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 4 }}>{a.timestamp}</div>
                      </div>
                    );
                  })}

                  {alerts.length === 0 && (
                    <div style={{ textAlign: "center", color: "#64748b", padding: 20, fontSize: "0.85rem" }}>
                      No alerts yet
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── CSS Animations ── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 40px rgba(239,68,68,0.8), 0 0 80px rgba(239,68,68,0.4); }
          50% { box-shadow: 0 0 60px rgba(239,68,68,1), 0 0 120px rgba(239,68,68,0.6); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
}

// ─── Shared Input Styles ──────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8, color: "#f1f5f9",
  fontSize: "0.85rem", fontFamily: "'Inter', sans-serif",
  outline: "none", boxSizing: "border-box",
};

const saveBtnStyle: React.CSSProperties = {
  flex: 1, padding: "9px",
  background: "rgba(34,197,94,0.2)",
  border: "1px solid rgba(34,197,94,0.3)",
  borderRadius: 8, color: "#86efac",
  fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
};

const cancelBtnStyle: React.CSSProperties = {
  flex: 1, padding: "9px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8, color: "#94a3b8",
  fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
};