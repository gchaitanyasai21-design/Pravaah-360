// PRAVAAH + LifeLane – Child Safety Direct Page
// Real GPS tracking + localStorage save

"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/store/AuthContext";
import { AppProvider } from "@/store/AppContext";
import LiveMap from "@/components/LiveMap";

// ─── Types ───────────────────────────────────────────────
interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  childId: string;
}

// ─── Constants ───────────────────────────────────────────
const CHILD_ID = "child_001";
const LS_KEY = `child_location_${CHILD_ID}`;

function ChildPageContent() {
  const { login } = useAuth();

  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  }>({ lat: 28.6139, lng: 77.2090 }); // Delhi default

  const [accuracy, setAccuracy] = useState<number>(0);
  const [gpsStatus, setGpsStatus] = useState<string>("Acquiring GPS...");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [childName, setChildName] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  const watchIdRef = useRef<number | null>(null);

  // ─── Auto-login + load saved data ──────────────────────
  useEffect(() => {
    login("child@parvah.com", "child123", "child_user");

    const savedName = localStorage.getItem("childName");
    const savedPhone = localStorage.getItem("parentPhone");
    if (savedName) setChildName(savedName);
    if (savedPhone) setParentPhone(savedPhone);
  }, [login]);

  // ─── Real GPS Tracking ─────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus("❌ GPS not supported");
      setErrorMsg("Your browser does not support geolocation.");
      return;
    }

    setGpsStatus("🔄 Acquiring GPS...");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newLoc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        setCurrentLocation(newLoc);
        setAccuracy(Math.round(pos.coords.accuracy));
        setGpsStatus("✅ Live GPS Active");
        setErrorMsg("");

        // Save to localStorage with child_location_ID key
        const data: LocationData = {
          ...newLoc,
          accuracy: Math.round(pos.coords.accuracy),
          timestamp: pos.timestamp,
          childId: CHILD_ID,
        };

        localStorage.setItem(LS_KEY, JSON.stringify(data));

        // Also keep the old key for backward compatibility
        localStorage.setItem("childLocation", JSON.stringify(newLoc));

        console.log(`[Child] Saved to ${LS_KEY}:`, data);
      },
      (err) => {
        setGpsStatus("⚠️ GPS Error");
        if (err.code === err.PERMISSION_DENIED) {
          setErrorMsg("Location access denied. Please enable in browser settings.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setErrorMsg("Location unavailable. Move to an open area.");
        } else {
          setErrorMsg("GPS timed out. Retrying...");
        }
        console.warn("[Child] GPS error:", err.message);
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 10000,
      }
    );

    // Cleanup on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // ─── Save child info to localStorage ───────────────────
  const handleSaveInfo = () => {
    localStorage.setItem("childName", childName);
    localStorage.setItem("parentPhone", parentPhone);
    alert("✅ Info saved!");
  };

  // ─── UI ────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
      color: "#f1f5f9",
      padding: "20px",
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ margin: 0, fontSize: "1.8rem" }}>🧒 Child Safety</h1>
        <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.9rem" }}>
          Pravaah 360 · Live GPS Tracking
        </p>
      </div>

      {/* GPS Status */}
      <div style={{
        background: "rgba(255,255,255,0.08)",
        padding: "16px",
        borderRadius: "12px",
        marginBottom: "16px",
      }}>
        <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px" }}>
          {gpsStatus}
        </div>

        {errorMsg && (
          <div style={{
            color: "#fca5a5",
            fontSize: "0.85rem",
            marginBottom: "8px",
          }}>
            {errorMsg}
          </div>
        )}

        <div style={{ fontSize: "0.9rem", color: "#cbd5e1" }}>
          📍 Lat: <strong>{currentLocation.lat.toFixed(6)}</strong><br />
          📍 Lng: <strong>{currentLocation.lng.toFixed(6)}</strong><br />
          🎯 Accuracy: <strong>±{accuracy}m</strong>
        </div>

        <div style={{
          marginTop: "10px",
          fontSize: "0.75rem",
          color: "#64748b",
        }}>
          💾 Saved to: <code style={{
            background: "rgba(255,255,255,0.1)",
            padding: "2px 6px",
            borderRadius: "4px",
          }}>{LS_KEY}</code>
        </div>
      </div>

      {/* Child Info Form */}
      <div style={{
        background: "rgba(255,255,255,0.08)",
        padding: "16px",
        borderRadius: "12px",
        marginBottom: "16px",
      }}>
        <h3 style={{ margin: "0 0 12px" }}>👤 Child Info</h3>

        <input
          type="text"
          placeholder="Child Name"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          style={inputStyle}
        />

        <input
          type="tel"
          placeholder="Parent Phone"
          value={parentPhone}
          onChange={(e) => setParentPhone(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleSaveInfo} style={buttonStyle}>
          💾 Save Info
        </button>
      </div>

      {/* Live Map */}
      <div style={{
        background: "rgba(255,255,255,0.08)",
        padding: "16px",
        borderRadius: "12px",
        marginBottom: "16px",
      }}>
        <h3 style={{ margin: "0 0 12px" }}>🗺️ Live Location</h3>
        <LiveMap
        key="child-live-map"
        userLocation={currentLocation}
        showUserLocation={true}
        center={[currentLocation.lat, currentLocation.lng]}
        zoom={14}
/>
      </div>

      {/* Google Maps Link */}
      <a
        href={`https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block",
          textAlign: "center",
          padding: "12px",
          background: "#3b82f6",
          color: "#fff",
          borderRadius: "10px",
          textDecoration: "none",
          fontWeight: 700,
        }}
      >
        🗺️ Open in Google Maps
      </a>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(0,0,0,0.3)",
  color: "#fff",
  fontSize: "0.95rem",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  background: "#22c55e",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "1rem",
};

// ─── Wrapper with AppProvider ──────────────────────────
export default function ChildPage() {
  return (
    <AppProvider>
      <ChildPageContent />
    </AppProvider>
  );
}