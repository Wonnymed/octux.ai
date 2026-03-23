"use client";
/**
 * StateShells — unified system for error, empty, partial, and no-result states.
 *
 * Categories:
 * A. EmptyState     — no user data yet (saved, recent, billing, usage, etc.)
 * B. NoResultState  — search/filter returned nothing
 * C. InlineError    — workflow-level failure (simulation, compare, export, etc.)
 * D. PartialState   — feature shell exists but data/feature not fully live
 * E. FullPageState  — full-page error/404 states
 */
import { useIsMobile } from "../lib/useIsMobile";
import { SIGNUX_GOLD } from "../lib/engines";

/* ═══════════════════════════════════════════
   SHARED PRIMITIVES
   ═══════════════════════════════════════════ */

function StateContainer({
  children,
  dashed,
  compact,
}: {
  children: React.ReactNode;
  dashed?: boolean;
  compact?: boolean;
}) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: compact ? "36px 20px" : "56px 24px",
      borderRadius: 16,
      border: `1px ${dashed ? "dashed" : "solid"} var(--border-primary, #E8E8E3)`,
      background: "var(--bg-secondary, #FAFAF7)",
      textAlign: "center",
    }}>
      {children}
    </div>
  );
}

function StateIcon({
  icon,
  color,
  size = 48,
}: {
  icon: React.ReactNode;
  color?: string;
  size?: number;
}) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: size > 40 ? 14 : 10,
      background: color ? `${color}10` : "var(--bg-primary, #FFFFFF)",
      border: `1px solid ${color ? `${color}25` : "var(--border-primary, #E8E8E3)"}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18,
    }}>
      {icon}
    </div>
  );
}

function StateTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontSize: 17,
      fontWeight: 500,
      color: "var(--text-primary, #111111)",
      margin: "0 0 6px",
      lineHeight: 1.3,
    }}>
      {children}
    </h3>
  );
}

function StateBody({ children, maxWidth = 380 }: { children: React.ReactNode; maxWidth?: number }) {
  return (
    <p style={{
      fontSize: 13,
      color: "var(--text-secondary, #5B5B5B)",
      margin: "0 0 20px",
      lineHeight: 1.55,
      maxWidth,
    }}>
      {children}
    </p>
  );
}

function StateActions({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap",
      justifyContent: "center",
    }}>
      {children}
    </div>
  );
}

/* ═══ Buttons ═══ */

export function StatePrimaryBtn({
  label,
  href,
  onClick,
  icon,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}) {
  const style: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 22px",
    borderRadius: 8,
    background: SIGNUX_GOLD,
    border: "none",
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
    transition: "opacity 180ms ease-out",
  };

  if (href) {
    return <a href={href} style={style}>{icon}{label}</a>;
  }
  return <button onClick={onClick} style={style}>{icon}{label}</button>;
}

export function StateSecondaryBtn({
  label,
  href,
  onClick,
  icon,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}) {
  const style: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 18px",
    borderRadius: 8,
    background: "var(--bg-secondary, #FAFAF7)",
    border: "1px solid var(--border-primary, #E8E8E3)",
    color: "var(--text-secondary, #5B5B5B)",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    textDecoration: "none",
    transition: "border-color 180ms ease-out, color 180ms ease-out",
  };

  if (href) {
    return <a href={href} style={style}>{icon}{label}</a>;
  }
  return <button onClick={onClick} style={style}>{icon}{label}</button>;
}

/* ═══════════════════════════════════════════
   A. EMPTY STATE
   ═══════════════════════════════════════════ */

export function EmptyState({
  icon,
  iconColor,
  title,
  body,
  actions,
  dashed,
  compact,
}: {
  icon?: React.ReactNode;
  iconColor?: string;
  title: string;
  body?: string;
  actions?: React.ReactNode;
  dashed?: boolean;
  compact?: boolean;
}) {
  return (
    <StateContainer dashed={dashed} compact={compact}>
      {icon && <StateIcon icon={icon} color={iconColor} />}
      <StateTitle>{title}</StateTitle>
      {body && <StateBody>{body}</StateBody>}
      {actions && <StateActions>{actions}</StateActions>}
    </StateContainer>
  );
}

/* ═══════════════════════════════════════════
   B. NO-RESULT STATE
   ═══════════════════════════════════════════ */

export function NoResultState({
  title = "No matching results",
  body = "Try a different keyword or clear filters.",
  onClear,
}: {
  title?: string;
  body?: string;
  onClear?: () => void;
}) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "40px 20px",
      textAlign: "center",
    }}>
      <StateTitle>{title}</StateTitle>
      <StateBody>{body}</StateBody>
      {onClear && (
        <StateSecondaryBtn label="Clear filters" onClick={onClear} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   C. INLINE ERROR
   ═══════════════════════════════════════════ */

export function InlineError({
  title = "Something went wrong",
  body,
  onRetry,
  retryLabel = "Try again",
  secondaryAction,
}: {
  title?: string;
  body?: string;
  onRetry?: () => void;
  retryLabel?: string;
  secondaryAction?: React.ReactNode;
}) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "32px 20px",
      borderRadius: 14,
      border: "1px solid #EF444425",
      background: "#EF44440A",
      textAlign: "center",
    }}>
      <h4 style={{
        fontSize: 14,
        fontWeight: 500,
        color: "var(--text-primary, #111111)",
        margin: "0 0 6px",
      }}>{title}</h4>
      {body && (
        <p style={{
          fontSize: 13,
          color: "var(--text-secondary, #5B5B5B)",
          margin: "0 0 16px",
          lineHeight: 1.5,
          maxWidth: 360,
        }}>{body}</p>
      )}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 18px",
              borderRadius: 8,
              background: "var(--bg-primary, #FFFFFF)",
              border: "1px solid var(--border-primary, #E8E8E3)",
              color: "var(--text-primary, #111111)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >{retryLabel}</button>
        )}
        {secondaryAction}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   D. PARTIAL STATE
   ═══════════════════════════════════════════ */

export function PartialState({
  icon,
  iconColor,
  title,
  body,
  actions,
}: {
  icon?: React.ReactNode;
  iconColor?: string;
  title: string;
  body?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "48px 24px",
      textAlign: "center",
    }}>
      {icon && <StateIcon icon={icon} color={iconColor} size={40} />}
      <StateTitle>{title}</StateTitle>
      {body && <StateBody>{body}</StateBody>}
      {actions && <StateActions>{actions}</StateActions>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   E. FULL-PAGE STATE (404, app error)
   ═══════════════════════════════════════════ */

export function FullPageState({
  code,
  title,
  body,
  actions,
}: {
  code?: string;
  title: string;
  body: string;
  actions?: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-primary, #FFFFFF)",
      color: "var(--text-primary, #111111)",
      padding: isMobile ? "40px 20px" : "40px 32px",
      textAlign: "center",
    }}>
      {code && (
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 2,
          color: "var(--text-tertiary, #9CA3AF)",
          textTransform: "uppercase",
          marginBottom: 16,
        }}>{code}</span>
      )}
      <h1 style={{
        fontSize: isMobile ? 24 : 28,
        fontWeight: 500,
        color: "var(--text-primary, #111111)",
        margin: "0 0 10px",
        lineHeight: 1.3,
        letterSpacing: 0.2,
      }}>{title}</h1>
      <p style={{
        fontSize: 14,
        color: "var(--text-secondary, #5B5B5B)",
        margin: "0 0 28px",
        lineHeight: 1.6,
        maxWidth: 440,
      }}>{body}</p>
      {actions && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
          {actions}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   TOAST FEEDBACK (lightweight)
   ═══════════════════════════════════════════ */

export type ToastType = "success" | "error" | "warning" | "info";

export const TOAST_COPY = {
  // Success
  saved: "Saved",
  exported: "Export ready",
  planUpdated: "Plan updated",
  copied: "Copied to clipboard",
  deleted: "Deleted",
  comparisonSaved: "Comparison saved",

  // Failure
  saveFailed: "Could not save this decision",
  exportFailed: "Export failed",
  compareFailed: "Comparison did not complete",
  simulationFailed: "The simulation could not be completed",
  whatifFailed: "What-if analysis could not be completed",
  loadFailed: "Could not load this content",
  authFailed: "Authentication failed",
  networkError: "Connection lost. Check your network.",

  // Info
  processing: "Processing...",
  loading: "Loading...",
} as const;
