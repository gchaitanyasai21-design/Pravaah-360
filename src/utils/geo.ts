// PRAVAH + LifeLane - Geospatial Utilities
// Haversine formula, heading calculations, and geofencing

import type { GeoLocation, Route, Direction } from "@/types";

const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_M = 6371000;

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_M * c;
}

/**
 * Calculate bearing/heading between two points
 * @returns Heading in degrees (0-360)
 */
export function calculateHeading(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const deltaLng = ((lng2 - lng1) * Math.PI) / 180;

  const y = Math.sin(deltaLng) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLng);

  const bearingRad = Math.atan2(y, x);
  const bearingDeg = (bearingRad * 180) / Math.PI;

  // Normalize to 0-360
  return (bearingDeg + 360) % 360;
}

/**
 * Calculate destination point given start point, bearing, and distance
 * @returns Destination coordinates
 */
export function calculateDestination(
  lat: number,
  lng: number,
  bearing: number,
  distanceMeters: number
): GeoLocation {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const bearingRad = (bearing * Math.PI) / 180;
  const angularDistance = distanceMeters / EARTH_RADIUS_M;

  const destLatRad =
    Math.asin(
      Math.sin(latRad) * Math.cos(angularDistance) +
        Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearingRad)
    );

  const destLngRad =
    lngRad +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(latRad),
      Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(destLatRad)
    );

  return {
    lat: (destLatRad * 180) / Math.PI,
    lng: (destLngRad * 180) / Math.PI,
  };
}

/**
 * Check if a point is within a radius of another point
 * @returns True if point is within radius
 */
export function isWithinRadius(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  radiusMeters: number
): boolean {
  return calculateDistance(lat1, lng1, lat2, lng2) <= radiusMeters;
}

/**
 * Find the nearest point from a list of candidates
 * @returns Nearest candidate with distance
 */
export function findNearest<T extends { lat: number; lng: number }>(
  targetLat: number,
  targetLng: number,
  candidates: T[]
): { candidate: T; distance: number } | null {
  if (candidates.length === 0) return null;

  let nearest: T = candidates[0];
  let minDistance = calculateDistance(
    targetLat,
    targetLng,
    candidates[0].lat,
    candidates[0].lng
  );

  for (let i = 1; i < candidates.length; i++) {
    const distance = calculateDistance(
      targetLat,
      targetLng,
      candidates[i].lat,
      candidates[i].lng
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = candidates[i];
    }
  }

  return { candidate: nearest, distance: minDistance };
}

/**
 * Interpolate between two points
 * @returns Interpolated point at given ratio (0-1)
 */
export function interpolatePoint(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  ratio: number
): GeoLocation {
  const clampedRatio = Math.max(0, Math.min(1, ratio));

  return {
    lat: lat1 + (lat2 - lat1) * clampedRatio,
    lng: lng1 + (lng2 - lng1) * clampedRatio,
  };
}

/**
 * Calculate ETA based on distance and average speed
 * @returns ETA in seconds
 */
export function calculateETA(
  distanceMeters: number,
  speedKmph: number
): number {
  if (speedKmph <= 0) return Infinity;
  const speedMps = (speedKmph * 1000) / 3600;
  return distanceMeters / speedMps;
}

/**
 * Determine cardinal direction from heading
 */
export function headingToDirection(heading: number): Direction {
  if (heading >= 315 || heading < 45) return "north";
  if (heading >= 45 && heading < 135) return "east";
  if (heading >= 135 && heading < 225) return "south";
  if (heading >= 225 && heading < 315) return "west";
  return "north";
}

/**
 * Calculate the opposite direction
 */
export function oppositeDirection(direction: Direction): Direction {
  const opposites: Record<Direction, Direction> = {
    north: "south",
    south: "north",
    east: "west",
    west: "east",
  };
  return opposites[direction];
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Calculate bounding box for a given radius
 */
export function calculateBoundingBox(
  lat: number,
  lng: number,
  radiusMeters: number
): {
  north: number;
  south: number;
  east: number;
  west: number;
} {
  // Approximately 1 degree = 111km
  const latDelta = (radiusMeters / 1000 / 111) * (180 / Math.PI);
  const lngDelta =
    (radiusMeters / 1000 / 111) * (180 / Math.PI) / Math.cos((lat * Math.PI) / 180);

  return {
    north: lat + latDelta,
    south: lat - latDelta,
    east: lng + lngDelta,
    west: lng - lngDelta,
  };
}

/**
 * Check if a point is within a bounding box
 */
export function isWithinBoundingBox(
  lat: number,
  lng: number,
  bounds: { north: number; south: number; east: number; west: number }
): boolean {
  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  );
}

/**
 * Calculate the center point of multiple coordinates
 */
export function calculateCenterPoint(points: GeoLocation[]): GeoLocation {
  if (points.length === 0) {
    return { lat: 0, lng: 0 };
  }

  const sumLat = points.reduce((sum, p) => sum + p.lat, 0);
  const sumLng = points.reduce((sum, p) => sum + p.lng, 0);

  return {
    lat: sumLat / points.length,
    lng: sumLng / points.length,
  };
}

/**
 * Generate a simple route with waypoints
 */
export function generateRoute(
  start: GeoLocation,
  end: GeoLocation,
  waypoints: number = 5
): Route {
  const routePoints: GeoLocation[] = [start];

  for (let i = 1; i <= waypoints; i++) {
    const ratio = i / (waypoints + 1);
    routePoints.push(interpolatePoint(start.lat, start.lng, end.lat, end.lng, ratio));
  }

  routePoints.push(end);

  const totalDistance = calculateDistance(
    start.lat,
    start.lng,
    end.lat,
    end.lng
  );

  return {
    start,
    end,
    waypoints: routePoints.slice(1, -1),
    distance: totalDistance,
    duration: calculateETA(totalDistance, 40), // Assume 40 km/h average
    junctions: [],
  };
}

/**
 * Snap a coordinate to a road grid (simplified)
 */
export function snapToGrid(
  lat: number,
  lng: number,
  gridSize: number = 0.001
): GeoLocation {
  return {
    lat: Math.round(lat / gridSize) * gridSize,
    lng: Math.round(lng / gridSize) * gridSize,
  };
}

/**
 * Calculate speed from two positions and time difference
 * @returns Speed in km/h
 */
export function calculateSpeed(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  timeDiffSeconds: number
): number {
  if (timeDiffSeconds <= 0) return 0;

  const distanceMeters = calculateDistance(lat1, lng1, lat2, lng2);
  const speedMps = distanceMeters / timeDiffSeconds;
  return (speedMps * 3600) / 1000; // Convert to km/h
}
