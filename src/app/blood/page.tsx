// src/app/blood/page.tsx
// PRAVAH 360 - Blood Network route (/blood)
// Donor matching for Vijayawada hospitals

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Droplets,
  Droplet,
  Hospital,
  Phone,
  Search,
  UserCheck,
} from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";

interface Donor {
  id: string;
  name: string;
  group: string;
  distanceKm: number;
  lastDonation: string;
  available: boolean;
}

interface BloodStock {
  group: string;
  units: number;
}

const STOCK: BloodStock[] = [
  { group: "A+", units: 64 },
  { group: "A-", units: 18 },
  { group: "B+", units: 72 },
  { group: "B-", units: 12 },
  { group: "AB+", units: 34 },
  { group: "AB-", units: 9 },
  { group: "O+", units: 88 },
  { group: "O-", units: 21 },
];

const DONORS: Donor[] = [
  { id: "D1", name: "Arjun Rao", group: "O+", distanceKm: 1.2, lastDonation: "3 months ago", available: true },
  { id: "D2", name: "Sneha Reddy", group: "A+", distanceKm: 1.8, lastDonation: "5 months ago", available: true },
  { id: "D3", name: "Imran Khan", group: "B+", distanceKm: 2.4, lastDonation: "8 months ago", available: true },
  { id: "D4", name: "Priya Menon", group: "AB+", distanceKm: 3.1, lastDonation: "6 months ago", available: false },
  { id: "D5", name: "Vikram Singh", group: "O-", distanceKm: 3.6, lastDonation: "10 months ago", available: true },
  { id: "D6", name: "Lakshmi Devi", group: "A-", distanceKm: 4.2, lastDonation: "7 months ago", available: true },
  { id: "D7", name: "Karthik Iyer", group: "B-", distanceKm: 4.9, lastDonation: "12 months ago", available: false },
  { id: "D8", name: "Fatima Begum", group: "O+", distanceKm: 5.4, lastDonation: "4 months ago", available: true },
];

const HOSPITALS = [
  "Aster Ramesh Hospital",
  "Manipal Hospital",
  "Andhra Hospitals",
  "Government General Hospital",
  "Sentini Hospital",
  "Pinnamaneni Siddhartha Hospital",
  "Siddhartha Medical College",
  "Kamineni Hospital",
  "NRI Medical College",
  "Rainbow Children's Hospital",
  "Vijaya Hospital",
  "Lifeline Hospital",
  "Sunrise Hospital",
  "City Hospital",
  "Government Fever Hospital",
];

interface BloodRequest {
  id: string;
  group: string;
  units: number;
  hospital: string;
  status: "Matching" | "Donors alerted";
}

function stockTone(units: number): string {
  if (units >= 60) return "text-emerald-400";
  if (units >= 25) return "text-amber-400";
  return "text-red-400";
}

