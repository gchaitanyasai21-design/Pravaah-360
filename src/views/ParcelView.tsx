// PRAVAAH 360 - ParcelView (UI Polished)
// Package delivery and tracking system

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  User,
  Plus,
  Search,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import LiveMap from "@/components/LiveMap";
import BackToLogin from "@/components/BackToLogin";
import { useApp } from "@/store/AppContext";
import { useAuth } from "@/store/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ParcelRequest {
  id: string;
  senderName: string;
  senderPhone: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  packageType: string;
  weight: string;
  status: "pending" | "picked_up" | "in_transit" | "delivered";
  createdAt: Date;
  estimatedDelivery?: Date;
  trackingCode: string;
}

// ─── Status Helpers ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  delivered: {
    label: "Delivered",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.15)",
    icon: CheckCircle,
  },
  in_transit: {
    label: "In Transit",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.15)",
    icon: Truck,
  },
  picked_up: {
    label: "Picked Up",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.15)",
    icon: Package,
  },
  pending: {
    label: "Pending",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.15)",
    icon: Clock,
  },
};

// ─── Tracking Progress Steps ───────────────────────────────────────────────────
const STEPS = ["pending", "picked_up", "in_transit", "delivered"] as const;
const STEP_LABELS = ["Booked", "Picked Up", "In Transit", "Delivered"];

