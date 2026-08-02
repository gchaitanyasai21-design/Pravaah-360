"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface LatLng {
  lat: number;
  lng: number;
}

export type LocationStatus = "detecting" | "active" | "denied" | "unsupported";

export interface LiveLocationState {
  location: LatLng;
  accuracy: number;
  locationStatus: LocationStatus;
  lastUpdate: Date;
}

export interface Hospital {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "Government" | "Private";
  availableBeds: number;
  rating: number;
  status?: string;
}

export const VIJAYAWADA: LatLng = { lat: 16.5062, lng: 80.648 };

export const VIJAYAWADA_HOSPITALS: Hospital[] = [
  { id: "HSP-01", name: "Aster Ramesh Hospital", lat: 16.5109, lng: 80.6395, type: "Private", availableBeds: 42, rating: 4.7, status: "Available" },
  { id: "HSP-02", name: "Manipal Hospital Vijayawada", lat: 16.5449, lng: 80.644, type: "Private", availableBeds: 36, rating: 4.6, status: "Available" },
  { id: "HSP-03", name: "Andhra Hospitals", lat: 16.5033, lng: 80.651, type: "Private", availableBeds: 28, rating: 4.5, status: "Available" },
  { id: "HSP-04", name: "Government General Hospital", lat: 16.5089, lng: 80.6187, type: "Government", availableBeds: 58, rating: 4.1, status: "Busy" },
  { id: "HSP-05", name: "Nagarjuna Hospital", lat: 16.4856, lng: 80.6917, type: "Private", availableBeds: 24, rating: 4.3, status: "Available" },
  { id: "HSP-06", name: "Rainbow Children's Hospital", lat: 16.5017, lng: 80.6557, type: "Private", availableBeds: 19, rating: 4.6, status: "Available" },
  { id: "HSP-07", name: "KIMS Hospital Vijayawada", lat: 16.5151, lng: 80.6429, type: "Private", availableBeds: 31, rating: 4.4, status: "Available" },
  { id: "HSP-08", name: "LV Prasad Eye Institute", lat: 16.4898, lng: 80.6652, type: "Private", availableBeds: 17, rating: 4.8, status: "Available" },
  { id: "HSP-09", name: "Capital Hospitals", lat: 16.5085, lng: 80.7004, type: "Private", availableBeds: 22, rating: 4.2, status: "Available" },
  { id: "HSP-10", name: "Kamineni Hospital", lat: 16.493, lng: 80.671, type: "Private", availableBeds: 27, rating: 4.3, status: "Available" },
  { id: "HSP-11", name: "Sentini Hospitals", lat: 16.5175, lng: 80.6318, type: "Private", availableBeds: 26, rating: 4.4, status: "Available" },
  { id: "HSP-12", name: "NRI Medical College", lat: 16.4429, lng: 80.622, type: "Private", availableBeds: 44, rating: 4.0, status: "Available" },
  { id: "HSP-13", name: "Ramesh Hospitals", lat: 16.5109, lng: 80.6395, type: "Private", availableBeds: 33, rating: 4.5, status: "Available" },
  { id: "HSP-14", name: "Lalitha Super Speciality", lat: 16.5266, lng: 80.6199, type: "Private", availableBeds: 21, rating: 4.2, status: "Available" },
  { id: "HSP-15", name: "Vijaya Super Specialty", lat: 16.4972, lng: 80.6467, type: "Private", availableBeds: 25, rating: 4.3, status: "Available" },
];

export const VIJAYAWADA_SIGNALS = [
  { id: "TS-001", name: "Benz Circle", lat: 16.5062, lng: 80.648, status: "RED" },
  { id: "TS-002", name: "Kanaka Durga Flyover", lat: 16.5121, lng: 80.6339, status: "YELLOW" },
  { id: "TS-003", name: "MG Road Junction", lat: 16.5033, lng: 80.641, status: "GREEN" },
  { id: "TS-004", name: "Ramavarappadu Ring", lat: 16.5089, lng: 80.652, status: "RED" },
  { id: "TS-005", name: "Autonagar Signal", lat: 16.4989, lng: 80.6431, status: "YELLOW" },
  { id: "TS-006", name: "Governorpet", lat: 16.518, lng: 80.635, status: "GREEN" },
  { id: "TS-007", name: "One Town", lat: 16.508, lng: 80.63, status: "RED" },
  { id: "TS-008", name: "Patamata", lat: 16.522, lng: 80.628, status: "GREEN" },
];

export function useLiveLocation(storageKey?: string): LiveLocationState {
  const [location, setLocation] = useState<LatLng>(VIJAYAWADA);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("detecting");
  const [accuracy, setAccuracy] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const lastWriteRef = useRef(0);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      return;
    }

    setLocationStatus("detecting");
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        if (now - lastWriteRef.current < 2000) return;
        lastWriteRef.current = now;
        const nextLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
        setLocation(nextLocation);
        setAccuracy(Math.round(position.coords.accuracy));
        setLocationStatus("active");
        setLastUpdate(new Date());
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify({ ...nextLocation, accuracy: Math.round(position.coords.accuracy), timestamp: now }));
        }
      },
      (error) => {
        console.error("Location error:", error);
        setLocationStatus("denied");
        setLocation(VIJAYAWADA);
        setLastUpdate(new Date());
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [storageKey]);

  return { location, accuracy, locationStatus, lastUpdate };
}

export function useSecondsAgo(date: Date) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return useMemo(() => {
    void tick;
    return Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  }, [date, tick]);
}

export function distanceKm(a: LatLng, b: LatLng) {
  const earthRadius = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return earthRadius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function animatePosition(
  fromPos: LatLng,
  toPos: LatLng,
  duration = 5000,
  onUpdate: (pos: LatLng) => void,
  onComplete?: () => void
) {
  const steps = 50;
  const interval = duration / steps;
  let step = 0;

  const timer = window.setInterval(() => {
    step += 1;
    const progress = step / steps;
    onUpdate({
      lat: fromPos.lat + (toPos.lat - fromPos.lat) * progress,
      lng: fromPos.lng + (toPos.lng - fromPos.lng) * progress,
    });
    if (step >= steps) {
      window.clearInterval(timer);
      onComplete?.();
    }
  }, interval);

  return () => window.clearInterval(timer);
}

export function readStoredLocation(key: string, fallback: LatLng = VIJAYAWADA): LatLng {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as LatLng;
    return typeof parsed.lat === "number" && typeof parsed.lng === "number" ? parsed : fallback;
  } catch {
    return fallback;
  }
}