export default function BloodNetworkPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [group, setGroup] = useState("O+");
  const [units, setUnits] = useState(2);
  const [hospital, setHospital] = useState(HOSPITALS[0]);
  const [message, setMessage] = useState<string | null>(null);

  const matchedDonors = useMemo(
    () => DONORS.filter((donor) => donor.group === group && donor.available).length,
    [group]
  );

  const handleRequest = (event: React.FormEvent) => {
    event.preventDefault();
    const request: BloodRequest = {
      id: `BR-${Date.now()}`,
      group,
      units,
      hospital,
      status: matchedDonors > 0 ? "Donors alerted" : "Matching",
    };
    setRequests((current) => [request, ...current]);
    setMessage(
      matchedDonors > 0
        ? `${matchedDonors} ${group} donor${matchedDonors > 1 ? "s" : ""} alerted for ${hospital}.`
        : `No available ${group} donor right now — request queued across Vijayawada.`
    );
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 p-3">
              <Droplets className="h-7 w-7 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl">
                Blood Network
              </h1>
              <p className="text-sm font-medium text-rose-400">
                Donor matching across Vijayawada · 15 partner hospitals
              </p>
            </div>
          </div>
          <Link
            href="/"
            aria-label="Back to dashboard"
            className="flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-colors duration-300 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Dashboard
          </Link>
        </motion.header>

        {/* Stats */}
        <section
          aria-label="Blood network statistics"
          className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4"
        >
          {[
            { label: "Active Donors", value: 1284, accent: "text-rose-400" },
            { label: "Units Available", value: 318, accent: "text-emerald-400" },
            { label: "Requests Today", value: 27, accent: "text-amber-400" },
            { label: "Avg Match (min)", value: 6, accent: "text-cyan-400" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {stat.label}
              </p>
              <p className={`mt-2 text-3xl font-black ${stat.accent}`}>
                <AnimatedCounter value={stat.value} ariaLabel={`${stat.value}`} />
              </p>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Stock */}
            <section
              aria-label="Blood stock by group"
              className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl"
            >
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-100">
                <Droplet className="h-5 w-5 text-rose-500" aria-hidden="true" />
                Live Blood Stock
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {STOCK.map((item) => (
                  <div
                    key={item.group}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center transition-transform duration-300 hover:-translate-y-1"
                  >
                    <p className="text-xl font-black text-slate-100">{item.group}</p>
                    <p className={`mt-1 text-2xl font-bold ${stockTone(item.units)}`}>
                      {item.units}
                    </p>
                    <p className="text-xs text-slate-500">units</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Donors */}
            <section
              aria-label="Nearby donors"
              className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl"
            >
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-100">
                <UserCheck className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                Nearby Donors
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2 font-semibold">Donor</th>
                      <th className="px-3 py-2 font-semibold">Group</th>
                      <th className="px-3 py-2 font-semibold">Distance</th>
                      <th className="px-3 py-2 font-semibold">Last donation</th>
                      <th className="px-3 py-2 text-right font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DONORS.map((donor) => (
                      <tr
                        key={donor.id}
                        className="border-b border-white/5 transition-colors hover:bg-white/5"
                      >
                        <td className="px-3 py-3 text-sm font-medium text-slate-200">
                          {donor.name}
                        </td>
                        <td className="px-3 py-3">
                          <span className="rounded-lg bg-rose-500/15 px-2 py-1 text-xs font-bold text-rose-300">
                            {donor.group}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-400">
                          {donor.distanceKm} km
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-400">
                          {donor.lastDonation}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <span
                            className={`text-xs font-bold ${
                              donor.available ? "text-emerald-400" : "text-slate-500"
                            }`}
                          >
                            {donor.available ? "AVAILABLE" : "UNAVAILABLE"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            <section
              aria-label="Request blood"
              className="rounded-3xl border border-rose-500/25 bg-slate-900/80 p-5 backdrop-blur-xl"
            >
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-100">
                <Search className="h-5 w-5 text-rose-400" aria-hidden="true" />
                Request Blood
              </h2>

              <form onSubmit={handleRequest} className="space-y-4">
                <div>
                  <label
                    htmlFor="blood-group"
                    className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400"
                  >
                    Blood group
                  </label>
                  <select
                    id="blood-group"
                    value={group}
                    onChange={(event) => setGroup(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-200"
                  >
                    {STOCK.map((item) => (
                      <option key={item.group} value={item.group}>
                        {item.group}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="blood-units"
                    className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400"
                  >
                    Units needed
                  </label>
                  <input
                    id="blood-units"
                    type="number"
                    min={1}
                    max={10}
                    value={units}
                    onChange={(event) => setUnits(Number(event.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-200"
                  />
                </div>

                <div>
                  <label
                    htmlFor="blood-hospital"
                    className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400"
                  >
                    Hospital
                  </label>
                  <select
                    id="blood-hospital"
                    value={hospital}
                    onChange={(event) => setHospital(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-200"
                  >
                    {HOSPITALS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-red-600 py-3 text-sm font-bold text-white transition-all duration-300 hover:brightness-110"
                >
                  Find Donors Now
                </button>
              </form>

              {message && (
                <p
                  role="status"
                  aria-live="polite"
                  className="mt-4 rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-3 py-2.5 text-xs text-cyan-100"
                >
                  {message}
                </p>
              )}

              {requests.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {requests.map((request) => (
                    <li
                      key={request.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs"
                    >
                      <span className="font-semibold text-slate-200">
                        {request.group} × {request.units}
                      </span>
                      <span className="truncate text-slate-400">{request.hospital}</span>
                      <span
                        className={
                          request.status === "Donors alerted"
                            ? "font-bold text-emerald-400"
                            : "font-bold text-amber-400"
                        }
                      >
                        {request.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section
              aria-label="Partner hospitals"
              className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl"
            >
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-100">
                <Hospital className="h-5 w-5 text-cyan-400" aria-hidden="true" />
                Partner Hospitals
              </h2>
              <ul className="space-y-2 text-sm text-slate-400">
                {HOSPITALS.slice(0, 8).map((name) => (
                  <li
                    key={name}
                    className="rounded-xl bg-white/5 px-3 py-2 text-slate-300"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </section>

            <a
              href="tel:108"
              className="flex items-center justify-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3.5 text-sm font-bold text-red-300 transition-colors duration-300 hover:bg-red-500/20"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Emergency: 108
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
