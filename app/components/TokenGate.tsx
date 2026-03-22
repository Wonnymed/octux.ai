"use client";
import { Lock, Zap } from "lucide-react";
import { ACTION_COSTS, ACTION_LABELS } from "../lib/tokens";

/** Pre-action cost confirmation */
export function TokenCostConfirm({
  action,
  available,
  onConfirm,
  onCancel,
}: {
  action: string;
  available: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cost = ACTION_COSTS[action] ?? 1;
  const label = ACTION_LABELS[action] || action;
  const canAfford = available >= cost;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 14px", borderRadius: 10,
      background: canAfford ? "rgba(255,255,255,0.04)" : "rgba(239,68,68,0.06)",
      border: `1px solid ${canAfford ? "var(--border-primary)" : "rgba(239,68,68,0.12)"}`,
      fontSize: 12,
    }}>
      <Zap size={14} style={{ color: canAfford ? "var(--text-primary)" : "var(--negative)", flexShrink: 0 }} />
      <span style={{ color: "var(--text-secondary)" }}>
        <strong>{label}</strong> costs <strong style={{ color: canAfford ? "var(--text-primary)" : "var(--negative)" }}>{cost} ST</strong>.
        {" "}You have <strong>{available} ST</strong>.
      </span>
      {canAfford ? (
        <div style={{ display: "flex", gap: 6, marginLeft: "auto", flexShrink: 0 }}>
          <button onClick={onCancel} style={{
            padding: "4px 10px", borderRadius: 6,
            background: "transparent", border: "1px solid var(--border-primary)",
            color: "var(--text-tertiary)", fontSize: 11, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            padding: "4px 10px", borderRadius: 6,
            background: "var(--accent)", border: "none",
            color: "#09090B", fontSize: 11, fontWeight: 600, cursor: "pointer",
          }}>Run</button>
        </div>
      ) : (
        <button onClick={onCancel} style={{
          padding: "4px 10px", borderRadius: 6, marginLeft: "auto",
          background: "var(--accent)", border: "none",
          color: "#09090B", fontSize: 11, fontWeight: 600, cursor: "pointer", flexShrink: 0,
        }}>Upgrade</button>
      )}
    </div>
  );
}

/** Full-screen modal when tokens are exhausted */
export function TokenLimitModal({
  available,
  monthlyTotal,
  plan,
  daysUntilReset,
  onClose,
  onUpgrade,
}: {
  available: number;
  monthlyTotal: number;
  plan: string;
  daysUntilReset: number;
  onClose: () => void;
  onUpgrade: (plan: string) => void;
}) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      animation: "fadeIn 200ms ease",
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 420, width: "90%", padding: 32, borderRadius: 16,
          background: "var(--bg-card)", border: "1px solid var(--border-primary)",
          textAlign: "center",
          animation: "modalIn 200ms ease",
        }}
      >
        <Lock size={28} style={{ color: "var(--negative)", marginBottom: 16 }} />
        <h3 style={{ fontSize: 18, fontWeight: 500, color: "var(--text-primary)", margin: "0 0 8px" }}>
          Not enough tokens
        </h3>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 6px" }}>
          You&apos;ve used {monthlyTotal - available}/{monthlyTotal} ST this month.
        </p>
        <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: "0 0 24px" }}>
          Tokens reset in {daysUntilReset} day{daysUntilReset !== 1 ? "s" : ""}.
        </p>

        {/* Upgrade options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {plan !== "pro" && (
            <button onClick={() => onUpgrade("pro")} style={{
              width: "100%", padding: "12px", borderRadius: 10,
              background: "var(--accent)", border: "none", color: "#09090B",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>
              Upgrade to Pro — 2,000 ST/mo
            </button>
          )}
          {plan !== "max" && plan !== "founding" && (
            <button onClick={() => onUpgrade("max")} style={{
              width: "100%", padding: "12px", borderRadius: 10,
              background: plan === "pro" ? "var(--accent)" : "transparent",
              border: plan === "pro" ? "none" : "1px solid var(--border-primary)",
              color: plan === "pro" ? "#09090B" : "var(--text-secondary)",
              fontSize: 14, fontWeight: plan === "pro" ? 600 : 500, cursor: "pointer",
            }}>
              {plan === "pro" ? "Upgrade to Max — 10,000 ST/mo" : "Max — 10,000 ST/mo"}
            </button>
          )}
        </div>

        <button onClick={onClose} style={{
          width: "100%", padding: "10px", borderRadius: 10,
          background: "transparent", border: "none",
          color: "var(--text-tertiary)", fontSize: 13, cursor: "pointer",
        }}>
          Maybe later
        </button>
      </div>
    </div>
  );
}
