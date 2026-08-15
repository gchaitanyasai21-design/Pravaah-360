// src/lib/routing.ts

export type LatLng = { lat: number; lng: number };

const OSRM_BASE_URL = "https://router.project-osrm.org/route/v1/driving";
const OSRM_TIMEOUT_MS = 5000;

/**
 * Interpolates a straight line between two points into `steps` points.
 * Used as a fallback when OSRM is unreachable, times out, or returns
 * no usable route — the app must never break/hang on a bad network.
 */
function straightLineRoute(
  start: LatLng,
  end: LatLng,
  steps: number = 100
): [number, number][] {
  const points: [number, number][] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = start.lat + (end.lat - start.lat) * t;
    const lng = start.lng + (end.lng - start.lng) * t;
    points.push([lat, lng]);
  }

  return points;
}

/**
 * Fetches a real road route between two points via the public OSRM
 * demo server. Returns an array of [lat, lng] pairs (OSRM's GeoJSON
 * coords are [lng, lat] — we flip them here so callers never have to
 * think about it).
 *
 * On ANY failure — network error, non-OK response, empty/malformed
 * coordinates, or a timeout past OSRM_TIMEOUT_MS — this resolves to
 * straightLineRoute() instead of throwing, so SOS flows never hang
 * or crash waiting on a flaky connection.
 */
export async function getRoadRoute(
  start: LatLng,
  end: LatLng
): Promise<[number, number][]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OSRM_TIMEOUT_MS);

  try {
    const url = `${OSRM_BASE_URL}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[routing] OSRM returned ${res.status}, using fallback route`);
      return straightLineRoute(start, end);
    }

    const data = await res.json();

    const coords: [number, number][] | undefined =
      data?.routes?.[0]?.geometry?.coordinates;

    if (!coords || coords.length === 0) {
      console.warn("[routing] OSRM returned no coordinates, using fallback route");
      return straightLineRoute(start, end);
    }

    // OSRM gives [lng, lat] — flip to [lat, lng] for Leaflet.
    const flipped: [number, number][] = coords.map(
      ([lng, lat]) => [lat, lng] as [number, number]
    );

    return flipped;
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof Error && err.name === "AbortError") {
      console.warn("[routing] OSRM request timed out, using fallback route");
    } else {
      console.warn("[routing] OSRM request failed, using fallback route:", err);
    }

    return straightLineRoute(start, end);
  }
}