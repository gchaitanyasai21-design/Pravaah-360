// src/types/flood.ts
// PRAVAH 360 - Urban Flood Intelligence type definitions
// Vijayawada, Andhra Pradesh (16.5062 N, 80.6480 E)

/** Severity of a flood zone / alert. HIGH = impassable, MED = risky, LOW = watch. */
export type FloodSeverity = "HIGH" | "MED" | "LOW";

/** Forecast horizon selector on the flood dashboard map. */
export type ForecastHour = "now" | "1hr" | "3hr";

/** A monitored inundation zone with live depth reading. */
export interface FloodZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  severity: FloodSeverity;
  /** Water depth in metres. */
  depth: number;
  /** Radius of the affected area in metres (used for map polygons). */
  radius: number;
  /** True when the zone sits on an elevated bundle / ridge (used by routing). */
  elevated?: boolean;
}

/** A designated relief shelter with bed capacity. */
export interface Shelter {
  id: string;
  name: string;
  lat: number;
  lng: number;
  beds: number;
}

/** An automatic rain gauge reporting mm/hour. */
export interface RainSensor {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** Rainfall intensity in mm/hour. */
  rainfall: number;
}

/** A live flood alert shown in the alerts panel. */
export interface FloodAlert {
  id: string;
  zoneId: string;
  title: string;
  message: string;
  severity: FloodSeverity;
  /** Water depth in metres (optional for alerts without a gauge). */
  depth?: number;
  /** Short human readable time label, e.g. "4 min ago". */
  updatedAt: string;
}

/** One sample of the 0-3 hour rainfall nowcast (180 samples, 1 per minute). */
export interface NowcastPoint {
  /** Minutes from now, 0..180. */
  minute: number;
  /** Predicted rainfall intensity in mm/hour. */
  rainfall: number;
  /** Computed inundation risk index 0..100. */
  risk: number;
}

/** User toggles for flood-safe routing. */
export interface RoutingOptions {
  /** Route around currently flooded roads. */
  avoidFlooded: boolean;
  /** Prefer elevated bunds / ridges when a detour is needed. */
  preferElevated: boolean;
  /** Start point of the route. */
  origin: LatLng;
  /** Destination of the route. */
  destination: LatLng;
}

/** Plain latitude / longitude pair. */
export interface LatLng {
  lat: number;
  lng: number;
}

/** A computed flood-safe route returned by the routing engine. */
export interface SafeRoute {
  /** Ordered polyline of the route. */
  points: LatLng[];
  /** Total route length in kilometres. */
  distanceKm: number;
  /** Estimated travel time in minutes (urban emergency speed). */
  etaMinutes: number;
  /** Flood zones this route successfully detoured around. */
  avoidedZoneIds: string[];
  /** Human readable summary for the UI. */
  summary: string;
}

/** Live status of the flood dashboard headline stats. */
export interface FloodStats {
  activeAlerts: number;
  rainfallMm: number;
  floodedRoads: number;
  peopleAtRisk: number;
}
