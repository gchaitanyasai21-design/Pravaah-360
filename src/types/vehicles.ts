// src/types/vehicles.ts
// PRAVAH 360 - Emergency Response Vehicle types
// Ambulance / Fire / NDRF boat / Flood pump / Rescue 4x4 fleet

/** Every emergency response vehicle the Service Provider portal can manage. */
export type VehicleType =
  | "ambulance"
  | "fire_truck"
  | "ndrf_boat"
  | "pump_truck"
  | "rescue_4x4";

/** Lifecycle state of a deployed response vehicle. */
export type VehicleStatus =
  | "available"
  | "en_route"
  | "on_scene"
  | "returning"
  | "offline";

/** A single response vehicle with its operator and live position. */
export interface ResponseVehicle {
  id: string;
  /** Radio callsign, e.g. "NDRF-01", "AMB-12". */
  callsign: string;
  type: VehicleType;
  driverId: string;
  driverName: string;
  driverPhone: string;
  status: VehicleStatus;
  lat: number;
  lng: number;
  assignedIncidentId?: string;
  /** Beds / passengers / pump flow rate, depending on vehicle type. */
  capacity?: number;
  lastUpdated: Date;
}

/** UI metadata used to render a vehicle consistently across the app. */
export interface VehicleTypeMeta {
  label: string;
  emoji: string;
  gradient: string;
  /** Short unit description, e.g. "NDRF Rescue Boat". */
  unit: string;
}

export const VEHICLE_TYPE_META: Record<VehicleType, VehicleTypeMeta> = {
  ambulance: {
    label: "Ambulance",
    emoji: "🚑",
    gradient: "from-red-500 to-orange-500",
    unit: "Advanced Life Support",
  },
  fire_truck: {
    label: "Fire Truck",
    emoji: "🚒",
    gradient: "from-orange-500 to-red-600",
    unit: "Fire & Rescue Tender",
  },
  ndrf_boat: {
    label: "NDRF Rescue Boat",
    emoji: "⛵",
    gradient: "from-cyan-500 to-blue-600",
    unit: "Flood Rescue Boat",
  },
  pump_truck: {
    label: "Flood Pump Truck",
    emoji: "💧",
    gradient: "from-blue-500 to-indigo-500",
    unit: "Dewatering Unit",
  },
  rescue_4x4: {
    label: "Rescue 4x4",
    emoji: "🚐",
    gradient: "from-amber-500 to-orange-500",
    unit: "Rapid Response 4x4",
  },
};

export const VEHICLE_STATUS_META: Record<
  VehicleStatus,
  { label: string; dotClass: string; textClass: string }
> = {
  available: {
    label: "AVAILABLE",
    dotClass: "bg-emerald-400",
    textClass: "text-emerald-400",
  },
  en_route: {
    label: "EN ROUTE",
    dotClass: "bg-amber-400",
    textClass: "text-amber-400",
  },
  on_scene: {
    label: "ON SCENE",
    dotClass: "bg-red-400",
    textClass: "text-red-400",
  },
  returning: {
    label: "RETURNING",
    dotClass: "bg-sky-400",
    textClass: "text-sky-400",
  },
  offline: {
    label: "OFFLINE",
    dotClass: "bg-slate-500",
    textClass: "text-slate-500",
  },
};

/** A completed mission in the driver's shift log. */
export interface MissionRecord {
  id: string;
  time: string;
  location: string;
  type: VehicleType | "medical";
  status: "completed" | "active" | "cancelled";
}

/** An incoming dispatch offer shown in the assignment panel. */
export interface DispatchAssignment {
  id: string;
  incidentType: string;
  incidentIcon: string;
  location: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  etaMinutes: number;
  contact: string;
  distanceKm: number;
}
