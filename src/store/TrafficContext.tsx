"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type LightState = "RED" | "YELLOW" | "GREEN";

export interface TrafficSignal {
  id: string;
  name: string;
  lat: number;
  lng: number;
  state: LightState;
}

interface TrafficContextType {
  signals: TrafficSignal[];
  corridorActive: boolean;
  activateCorridor: () => void;
  resetCorridor: () => void;
}

const INITIAL_SIGNALS: TrafficSignal[] = [
  { id: "TS-001", name: "Connaught Place", lat: 28.6139, lng: 77.2090, state: "RED" },
  { id: "TS-002", name: "India Gate",      lat: 28.6129, lng: 77.2295, state: "RED" },
  { id: "TS-003", name: "Karol Bagh",      lat: 28.6519, lng: 77.1909, state: "RED" },
  { id: "TS-004", name: "Rajiv Chowk",     lat: 28.6328, lng: 77.2197, state: "RED" },
];

const TrafficContext = createContext<TrafficContextType | null>(null);

export function TrafficProvider({ children }: { children: React.ReactNode }) {
  const [signals, setSignals] = useState<TrafficSignal[]>(INITIAL_SIGNALS);
  const [corridorActive, setCorridorActive] = useState(false);

  // Normal cycle when corridor is OFF
  useEffect(() => {
    if (corridorActive) return;

    const cycle: LightState[] = ["RED", "GREEN", "YELLOW"];
    let index = 0;

    const interval = setInterval(() => {
      index++;
      setSignals((prev) =>
        prev.map((s, i) => ({
          ...s,
          state: cycle[(index + i) % cycle.length],
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [corridorActive]);

  const activateCorridor = () => {
    setCorridorActive(true);
    signals.forEach((s, i) => {
      setTimeout(() => {
        setSignals((prev) =>
          prev.map((x) => (x.id === s.id ? { ...x, state: "YELLOW" } : x))
        );
      }, i * 700);

      setTimeout(() => {
        setSignals((prev) =>
          prev.map((x) => (x.id === s.id ? { ...x, state: "GREEN" } : x))
        );
      }, i * 700 + 500);
    });
  };

  const resetCorridor = () => {
    setCorridorActive(false);
    setSignals(INITIAL_SIGNALS);
  };

  return (
    <TrafficContext.Provider
      value={{ signals, corridorActive, activateCorridor, resetCorridor }}
    >
      {children}
    </TrafficContext.Provider>
  );
}

export function useTraffic() {
  const ctx = useContext(TrafficContext);
  if (!ctx) throw new Error("useTraffic must be used inside TrafficProvider");
  return ctx;
}