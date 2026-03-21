"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Lock } from "lucide-react";
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
      background: canAfford ? "rgba(212,175,55,0.06)" : "rgba(239,68,68,0.06)",
      border: `1px solid ${canAfford ? "rgba(212,175,55,0.12)" : "rgba(239,68,68,0.12)"}`,
      fontSize: 12,
    }}>
      <Zap size={14} style={{ color: canAfford ? "#D4AF37" : "#EF4444", flexShrink: 0 }} />
      <span style={{ color: "var(--text-secondary)" }}>
        <strong>{label}</strong> costs <strong style={{ color: canAfford ? "#D4AF37" : "#EF4444" }}>{cost} ST</strong>.
        {" "}You have <strong>{available} ST</strong>.
      </span>
      {canAfford ? (
        <div style={{ display: "flex", gap: 6, marginLeft: "auto", flexShrink: 0 }}>
          <button onClick={onCancel} style={{
            padding: "4px 10px", borderRadius: 6,
            background: "transparent", border: "1px solid var(--border-secondary)",
            color: "var(--text-tertiary)", fontSize: 11, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            padding: "4px 10px", borderRadius: 6,
            background: "#D4AF37", border: "none",
            color: "#000", fontSize: 11, fontWeight: 600, cursor: "pointer",
          }}>Run</button>
        </div>
      ) : (
        <button onClick={onCancel} style={{
          padding: "4px 10px", borderRadius: 6, marginLeft: "auto",
          background: "#D4AF37", border: "none",
          color: "#000", fontSize: 11, fontWeight: 600, cursor: "pointer", flexShrink: 0,
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
    <AnimatePresence>
      <div style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      }} onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth: 420, width: "90%", padding: "32px 28px", borderRadius: 16,
            background: "var(--card-bg)", border: "1px solid var(--border-secondary)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>
            <Lock size={36} style={{ color: "#EF4444" }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" }}>
            Monthly token limit reached
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-tertiary)", lineHeight: 1.5, margin: "0 0 6px" }}>
            You&apos;ve used {monthlyTotal - available}/{monthlyTotal} ST this month.
          </p>
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: "0 0 20px" }}>
            Tokens reset in {daysUntilReset} day{daysUntilReset !== 1 ? "s" : ""}.
          </p>

          {/* Upgrade options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {plan !== "pro" && (
              <button onClick={() => onUpgrade("pro")} style={{
                width: "100%", padding: "12px", borderRadius: 10,
                background: "#D4AF37", border: "none", color: "#000",
                fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}>
                Upgrade to Pro — 2,000 ST/mo → $29
              </button>
            )}
            {plan !== "max" && plan !== "founding" && (
              <button onClick={() => onUpgrade("max")} style={{
                width: "100%", padding: "12px", borderRadius: 10,
                background: plan === "pro" ? "#D4AF37" : "transparent",
                border: plan === "pro" ? "none" : "1px solid var(--border-secondary)",
                color: plan === "pro" ? "#000" : "var(--text-secondary)",
                fontSize: 14, fontWeight: plan === "pro" ? 700 : 500, cursor: "pointer",
              }}>
                {plan === "pro" ? "Upgrade to Max — 10,000 ST/mo → $99" : "Max — 10,000 ST/mo → $99"}
              </button>
            )}
          </div>

          <button onClick={onClose} style={{
            width: "100%", padding: "10px", borderRadius: 10,
            background: "transparent", border: "1px solid var(--border-secondary)",
            color: "var(--text-tertiary)", fontSize: 13, cursor: "pointer",
          }}>
            Maybe later
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