function TrackingProgress({ status }: { status: ParcelRequest["status"] }) {
  const currentIdx = STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0 mt-3 mb-1">
      {STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const cfg = STATUS_CONFIG[step];
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: done ? cfg.color : "rgba(255,255,255,0.08)",
                  border: `2px solid ${done ? cfg.color : "rgba(255,255,255,0.15)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s",
                }}
              >
                {done && (
                  <CheckCircle
                    style={{ width: 14, height: 14, color: "#0f172a" }}
                  />
                )}
              </div>
              <span
                style={{
                  fontSize: 9,
                  color: done ? cfg.color : "#64748b",
                  fontWeight: done ? 600 : 400,
                  whiteSpace: "nowrap",
                }}
              >
                {STEP_LABELS[i]}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background:
                    i < currentIdx ? "#3b82f6" : "rgba(255,255,255,0.08)",
                  marginBottom: 18,
                  transition: "background 0.3s",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Parcel Card ───────────────────────────────────────────────────────────────
function ParcelCard({ parcel }: { parcel: ParcelRequest }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[parcel.status];
  const StatusIcon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 14,
        padding: "14px 16px",
        cursor: "pointer",
      }}
      onClick={() => setExpanded((p) => !p)}
    >
      {/* Top Row */}
      <div
        style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
      >
        {/* Icon */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: cfg.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <StatusIcon style={{ width: 20, height: 20, color: cfg.color }} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 13,
                fontWeight: 700,
                color: "#f1f5f9",
                letterSpacing: 1,
              }}
            >
              {parcel.trackingCode}
            </span>
            <span
              style={{
                padding: "2px 10px",
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 700,
                background: cfg.bg,
                color: cfg.color,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                flexShrink: 0,
              }}
            >
              {cfg.label}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 4,
            }}
          >
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              {parcel.packageType}
            </span>
            <span style={{ color: "#475569", fontSize: 10 }}>•</span>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              {parcel.weight}
            </span>
            <span style={{ color: "#475569", fontSize: 10 }}>•</span>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              {parcel.createdAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Expand toggle */}
        <div style={{ color: "#64748b", flexShrink: 0, marginTop: 2 }}>
          {expanded ? (
            <ChevronUp style={{ width: 16, height: 16 }} />
          ) : (
            <ChevronDown style={{ width: 16, height: 16 }} />
          )}
        </div>
      </div>

      {/* Progress bar */}
      <TrackingProgress status={parcel.status} />

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                marginTop: 12,
                padding: "12px",
                background: "rgba(0,0,0,0.2)",
                borderRadius: 10,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {/* Sender */}
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <User
                  style={{ width: 14, height: 14, color: "#3b82f6", marginTop: 2, flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
                    FROM
                  </div>
                  <div style={{ fontSize: 13, color: "#f1f5f9" }}>
                    {parcel.senderName}
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>
                    {parcel.pickupAddress}
                  </div>
                </div>
              </div>

              {/* Arrow divider */}
              <div
                style={{
                  borderLeft: "2px dashed rgba(59,130,246,0.4)",
                  marginLeft: 7,
                  height: 12,
                }}
              />

              {/* Recipient */}
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <MapPin
                  style={{ width: 14, height: 14, color: "#22c55e", marginTop: 2, flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
                    TO
                  </div>
                  <div style={{ fontSize: 13, color: "#f1f5f9" }}>
                    {parcel.recipientName}
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>
                    {parcel.deliveryAddress}
                  </div>
                </div>
              </div>

              {/* Est. delivery */}
              {parcel.estimatedDelivery && (
                <div
                  style={{
                    marginTop: 4,
                    padding: "6px 10px",
                    background: "rgba(59,130,246,0.1)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Clock style={{ width: 12, height: 12, color: "#3b82f6" }} />
                  <span style={{ fontSize: 12, color: "#93c5fd" }}>
                    Est. Delivery:{" "}
                    {parcel.estimatedDelivery.toLocaleDateString([], {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Input Component ───────────────────────────────────────────────────────────
function FormInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label
        style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 10,
          padding: "10px 12px",
          color: "#f1f5f9",
          fontSize: 13,
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          fontFamily: "Inter, sans-serif",
        }}
        onFocus={(e) => {
          e.target.style.border = "1px solid #3b82f6";
        }}
        onBlur={(e) => {
          e.target.style.border = "1px solid rgba(255,255,255,0.12)";
        }}
      />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ParcelView() {
  const { ambulances } = useApp();
  const { user } = useAuth();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchCode, setSearchCode] = useState("");
  const [searched, setSearched] = useState(false);
  const [currentLocation] = useState({ lat: 28.6139, lng: 77.209 });

  const [parcels, setParcels] = useState<ParcelRequest[]>([
    {
      id: "parcel-1",
      senderName: "John Doe",
      senderPhone: "+91-9876543210",
      pickupAddress: "123, Main Street, Delhi",
      pickupLat: 28.6139,
      pickupLng: 77.209,
      recipientName: "Jane Smith",
      recipientPhone: "+91-9876543211",
      deliveryAddress: "456, Park Avenue, Delhi",
      deliveryLat: 28.6289,
      deliveryLng: 77.2195,
      packageType: "Document",
      weight: "0.5 kg",
      status: "in_transit",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      estimatedDelivery: new Date(Date.now() + 1 * 60 * 60 * 1000),
      trackingCode: "PKG-ABC123",
    },
    {
      id: "parcel-2",
      senderName: "Alice Johnson",
      senderPhone: "+91-9876543212",
      pickupAddress: "789, Market Road, Delhi",
      pickupLat: 28.6439,
      pickupLng: 77.239,
      recipientName: "Bob Wilson",
      recipientPhone: "+91-9876543213",
      deliveryAddress: "321, College Street, Delhi",
      deliveryLat: 28.6039,
      deliveryLng: 77.199,
      packageType: "Electronics",
      weight: "2.5 kg",
      status: "pending",
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      trackingCode: "PKG-XYZ789",
    },
  ]);

  const [newParcel, setNewParcel] = useState({
    senderName: "",
    senderPhone: "",
    pickupAddress: "",
    recipientName: "",
    recipientPhone: "",
    deliveryAddress: "",
    packageType: "Document",
    weight: "",
  });

  // ── Handlers ────────────────────────────────────────────────────────────────
  const createParcel = () => {
    if (
      !newParcel.senderName ||
      !newParcel.pickupAddress ||
      !newParcel.recipientName ||
      !newParcel.deliveryAddress
    )
      return;

    const parcel: ParcelRequest = {
      id: `parcel-${Date.now()}`,
      ...newParcel,
      pickupLat: 28.6139,
      pickupLng: 77.209,
      deliveryLat: 28.6289,
      deliveryLng: 77.2195,
      status: "pending",
      createdAt: new Date(),
      trackingCode:
        "PKG-" +
        Math.random().toString(36).substring(2, 8).toUpperCase(),
    };

    setParcels((prev) => [parcel, ...prev]);
    setNewParcel({
      senderName: "",
      senderPhone: "",
      pickupAddress: "",
      recipientName: "",
      recipientPhone: "",
      deliveryAddress: "",
      packageType: "Document",
      weight: "",
    });
    setShowCreateForm(false);
  };

  const trackedParcel = searched
    ? parcels.find(
        (p) => p.trackingCode === searchCode.trim().toUpperCase()
      )
    : null;

  const inTransitCount = parcels.filter(
    (p) => p.status === "in_transit"
  ).length;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
        fontFamily: "Inter, sans-serif",
        color: "#f1f5f9",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          background: "rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "16px 20px",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 480,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {/* Left: back + title */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <BackToLogin />
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "rgba(59,130,246,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Package style={{ width: 20, height: 20, color: "#3b82f6" }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>
                Parcel Delivery
              </div>
              <div style={{ fontSize: 11, color: "#64748b" }}>
                Send & track packages
              </div>
            </div>
          </div>

          {/* Right: Send button */}
          <button
            onClick={() => setShowCreateForm((p) => !p)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              background: showCreateForm
                ? "rgba(239,68,68,0.15)"
                : "rgba(59,130,246,0.2)",
              border: `1px solid ${showCreateForm ? "rgba(239,68,68,0.3)" : "rgba(59,130,246,0.3)"}`,
              borderRadius: 10,
              color: showCreateForm ? "#ef4444" : "#3b82f6",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {showCreateForm ? (
              <>
                <X style={{ width: 14, height: 14 }} />
                Cancel
              </>
            ) : (
              <>
                <Plus style={{ width: 14, height: 14 }} />
                Send Parcel
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          width: "100%",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* ── Stats Row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            {
              label: "Total",
              value: parcels.length,
              color: "#3b82f6",
              bg: "rgba(59,130,246,0.1)",
            },
            {
              label: "In Transit",
              value: inTransitCount,
              color: "#f59e0b",
              bg: "rgba(245,158,11,0.1)",
            },
            {
              label: "Delivered",
              value: parcels.filter((p) => p.status === "delivered").length,
              color: "#22c55e",
              bg: "rgba(34,197,94,0.1)",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: stat.bg,
                border: `1px solid ${stat.color}30`,
                borderRadius: 12,
                padding: "12px",
                textAlign: "center",
              }}
            >
              <div
                style={{ fontSize: 22, fontWeight: 800, color: stat.color }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Track Bar ── */}
        <div
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 14,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#94a3b8",
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Track a Parcel
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div
              style={{
                flex: 1,
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Search
                style={{
                  position: "absolute",
                  left: 10,
                  width: 15,
                  height: 15,
                  color: "#64748b",
                }}
              />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => {
                  setSearchCode(e.target.value.toUpperCase());
                  setSearched(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && setSearched(true)}
                placeholder="e.g. PKG-ABC123"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10,
                  padding: "9px 12px 9px 32px",
                  color: "#f1f5f9",
                  fontSize: 13,
                  outline: "none",
                  fontFamily: "monospace",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <button
              onClick={() => setSearched(true)}
              style={{
                padding: "9px 16px",
                background: "#3b82f6",
                border: "none",
                borderRadius: 10,
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                flexShrink: 0,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Track
            </button>
          </div>

          {/* Search result */}
          <AnimatePresence>
            {searched && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: "hidden" }}
              >
                {trackedParcel ? (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "12px",
                      background: "rgba(34,197,94,0.08)",
                      border: "1px solid rgba(34,197,94,0.25)",
                      borderRadius: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#22c55e",
                            fontFamily: "monospace",
                            fontSize: 13,
                          }}
                        >
                          ✓ {trackedParcel.trackingCode}
                        </div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                          {trackedParcel.senderName} → {trackedParcel.recipientName}
                        </div>
                      </div>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 10,
                          fontWeight: 700,
                          background: STATUS_CONFIG[trackedParcel.status].bg,
                          color: STATUS_CONFIG[trackedParcel.status].color,
                          textTransform: "uppercase",
                        }}
                      >
                        {STATUS_CONFIG[trackedParcel.status].label}
                      </span>
                    </div>
                    <TrackingProgress status={trackedParcel.status} />
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "10px 12px",
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      borderRadius: 10,
                      fontSize: 13,
                      color: "#ef4444",
                      textAlign: "center",
                    }}
                  >
                    No parcel found for{" "}
                    <span style={{ fontFamily: "monospace", fontWeight: 700 }}>
                      {searchCode}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Create Form ── */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(59,130,246,0.25)",
                  borderRadius: 16,
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {/* Title */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    paddingBottom: 12,
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(59,130,246,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Plus style={{ width: 16, height: 16, color: "#3b82f6" }} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>
                    New Parcel Request
                  </span>
                </div>

                {/* Sender section */}
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#3b82f6",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 10,
                    }}
                  >
                    📦 Sender Details
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <FormInput
                      label="Name"
                      value={newParcel.senderName}
                      onChange={(v) =>
                        setNewParcel((p) => ({ ...p, senderName: v }))
                      }
                      placeholder="Your name"
                    />
                    <FormInput
                      label="Phone"
                      type="tel"
                      value={newParcel.senderPhone}
                      onChange={(v) =>
                        setNewParcel((p) => ({ ...p, senderPhone: v }))
                      }
                      placeholder="+91-XXXXXXXXXX"
                    />
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <FormInput
                      label="Pickup Address"
                      value={newParcel.pickupAddress}
                      onChange={(v) =>
                        setNewParcel((p) => ({ ...p, pickupAddress: v }))
                      }
                      placeholder="Full pickup address"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: "rgba(255,255,255,0.08)",
                    }}
                  />
                  <Truck
                    style={{ width: 16, height: 16, color: "#64748b" }}
                  />
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: "rgba(255,255,255,0.08)",
                    }}
                  />
                </div>

                {/* Recipient section */}
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#22c55e",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 10,
                    }}
                  >
                    📍 Recipient Details
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <FormInput
                      label="Name"
                      value={newParcel.recipientName}
                      onChange={(v) =>
                        setNewParcel((p) => ({ ...p, recipientName: v }))
                      }
                      placeholder="Recipient name"
                    />
                    <FormInput
                      label="Phone"
                      type="tel"
                      value={newParcel.recipientPhone}
                      onChange={(v) =>
                        setNewParcel((p) => ({ ...p, recipientPhone: v }))
                      }
                      placeholder="+91-XXXXXXXXXX"
                    />
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <FormInput
                      label="Delivery Address"
                      value={newParcel.deliveryAddress}
                      onChange={(v) =>
                        setNewParcel((p) => ({ ...p, deliveryAddress: v }))
                      }
                      placeholder="Full delivery address"
                    />
                  </div>
                </div>

                {/* Package details */}
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#f59e0b",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 10,
                    }}
                  >
                    🏷️ Package Details
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    {/* Type select */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        Type
                      </label>
                      <select
                        value={newParcel.packageType}
                        onChange={(e) =>
                          setNewParcel((p) => ({
                            ...p,
                            packageType: e.target.value,
                          }))
                        }
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 10,
                          padding: "10px 12px",
                          color: "#f1f5f9",
                          fontSize: 13,
                          outline: "none",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        <option value="Document" style={{ background: "#1e3a5f" }}>Document</option>
                        <option value="Electronics" style={{ background: "#1e3a5f" }}>Electronics</option>
                        <option value="Clothing" style={{ background: "#1e3a5f" }}>Clothing</option>
                        <option value="Food" style={{ background: "#1e3a5f" }}>Food</option>
                        <option value="Other" style={{ background: "#1e3a5f" }}>Other</option>
                      </select>
                    </div>

                    <FormInput
                      label="Weight (kg)"
                      value={newParcel.weight}
                      onChange={(v) =>
                        setNewParcel((p) => ({ ...p, weight: v }))
                      }
                      placeholder="e.g. 1.5"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={createParcel}
                  style={{
                    width: "100%",
                    padding: "13px",
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    border: "none",
                    borderRadius: 12,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontFamily: "Inter, sans-serif",
                    marginTop: 4,
                  }}
                >
                  <Package style={{ width: 16, height: 16 }} />
                  Confirm &amp; Send Parcel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Parcel List ── */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 14 }}>
              Your Parcels
            </span>
            <span
              style={{
                fontSize: 11,
                color: "#64748b",
                background: "rgba(255,255,255,0.06)",
                padding: "3px 10px",
                borderRadius: 20,
              }}
            >
              {parcels.length} total
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {parcels.map((parcel) => (
              <ParcelCard key={parcel.id} parcel={parcel} />
            ))}
          </div>
        </div>

        {/* ── Live Map ── */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: "16px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Truck style={{ width: 16, height: 16, color: "#3b82f6" }} />
              <span style={{ fontWeight: 700, fontSize: 14 }}>
                Live Tracking Map
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                color: "#22c55e",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#22c55e",
                  animation: "pulse 2s infinite",
                }}
              />
              {inTransitCount} active
            </div>
          </div>

          <div
            style={{
              height: 360,
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <LiveMap
              ambulances={ambulances.filter((a) => a.status === "en-route")}
              deliveryVehicles={[
                { id: "DEL-001", lat: 28.62, lng: 77.21, status: "In Transit" },
                { id: "DEL-002", lat: 28.605, lng: 77.215, status: "Delivered" },
                { id: "DEL-003", lat: 28.618, lng: 77.195, status: "In Transit" },
                { id: "DEL-004", lat: 28.608, lng: 77.225, status: "In Transit" },
                { id: "DEL-005", lat: 28.615, lng: 77.19, status: "Delivered" },
              ]}
              trafficSignals={[
                { id: "TS-001", lat: 28.6139, lng: 77.209, name: "Connaught Place", status: "Normal" },
                { id: "TS-002", lat: 28.6141, lng: 77.2092, name: "India Gate", status: "Busy" },
                { id: "TS-003", lat: 28.61, lng: 77.215, name: "Karol Bagh", status: "Congested" },
                { id: "TS-004", lat: 28.618, lng: 77.195, name: "Rajiv Chowk", status: "Normal" },
              ]}
              hospitals={[
                { id: "AIIMS", lat: 28.6069, lng: 77.209, name: "AIIMS Delhi", status: "Available" },
                { id: "SJDH", lat: 28.585, lng: 77.203, name: "Safdarjung Hospital", status: "Available" },
              ]}
              emergencies={[]}
              junctions={[]}
              userLocation={currentLocation}
              showUserLocation={true}
              center={[currentLocation.lat, currentLocation.lng]}
              zoom={12}
              showControls={true}
            />
          </div>
        </div>

        {/* Bottom spacing */}
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}