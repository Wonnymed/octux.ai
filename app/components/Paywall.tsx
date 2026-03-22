"use client";
import { Lock, ArrowRight } from "lucide-react";

export default function Paywall({ requiredTier }: { requiredTier: string }) {
  return (
    <div style={{
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 40,
    }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <Lock size={24} style={{ color: "var(--negative)" }} />
        </div>

        <h2 style={{
          fontSize: 18, fontWeight: 500, marginBottom: 8,
          color: "var(--text-primary)",
        }}>
          {requiredTier === "max" ? "This decision needs deeper intelligence" : "Unlock the full picture"}
        </h2>

        <p style={{
          fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5,
          marginBottom: 24,
        }}>
          {requiredTier === "max"
            ? "International operations and investment analysis require the most powerful tools."
            : "Hidden risks, competitor moves, and critical data that Pro users see before every decision."}
        </p>

        <button
          onClick={() => window.location.href = "/pricing"}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 28px", borderRadius: 10,
            background: "var(--accent)", color: "#09090B", border: "none",
            fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}
        >
          Upgrade to {requiredTier === "max" ? "Max" : "Pro"} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
