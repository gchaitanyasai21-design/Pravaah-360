// src/lib/indiaCities.ts
// 🇮🇳 Pravaah 360 — India-wide city database
// Hospitals, signals & ambulances for major Indian cities

export interface CityHospital {
  id: string;
  name: string;
  lat: number;
  lng: number;
  beds: number;
  type: "Government" | "Private";
}

export interface CitySignal {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface IndianCity {
  name: string;
  state: string;
  lat: number;
  lng: number;
  hospitals: CityHospital[];
  signals: CitySignal[];
}

// ─── 8 Major Indian Cities ───────────────────────────────
export const INDIA_CITIES: IndianCity[] = [
  {
    name: "Vijayawada",
    state: "Andhra Pradesh",
    lat: 16.5062,
    lng: 80.6480,
    hospitals: [
      { id: "V1", name: "Aster Ramesh Hospital",       lat: 16.5109, lng: 80.6395, beds: 15, type: "Private" },
      { id: "V2", name: "Manipal Hospital Vijayawada", lat: 16.5449, lng: 80.6440, beds: 20, type: "Private" },
      { id: "V3", name: "Andhra Hospitals",            lat: 16.5033, lng: 80.6510, beds: 12, type: "Private" },
      { id: "V4", name: "Government General Hospital", lat: 16.5089, lng: 80.6187, beds: 30, type: "Government" },
      { id: "V5", name: "KIMS Hospital Vijayawada",    lat: 16.5151, lng: 80.6429, beds: 18, type: "Private" },
    ],
    signals: [
      { id: "VS1", name: "Benz Circle",          lat: 16.5062, lng: 80.6480 },
      { id: "VS2", name: "Kanaka Durga Flyover", lat: 16.5121, lng: 80.6339 },
      { id: "VS3", name: "MG Road Junction",     lat: 16.5033, lng: 80.6410 },
      { id: "VS4", name: "Ramavarappadu Ring",   lat: 16.5089, lng: 80.6520 },
      { id: "VS5", name: "Autonagar Signal",     lat: 16.4989, lng: 80.6431 },
    ],
  },
  {
    name: "Hyderabad",
    state: "Telangana",
    lat: 17.3850,
    lng: 78.4867,
    hospitals: [
      { id: "H1", name: "Apollo Hospital Jubilee Hills", lat: 17.4239, lng: 78.4738, beds: 40, type: "Private" },
      { id: "H2", name: "Care Hospital Banjara Hills",   lat: 17.4126, lng: 78.4460, beds: 25, type: "Private" },
      { id: "H3", name: "NIMS Hospital",                 lat: 17.4271, lng: 78.4497, beds: 50, type: "Government" },
      { id: "H4", name: "Yashoda Hospital Secunderabad", lat: 17.4399, lng: 78.4983, beds: 35, type: "Private" },
      { id: "H5", name: "AIG Hospital Gachibowli",       lat: 17.4230, lng: 78.3714, beds: 30, type: "Private" },
    ],
    signals: [
      { id: "HS1", name: "Ameerpet Signal",     lat: 17.4374, lng: 78.4487 },
      { id: "HS2", name: "Punjagutta Junction", lat: 17.4270, lng: 78.4508 },
      { id: "HS3", name: "Banjara Hills X-Rd",  lat: 17.4126, lng: 78.4460 },
      { id: "HS4", name: "Hitech City Signal",  lat: 17.4485, lng: 78.3908 },
      { id: "HS5", name: "Secunderabad Clock",  lat: 17.4399, lng: 78.4983 },
    ],
  },
  {
    name: "Bangalore",
    state: "Karnataka",
    lat: 12.9716,
    lng: 77.5946,
    hospitals: [
      { id: "B1", name: "Manipal Hospital Old Airport", lat: 12.9591, lng: 77.6489, beds: 45, type: "Private" },
      { id: "B2", name: "Apollo Hospital Bannerghatta", lat: 12.8996, lng: 77.5972, beds: 40, type: "Private" },
      { id: "B3", name: "Fortis Hospital Bannerghatta", lat: 12.8973, lng: 77.5978, beds: 35, type: "Private" },
      { id: "B4", name: "Victoria Hospital",            lat: 12.9611, lng: 77.5713, beds: 60, type: "Government" },
      { id: "B5", name: "Narayana Health City",         lat: 12.8078, lng: 77.6803, beds: 50, type: "Private" },
    ],
    signals: [
      { id: "BS1", name: "Silk Board Junction", lat: 12.9174, lng: 77.6229 },
      { id: "BS2", name: "Hebbal Flyover",      lat: 13.0358, lng: 77.5970 },
      { id: "BS3", name: "MG Road Signal",      lat: 12.9750, lng: 77.6068 },
      { id: "BS4", name: "Electronic City",     lat: 12.8452, lng: 77.6602 },
      { id: "BS5", name: "Marathahalli Bridge", lat: 12.9591, lng: 77.6974 },
    ],
  },
  {
    name: "Chennai",
    state: "Tamil Nadu",
    lat: 13.0827,
    lng: 80.2707,
    hospitals: [
      { id: "C1", name: "Apollo Hospital Greams Road",    lat: 13.0631, lng: 80.2523, beds: 45, type: "Private" },
      { id: "C2", name: "MIOT International",             lat: 13.0159, lng: 80.1993, beds: 40, type: "Private" },
      { id: "C3", name: "Government General Hospital",    lat: 13.0781, lng: 80.2745, beds: 55, type: "Government" },
      { id: "C4", name: "Fortis Malar Hospital",          lat: 13.0067, lng: 80.2564, beds: 30, type: "Private" },
      { id: "C5", name: "Sri Ramachandra Medical Centre", lat: 13.0374, lng: 80.1425, beds: 50, type: "Private" },
    ],
    signals: [
      { id: "CS1", name: "Kathipara Junction", lat: 13.0090, lng: 80.2015 },
      { id: "CS2", name: "Anna Salai Signal",  lat: 13.0631, lng: 80.2523 },
      { id: "CS3", name: "Adyar Signal",       lat: 13.0067, lng: 80.2564 },
      { id: "CS4", name: "T. Nagar Junction",  lat: 13.0416, lng: 80.2340 },
      { id: "CS5", name: "Guindy Signal",      lat: 13.0067, lng: 80.2206 },
    ],
  },
  {
    name: "Mumbai",
    state: "Maharashtra",
    lat: 19.0760,
    lng: 72.8777,
    hospitals: [
      { id: "M1", name: "Lilavati Hospital Bandra",     lat: 19.0509, lng: 72.8296, beds: 45, type: "Private" },
      { id: "M2", name: "KEM Hospital Parel",           lat: 19.0032, lng: 72.8420, beds: 60, type: "Government" },
      { id: "M3", name: "Kokilaben Dhirubhai Hospital", lat: 19.1305, lng: 72.8267, beds: 40, type: "Private" },
      { id: "M4", name: "Fortis Hospital Mulund",       lat: 19.1737, lng: 72.9563, beds: 35, type: "Private" },
      { id: "M5", name: "Tata Memorial Hospital",       lat: 19.0057, lng: 72.8430, beds: 50, type: "Government" },
    ],
    signals: [
      { id: "MS1", name: "Bandra Kurla Signal", lat: 19.0596, lng: 72.8656 },
      { id: "MS2", name: "Dadar TT Signal",     lat: 19.0176, lng: 72.8480 },
      { id: "MS3", name: "Andheri Junction",    lat: 19.1197, lng: 72.8464 },
      { id: "MS4", name: "Sion Junction",       lat: 19.0430, lng: 72.8619 },
      { id: "MS5", name: "Worli Sea Link",      lat: 19.0248, lng: 72.8180 },
    ],
  },
  {
    name: "Delhi",
    state: "Delhi",
    lat: 28.6139,
    lng: 77.2090,
    hospitals: [
      { id: "D1", name: "AIIMS Delhi",                    lat: 28.5672, lng: 77.2100, beds: 80, type: "Government" },
      { id: "D2", name: "Apollo Hospital Sarita Vihar",   lat: 28.5384, lng: 77.2905, beds: 50, type: "Private" },
      { id: "D3", name: "Fortis Escorts Heart Institute", lat: 28.5567, lng: 77.2593, beds: 40, type: "Private" },
      { id: "D4", name: "Safdarjung Hospital",            lat: 28.5688, lng: 77.2069, beds: 70, type: "Government" },
      { id: "D5", name: "Max Super Speciality Saket",     lat: 28.5273, lng: 77.2159, beds: 45, type: "Private" },
    ],
    signals: [
      { id: "DS1", name: "Connaught Place", lat: 28.6304, lng: 77.2177 },
      { id: "DS2", name: "AIIMS Signal",    lat: 28.5672, lng: 77.2100 },
      { id: "DS3", name: "Dhaula Kuan",     lat: 28.5921, lng: 77.1608 },
      { id: "DS4", name: "ITO Junction",    lat: 28.6280, lng: 77.2410 },
      { id: "DS5", name: "Nehru Place",     lat: 28.5494, lng: 77.2506 },
    ],
  },
  {
    name: "Kolkata",
    state: "West Bengal",
    lat: 22.5726,
    lng: 88.3639,
    hospitals: [
      { id: "K1", name: "SSKM Hospital",              lat: 22.5390, lng: 88.3428, beds: 60, type: "Government" },
      { id: "K2", name: "Apollo Gleneagles Hospital", lat: 22.5850, lng: 88.4064, beds: 45, type: "Private" },
      { id: "K3", name: "Fortis Hospital Anandapur",  lat: 22.5075, lng: 88.4009, beds: 40, type: "Private" },
      { id: "K4", name: "AMRI Hospital Dhakuria",     lat: 22.5089, lng: 88.3661, beds: 35, type: "Private" },
      { id: "K5", name: "NRS Medical College",        lat: 22.5626, lng: 88.3739, beds: 55, type: "Government" },
    ],
    signals: [
      { id: "KS1", name: "Park Street Signal",   lat: 22.5527, lng: 88.3520 },
      { id: "KS2", name: "Esplanade Junction",   lat: 22.5648, lng: 88.3510 },
      { id: "KS3", name: "Gariahat Crossing",    lat: 22.5178, lng: 88.3646 },
      { id: "KS4", name: "Ruby Hospital Signal", lat: 22.5150, lng: 88.4004 },
      { id: "KS5", name: "Ultadanga Junction",   lat: 22.5959, lng: 88.3960 },
    ],
  },
  {
    name: "Pune",
    state: "Maharashtra",
    lat: 18.5204,
    lng: 73.8567,
    hospitals: [
      { id: "P1", name: "Ruby Hall Clinic",         lat: 18.5305, lng: 73.8811, beds: 40, type: "Private" },
      { id: "P2", name: "Jehangir Hospital",        lat: 18.5320, lng: 73.8778, beds: 35, type: "Private" },
      { id: "P3", name: "Sassoon General Hospital", lat: 18.5309, lng: 73.8756, beds: 55, type: "Government" },
      { id: "P4", name: "Deenanath Mangeshkar",     lat: 18.5074, lng: 73.8286, beds: 45, type: "Private" },
      { id: "P5", name: "Aditya Birla Hospital",    lat: 18.6298, lng: 73.7997, beds: 30, type: "Private" },
    ],
    signals: [
      { id: "PS1", name: "Shivajinagar Signal",  lat: 18.5308, lng: 73.8471 },
      { id: "PS2", name: "Deccan Junction",      lat: 18.5157, lng: 73.8419 },
      { id: "PS3", name: "Swargate Signal",      lat: 18.5010, lng: 73.8580 },
      { id: "PS4", name: "Hinjewadi Chowk",      lat: 18.5912, lng: 73.7389 },
      { id: "PS5", name: "Kalyani Nagar Bridge", lat: 18.5486, lng: 73.9037 },
    ],
  },
];

// ✅ Default city = Vijayawada (home base)
export const DEFAULT_CITY: IndianCity = INDIA_CITIES[0];

// ─── Haversine distance (meters) ─────────────────────────
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ✅ Find nearest city to any GPS coordinate
export function findNearestCity(lat: number, lng: number): IndianCity {
  let nearest = DEFAULT_CITY;
  let minDist = Infinity;
  INDIA_CITIES.forEach((city) => {
    const dist = haversine(lat, lng, city.lat, city.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = city;
    }
  });
  return nearest;
}

// ✅ Hospitals with live distance/time from user, sorted nearest first
export function getHospitalsWithDistance(
  city: IndianCity,
  userLat: number,
  userLng: number
) {
  return city.hospitals
    .map((h) => {
      const distMeters = haversine(userLat, userLng, h.lat, h.lng);
      const distKm = distMeters / 1000;
      const timeMin = Math.max(3, Math.round(distKm * 3.5));
      return {
        ...h,
        distance: `${distKm.toFixed(1)} km`,
        time: `${timeMin} min`,
        status: "Available",
      };
    })
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
}

// ✅ One ambulance stationed at each hospital
export function getAmbulancesForCity(city: IndianCity) {
  return city.hospitals.map((h, i) => ({
    id: `AMB-${city.name.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, "0")}`,
    lat: h.lat,
    lng: h.lng,
    status: "Available",
    hospital: h.name,
  }));
}

// ✅ City signals in SignalState format (idle state)
export function getSignalsForCity(city: IndianCity) {
  return city.signals.map((s) => ({
    id: s.id,
    lat: s.lat,
    lng: s.lng,
    name: s.name,
    color: "red" as const,
    crossed: false,
  }));
}