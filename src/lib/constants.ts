// src/lib/constants.ts

// ✅ Default Location - Vijayawada
export const DEFAULT_LOCATION = {
  lat: 16.5062,
  lng: 80.6480,
  city: "Vijayawada",
  state: "Andhra Pradesh",
  pincode: "520013",
};

// ✅ Map Center for all pages
export const MAP_CENTER: [number, number] = [
  DEFAULT_LOCATION.lat,
  DEFAULT_LOCATION.lng,
];

// ✅ Default Zoom Level
export const MAP_ZOOM = 13;