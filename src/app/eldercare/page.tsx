// PRAVAAH 360 – Elderly Care (Full Screen Dashboard)
"use client";

import { useEffect, useState } from "react";
import { AppProvider } from "@/store/AppContext";
import BackToLogin from "@/components/BackToLogin";

// ─── Types ─────────────────────────────────────────────
interface BPReading {
  systolic: number;
  diastolic: number;
  timestamp: number;
}
interface SugarReading {
  value: number;
  type: "fasting" | "post-meal";
  timestamp: number;
}
type ReminderType = "medicine" | "doctor";
interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  time: string;
  date?: string;
  notes?: string;
  done: boolean;
}

const ELDER_ID = "elder_001";
const LS_BP = `elder_bp_${ELDER_ID}`;
const LS_SUGAR = `elder_sugar_${ELDER_ID}`;
const LS_REM = `elder_reminders_${ELDER_ID}`;

function ElderlyPageContent() {
  const [bpList, setBpList] = useState<BPReading[]>([]);
  const [sugarList, setSugarList] = useState<SugarReading[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [sugarValue, setSugarValue] = useState("");
  const [sugarType, setSugarType] = useState<"fasting" | "post-meal">("fasting");

  const [remType, setRemType] = useState<ReminderType>("medicine");
  const [remTitle, setRemTitle] = useState("");
  const [remTime, setRemTime] = useState("");
  const [remDate, setRemDate] = useState("");
  const [remNotes, setRemNotes] = useState("");

  useEffect(() => {
    const bp = localStorage.getItem(LS_BP);
    const sugar = localStorage.getItem(LS_SUGAR);
    const rem = localStorage.getItem(LS_REM);
    if (bp) setBpList(JSON.parse(bp));
    if (sugar) setSugarList(JSON.parse(sugar));
    if (rem) setReminders(JSON.parse(rem));
  }, []);

  const saveBP = (list: BPReading[]) => {
    setBpList(list);
    localStorage.setItem(LS_BP, JSON.stringify(list));
  };
  const saveSugar = (list: SugarReading[]) => {
    setSugarList(list);
    localStorage.setItem(LS_SUGAR, JSON.stringify(list));
  };
  const saveReminders = (list: Reminder[]) => {
    setReminders(list);
    localStorage.setItem(LS_REM, JSON.stringify(list));
  };

  const addBP = () => {
    const s = parseInt(systolic);
    const d = parseInt(diastolic);
    if (!s || !d) return alert("Enter valid BP values");
    saveBP([{ systolic: s, diastolic: d, timestamp: Date.now() }, ...bpList].slice(0, 10));
    setSystolic("");
    setDiastolic("");
  };

  const addSugar = () => {
    const v = parseInt(sugarValue);
    if (!v) return alert("Enter valid sugar value");
    saveSugar([{ value: v, type: sugarType, timestamp: Date.now() }, ...sugarList].slice(0, 10));
    setSugarValue("");
  };

  const addReminder = () => {
    if (!remTitle || !remTime) return alert("Fill title and time");
    saveReminders([{
      id: Date.now().toString(),
      type: remType,
      title: remTitle,
      time: remTime,
      date: remType === "doctor" ? remDate : undefined,
      notes: remNotes,
      done: false,
    }, ...reminders]);
    setRemTitle(""); setRemTime(""); setRemDate(""); setRemNotes("");
  };

  const toggleReminder = (id: string) =>
    saveReminders(reminders.map(r => r.id === id ? { ...r, done: !r.done } : r));
  const deleteReminder = (id: string) =>
    saveReminders(reminders.filter(r => r.id !== id));

  const bpStatus = (s: number, d: number) => {
    if (s >= 140 || d >= 90) return { text: "High", color: "#ef4444" };
    if (s <= 90 || d <= 60) return { text: "Low", color: "#f59e0b" };
    return { text: "Normal", color: "#22c55e" };
  };
  const sugarStatus = (v: number, type: string) => {
    const high = type === "fasting" ? 126 : 200;
    if (v >= high) return { text: "High", color: "#ef4444" };
    if (v < 70) return { text: "Low", color: "#f59e0b" };
    return { text: "Normal", color: "#22c55e" };
  };
  const formatTime = (t: number) =>
    new Date(t).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  // Latest readings for stats
  const latestBP = bpList[0];
  const latestSugar = sugarList[0];
  const pendingReminders = reminders.filter(r => !r.done).length;

  return (
    <div style={styles.page}>

      {/* ─── TOP NAVBAR ─── */}
      <nav style={styles.navbar}>
        <div style={styles.navLeft}>
  <button
    onClick={() => window.location.href = "/login"}
    style={styles.backBtn}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "rgba(59,130,246,0.25)";
      e.currentTarget.style.borderColor = "#3b82f6";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "rgba(59,130,246,0.15)";
      e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)";
    }}
  >
    ← Back
  </button>
  <div style={styles.logo}>
            <span style={{ fontSize: "2rem" }}>👴</span>
            <div>
              <h1 style={styles.title}>Elderly Care</h1>
              <p style={styles.sub}>Pravaah 360 · Health Dashboard</p>
            </div>
          </div>
        </div>
        <div style={styles.navRight}>
          <div style={styles.badge}>
            <span style={{ fontSize: "1rem" }}>👤</span>
            <span>ID: {ELDER_ID}</span>
          </div>
        </div>
      </nav>

      {/* ─── MAIN LAYOUT ─── */}
      <div style={styles.container}>

        {/* ─── STAT CARDS ─── */}
        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #ef4444" }}>
            <div style={styles.statIcon}>🩸</div>
            <div>
              <div style={styles.statLabel}>Latest BP</div>
              <div style={styles.statValue}>
                {latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : "—"}
              </div>
              <div style={styles.statMeta}>mmHg</div>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: "4px solid #a855f7" }}>
            <div style={styles.statIcon}>🍬</div>
            <div>
              <div style={styles.statLabel}>Latest Sugar</div>
              <div style={styles.statValue}>
                {latestSugar ? latestSugar.value : "—"}
              </div>
              <div style={styles.statMeta}>
                {latestSugar ? `mg/dL · ${latestSugar.type}` : "mg/dL"}
              </div>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: "4px solid #3b82f6" }}>
            <div style={styles.statIcon}>⏰</div>
            <div>
              <div style={styles.statLabel}>Active Reminders</div>
              <div style={styles.statValue}>{pendingReminders}</div>
              <div style={styles.statMeta}>pending tasks</div>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: "4px solid #22c55e" }}>
            <div style={styles.statIcon}>📊</div>
            <div>
              <div style={styles.statLabel}>Total Records</div>
              <div style={styles.statValue}>{bpList.length + sugarList.length}</div>
              <div style={styles.statMeta}>health entries</div>
            </div>
          </div>
        </div>

        {/* ─── 3-COLUMN GRID ─── */}
        <div style={styles.mainGrid}>

          {/* BP CARD */}
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitleWrap}>
                <span style={styles.cardIcon}>🩸</span>
                <h2 style={styles.cardTitle}>Blood Pressure</h2>
              </div>
              <span style={{ ...styles.pill, background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                {bpList.length} readings
              </span>
            </div>

            <div style={styles.row}>
              <input type="number" placeholder="Systolic (120)" value={systolic}
                onChange={e => setSystolic(e.target.value)} style={styles.input} />
              <input type="number" placeholder="Diastolic (80)" value={diastolic}
                onChange={e => setDiastolic(e.target.value)} style={styles.input} />
            </div>
            <button onClick={addBP} style={{ ...styles.btn, background: "#ef4444" }}>
              ➕ Add BP Reading
            </button>

            <div style={styles.list}>
              {bpList.length === 0 && <p style={styles.empty}>No readings yet</p>}
              {bpList.map((r, i) => {
                const st = bpStatus(r.systolic, r.diastolic);
                return (
                  <div key={i} style={styles.listItem}>
                    <div>
                      <strong style={{ fontSize: "1.05rem" }}>{r.systolic}/{r.diastolic}</strong>
                      <span style={styles.unit}>mmHg</span>
                      <div style={styles.timestamp}>{formatTime(r.timestamp)}</div>
                    </div>
                    <span style={{ ...styles.tag, background: st.color }}>{st.text}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SUGAR CARD */}
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitleWrap}>
                <span style={styles.cardIcon}>🍬</span>
                <h2 style={styles.cardTitle}>Blood Sugar</h2>
              </div>
              <span style={{ ...styles.pill, background: "rgba(168,85,247,0.15)", color: "#a855f7" }}>
                {sugarList.length} readings
              </span>
            </div>

            <div style={styles.row}>
              <input type="number" placeholder="Value (mg/dL)" value={sugarValue}
                onChange={e => setSugarValue(e.target.value)} style={styles.input} />
              <select value={sugarType}
                onChange={e => setSugarType(e.target.value as "fasting" | "post-meal")}
                style={styles.input}>
                <option value="fasting">Fasting</option>
                <option value="post-meal">Post-meal</option>
              </select>
            </div>
            <button onClick={addSugar} style={{ ...styles.btn, background: "#a855f7" }}>
              ➕ Add Sugar Reading
            </button>

            <div style={styles.list}>
              {sugarList.length === 0 && <p style={styles.empty}>No readings yet</p>}
              {sugarList.map((r, i) => {
                const st = sugarStatus(r.value, r.type);
                return (
                  <div key={i} style={styles.listItem}>
                    <div>
                      <strong style={{ fontSize: "1.05rem" }}>{r.value}</strong>
                      <span style={styles.unit}>mg/dL · {r.type}</span>
                      <div style={styles.timestamp}>{formatTime(r.timestamp)}</div>
                    </div>
                    <span style={{ ...styles.tag, background: st.color }}>{st.text}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* REMINDERS CARD */}
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitleWrap}>
                <span style={styles.cardIcon}>⏰</span>
                <h2 style={styles.cardTitle}>Reminders</h2>
              </div>
              <span style={{ ...styles.pill, background: "rgba(59,130,246,0.15)", color: "#3b82f6" }}>
                {pendingReminders} pending
              </span>
            </div>

            <div style={styles.row}>
              <button onClick={() => setRemType("medicine")}
                style={{ ...styles.typeBtn, background: remType === "medicine" ? "#3b82f6" : "rgba(255,255,255,0.06)" }}>
                💊 Medicine
              </button>
              <button onClick={() => setRemType("doctor")}
                style={{ ...styles.typeBtn, background: remType === "doctor" ? "#3b82f6" : "rgba(255,255,255,0.06)" }}>
                🩺 Doctor
              </button>
            </div>

            <input type="text" placeholder={remType === "medicine" ? "Medicine name" : "Doctor / Hospital"}
              value={remTitle} onChange={e => setRemTitle(e.target.value)}
              style={{ ...styles.input, width: "100%" }} />

            <div style={styles.row}>
              <input type="time" value={remTime} onChange={e => setRemTime(e.target.value)} style={styles.input} />
              {remType === "doctor" && (
                <input type="date" value={remDate} onChange={e => setRemDate(e.target.value)} style={styles.input} />
              )}
            </div>

            <input type="text" placeholder="Notes (optional)" value={remNotes}
              onChange={e => setRemNotes(e.target.value)} style={{ ...styles.input, width: "100%" }} />

            <button onClick={addReminder} style={{ ...styles.btn, background: "#3b82f6" }}>
              ➕ Add Reminder
            </button>

            <div style={styles.list}>
              {reminders.length === 0 && <p style={styles.empty}>No reminders yet</p>}
              {reminders.map(r => (
                <div key={r.id} style={{
                  ...styles.listItem,
                  opacity: r.done ? 0.5 : 1,
                  textDecoration: r.done ? "line-through" : "none",
                }}>
                  <div style={{ flex: 1 }}>
                    <div>
                      <span style={{ fontSize: "1.1rem", marginRight: 8 }}>
                        {r.type === "medicine" ? "💊" : "🩺"}
                      </span>
                      <strong>{r.title}</strong>
                    </div>
                    <div style={styles.timestamp}>
                      ⏰ {r.time} {r.date && `· 📅 ${r.date}`}
                    </div>
                    {r.notes && <div style={{ ...styles.timestamp, marginTop: 2 }}>📝 {r.notes}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => toggleReminder(r.id)} style={styles.iconBtn}>
                      {r.done ? "↩️" : "✅"}
                    </button>
                    <button onClick={() => deleteReminder(r.id)}
                      style={{ ...styles.iconBtn, background: "#ef4444" }}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ─── STYLES ─────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
    color: "#f1f5f9",
    fontFamily: "'Inter', sans-serif",
  },

  // ─── Navbar ───
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    background: "rgba(15,23,42,0.7)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  navLeft: { display: "flex", alignItems: "center", gap: 20 },
  navRight: { display: "flex", alignItems: "center", gap: 12 },
  logo: { display: "flex", alignItems: "center", gap: 12 },
  title: { margin: 0, fontSize: "1.5rem", fontWeight: 700 },
  sub: { margin: 0, fontSize: "0.8rem", color: "#94a3b8" },
  badge: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "8px 16px",
    background: "rgba(59,130,246,0.15)",
    border: "1px solid rgba(59,130,246,0.3)",
    borderRadius: 12,
    fontSize: "0.85rem",
    color: "#93c5fd",
    fontWeight: 500,
  },

  // ─── Container ───
  container: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },

  // ─── Stat cards ───
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 16,
  },
  statCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  statIcon: {
    fontSize: "2rem",
    width: 56,
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 12,
  },
  statLabel: { fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 },
  statValue: { fontSize: "1.6rem", fontWeight: 800, marginTop: 4 },
  statMeta: { fontSize: "0.75rem", color: "#64748b", marginTop: 2 },

  // ─── Main grid ───
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: 20,
    alignItems: "start",
  },

  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  cardTitleWrap: { display: "flex", alignItems: "center", gap: 10 },
  cardIcon: { fontSize: "1.4rem" },
  cardTitle: { margin: 0, fontSize: "1.15rem", fontWeight: 700 },
  pill: {
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: "0.7rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  row: { display: "flex", gap: 8 },

  input: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.25)",
    color: "#fff",
    fontSize: "0.9rem",
    outline: "none",
    fontFamily: "'Inter', sans-serif",
  },

  typeBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "all 0.2s",
  },

  btn: {
    padding: "12px",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 4,
    maxHeight: 300,
    overflowY: "auto",
  },

  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 14px",
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 12,
  },

  unit: { color: "#94a3b8", marginLeft: 8, fontSize: "0.8rem" },
  timestamp: { fontSize: "0.72rem", color: "#64748b", marginTop: 3 },

  tag: {
    padding: "5px 12px",
    borderRadius: 20,
    color: "#fff",
    fontSize: "0.72rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  iconBtn: {
    padding: "6px 10px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: "0.9rem",
  },

  empty: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "0.85rem",
    padding: "20px 0",
    fontStyle: "italic",
  },
};

export default function ElderlyPage() {
  return (
    <AppProvider>
      <ElderlyPageContent />
    </AppProvider>
  );
}