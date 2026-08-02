"use client";

export default function BackToLogin() {
  return (
    <button
      onClick={() => (window.location.href = "/login")}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 18px",
        background: "rgba(59,130,246,0.2)",
        border: "1px solid rgba(59,130,246,0.5)",
        borderRadius: 12,
        color: "#93c5fd",
        fontSize: "0.9rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
        fontFamily: "'Inter', sans-serif",
        whiteSpace: "nowrap",
        boxShadow: "0 2px 8px rgba(59,130,246,0.15)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(59,130,246,0.35)";
        e.currentTarget.style.borderColor = "rgba(59,130,246,0.7)";
        e.currentTarget.style.color = "#dbeafe";
        e.currentTarget.style.transform = "translateX(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(59,130,246,0.2)";
        e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)";
        e.currentTarget.style.color = "#93c5fd";
        e.currentTarget.style.transform = "translateX(0)";
      }}
    >
      <span style={{ fontSize: "1rem" }}>←</span>
      <span>Back to Login</span>
    </button>
  );
}