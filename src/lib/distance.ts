// src/lib/distance.ts

/**
 * Calculate distance between two lat/lng points in meters
 * Uses Haversine formula
 */
export function getDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Determine the traffic signal state based on ambulance distance
 */
export type ProximityState = "RED" | "YELLOW" | "GREEN" | null;

export function getSignalStateByDistance(
  distanceMeters: number
): ProximityState {
  if (distanceMeters <= 250) return "GREEN";
  if (distanceMeters <= 500) return "YELLOW";
  if (distanceMeters <= 800) return "RED";
  return null; // outside emergency zone — normal cycle
}