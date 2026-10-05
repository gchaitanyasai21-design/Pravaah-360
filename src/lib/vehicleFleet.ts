// src/lib/vehicleFleet.ts
// PRAVAH 360 - Emergency response fleet seed data
// 11 vehicles: ambulance, fire truck, NDRF boat, flood pump, rescue 4x4

import type { ResponseVehicle } from "@/types/vehicles";

/** Fleet-wide last sync timestamp factory keeps seed data serialisable. */
function synced(secondsAgo: number): Date {
  return new Date(Date.now() - secondsAgo * 1000);
}

export const responseVehicles: ResponseVehicle[] = [
  // ── Ambulances ────────────────────────────────────────────────
  {
    id: "V01",
    callsign: "AMB-01",
    type: "ambulance",
    driverId: "D01",
    driverName: "Suresh K.",
    driverPhone: "+91-9848011101",
    status: "available",
    lat: 16.5109,
    lng: 80.6395,
    capacity: 2,
    lastUpdated: synced(40),
  },
  {
    id: "V02",
    callsign: "AMB-02",
    type: "ambulance",
    driverId: "D02",
    driverName: "Lakshmi P.",
    driverPhone: "+91-9848011102",
    status: "en_route",
    lat: 16.5449,
    lng: 80.644,
    assignedIncidentId: "INC-2201",
    capacity: 2,
    lastUpdated: synced(25),
  },
  {
    id: "V03",
    callsign: "AMB-03",
    type: "ambulance",
    driverId: "D03",
    driverName: "Ravi T.",
    driverPhone: "+91-9848011103",
    status: "on_scene",
    lat: 16.5033,
    lng: 80.651,
    assignedIncidentId: "INC-2198",
    capacity: 2,
    lastUpdated: synced(60),
  },

  // ── Fire trucks ───────────────────────────────────────────────
  {
    id: "V04",
    callsign: "FIRE-01",
    type: "fire_truck",
    driverId: "D04",
    driverName: "Krishna M.",
    driverPhone: "+91-9848011104",
    status: "available",
    lat: 16.5089,
    lng: 80.6187,
    capacity: 6,
    lastUpdated: synced(90),
  },
  {
    id: "V05",
    callsign: "FIRE-02",
    type: "fire_truck",
    driverId: "D05",
    driverName: "Prasad V.",
    driverPhone: "+91-9848011105",
    status: "available",
    lat: 16.5411,
    lng: 80.6089,
    capacity: 6,
    lastUpdated: synced(120),
  },

  // ── NDRF rescue boats (flood module) ──────────────────────────
  {
    id: "V06",
    callsign: "NDRF-01",
    type: "ndrf_boat",
    driverId: "D06",
    driverName: "Ramesh K.",
    driverPhone: "+91-9848011106",
    status: "en_route",
    lat: 16.498,
    lng: 80.618,
    assignedIncidentId: "INC-2210",
    capacity: 12,
    lastUpdated: synced(15),
  },
  {
    id: "V07",
    callsign: "NDRF-02",
    type: "ndrf_boat",
    driverId: "D07",
    driverName: "Venkat R.",
    driverPhone: "+91-9848011107",
    status: "available",
    lat: 16.497,
    lng: 80.6085,
    capacity: 12,
    lastUpdated: synced(35),
  },

  // ── Flood pump trucks (flood module) ──────────────────────────
  {
    id: "V08",
    callsign: "PUMP-01",
    type: "pump_truck",
    driverId: "D08",
    driverName: "Mohan L.",
    driverPhone: "+91-9848011108",
    status: "on_scene",
    lat: 16.5089,
    lng: 80.6187,
    assignedIncidentId: "INC-2205",
    capacity: 500, // 500 L/min
    lastUpdated: synced(20),
  },
  {
    id: "V09",
    callsign: "PUMP-02",
    type: "pump_truck",
    driverId: "D09",
    driverName: "Srinivas P.",
    driverPhone: "+91-9848011109",
    status: "available",
    lat: 16.5155,
    lng: 80.67,
    capacity: 500, // 500 L/min
    lastUpdated: synced(75),
  },

  // ── Rescue 4x4 (flood module) ─────────────────────────────────
  {
    id: "V10",
    callsign: "4X4-01",
    type: "rescue_4x4",
    driverId: "D10",
    driverName: "Anil G.",
    driverPhone: "+91-9848011110",
    status: "en_route",
    lat: 16.5075,
    lng: 80.6422,
    assignedIncidentId: "INC-2212",
    capacity: 8,
    lastUpdated: synced(10),
  },
  {
    id: "V11",
    callsign: "4X4-02",
    type: "rescue_4x4",
    driverId: "D11",
    driverName: "Bhaskar S.",
    driverPhone: "+91-9848011111",
    status: "available",
    lat: 16.5244,
    lng: 80.6089,
    capacity: 8,
    lastUpdated: synced(110),
  },
];

/** Vehicles currently deployed (anything not parked / offline). */
export const deployedVehicles: ResponseVehicle[] = responseVehicles.filter(
  (vehicle) => vehicle.status === "en_route" || vehicle.status === "on_scene"
);

/** Counts per status used by the fleet overview strip. */
export function fleetSummary(vehicles: ResponseVehicle[] = responseVehicles) {
  return {
    total: vehicles.length,
    available: vehicles.filter((v) => v.status === "available").length,
    enRoute: vehicles.filter((v) => v.status === "en_route").length,
    onScene: vehicles.filter((v) => v.status === "on_scene").length,
    returning: vehicles.filter((v) => v.status === "returning").length,
    offline: vehicles.filter((v) => v.status === "offline").length,
  };
}

/** Look up a single vehicle by callsign or id. */
export function findVehicle(key: string): ResponseVehicle | undefined {
  const needle = key.toLowerCase();
  return responseVehicles.find(
    (vehicle) =>
      vehicle.id.toLowerCase() === needle || vehicle.callsign.toLowerCase() === needle
  );
}
