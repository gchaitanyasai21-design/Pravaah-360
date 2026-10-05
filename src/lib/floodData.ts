// src/lib/floodData.ts
// PRAVAH 360 - Urban Flood seed data for Vijayawada, Andhra Pradesh
// Flood zones, relief shelters, rain gauges, live alerts and the 0-3 hr nowcast

import type {
  FloodAlert,
  FloodZone,
  NowcastPoint,
  RainSensor,
  Shelter,
} from "@/types/flood";

export const VIJAYAWADA_CENTER: { lat: number; lng: number } = {
  lat: 16.5062,
  lng: 80.648,
};

export const FLOOD_HELPLINE = "1077";
export const NDRF_VIJAYAWADA = "0866-2577530";

/** Monitored inundation zones (Budameru / Krishna belt). */
export const floodZones: FloodZone[] = [
  {
    id: "FZ1",
    name: "MG Road Underpass",
    lat: 16.5089,
    lng: 80.6187,
    severity: "HIGH",
    depth: 0.8,
    radius: 420,
  },
  {
    id: "FZ2",
    name: "Benz Circle Area",
    lat: 16.5075,
    lng: 80.6422,
    severity: "MED",
    depth: 0.3,
    radius: 380,
  },
  {
    id: "FZ3",
    name: "Krishna Canal Bund",
    lat: 16.498,
    lng: 80.618,
    severity: "HIGH",
    depth: 0.9,
    radius: 500,
  },
  {
    id: "FZ4",
    name: "Prakasam Barrage Road",
    lat: 16.497,
    lng: 80.6085,
    severity: "HIGH",
    depth: 1.1,
    radius: 540,
  },
  {
    id: "FZ5",
    name: "Patamata Low-Land",
    lat: 16.5155,
    lng: 80.67,
    severity: "MED",
    depth: 0.4,
    radius: 400,
  },
  {
    id: "FZ6",
    name: "Bhavanipuram",
    lat: 16.5244,
    lng: 80.6089,
    severity: "MED",
    depth: 0.3,
    radius: 360,
  },
  {
    id: "FZ7",
    name: "Payakapuram",
    lat: 16.533,
    lng: 80.6412,
    severity: "LOW",
    depth: 0.1,
    radius: 300,
  },
];

/** Designated relief shelters with bed capacity. */
export const shelters: Shelter[] = [
  {
    id: "S1",
    name: "Govt. High School, Governorpet",
    lat: 16.51,
    lng: 80.6333,
    beds: 240,
  },
  { id: "S2", name: "Municipal Community Hall", lat: 16.518, lng: 80.652, beds: 500 },
  { id: "S3", name: "CSI Church Complex", lat: 16.505, lng: 80.64, beds: 150 },
  {
    id: "S4",
    name: "SRR Government Degree College",
    lat: 16.525,
    lng: 80.615,
    beds: 400,
  },
  {
    id: "S5",
    name: "Siddhartha Engineering College",
    lat: 16.541,
    lng: 80.608,
    beds: 800,
  },
];

/** Automatic rain gauges reporting mm/hour. */
export const rainSensors: RainSensor[] = [
  { id: "R1", name: "Benz Circle", lat: 16.5075, lng: 80.6422, rainfall: 42 },
  { id: "R2", name: "Autonagar", lat: 16.53, lng: 80.655, rainfall: 38 },
  { id: "R3", name: "Patamata", lat: 16.5155, lng: 80.67, rainfall: 51 },
  { id: "R4", name: "Governorpet", lat: 16.51, lng: 80.6333, rainfall: 29 },
];

/** Live flood alerts shown in the alerts panel. */
export const floodAlerts: FloodAlert[] = [
  {
    id: "FA1",
    zoneId: "FZ1",
    title: "MG Road Underpass",
    message: "Water level 0.8m and rising. Underpass closed to all traffic.",
    severity: "HIGH",
    depth: 0.8,
    updatedAt: "4 min ago",
  },
  {
    id: "FA2",
    zoneId: "FZ2",
    title: "Benz Circle",
    message: "0.3m waterlogging. Traffic crawling, two-wheelers diverted.",
    severity: "MED",
    depth: 0.3,
    updatedAt: "9 min ago",
  },
  {
    id: "FA3",
    zoneId: "FZ3",
    title: "Krishna Canal Bund",
    message: "Bund level rising 4cm/hr. NDRF boats placed on standby.",
    severity: "MED",
    updatedAt: "12 min ago",
  },
  {
    id: "FA4",
    zoneId: "FZ4",
    title: "Prakasam Barrage Road",
    message: "HIGH: 1.1m inundation. Barrage gates opened, avoid the corridor.",
    severity: "HIGH",
    depth: 1.1,
    updatedAt: "2 min ago",
  },
  {
    id: "FA5",
    zoneId: "FZ5",
    title: "Patamata Low-Land",
    message: "0.4m standing water. Evacuation advisory for ground-floor homes.",
    severity: "MED",
    depth: 0.4,
    updatedAt: "18 min ago",
  },
  {
    id: "FA6",
    zoneId: "FZ6",
    title: "Bhavanipuram",
    message: "0.3m waterlogging near the Budameru channel outfall.",
    severity: "MED",
    depth: 0.3,
    updatedAt: "22 min ago",
  },
  {
    id: "FA7",
    zoneId: "FZ7",
    title: "Payakapuram",
    message: "Low-lying lanes reporting 0.1m. Watch status, no evacuation.",
    severity: "LOW",
    depth: 0.1,
    updatedAt: "31 min ago",
  },
];

/** Headline numbers for the live stats strip. */
export const FLOOD_STATS = {
  activeAlerts: 7,
  rainfallMm: 42,
  floodedRoads: 12,
  peopleAtRisk: 3200,
};

/**
 * Deterministic 0-3 hour rainfall nowcast (180 samples, one per minute).
 * Peaks around minute 74 and eases off towards the 3 hour mark so the
 * SVG chart always renders the exact same curve.
 */
export function generateNowcast(): NowcastPoint[] {
  const points: NowcastPoint[] = [];
  for (let minute = 0; minute <= 180; minute += 1) {
    const primary = 34 * Math.exp(-Math.pow(minute - 74, 2) / (2 * 34 * 34));
    const secondary = 12 * Math.exp(-Math.pow(minute - 150, 2) / (2 * 26 * 26));
    const drift = 3.5 * Math.sin(minute / 11);
    const rainfall = Math.max(0, Number((26 + primary + secondary + drift).toFixed(1)));
    const risk = Math.min(100, Math.round(rainfall * 1.6));
    points.push({ minute, rainfall, risk });
  }
  return points;
}

/** Simulated current location used when the browser geolocation is denied. */
export const FALLBACK_LOCATION = { lat: 16.5062, lng: 80.648 };
