"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Mail, ArrowLeft } from "lucide-react";
import { SignuxIcon } from "./SignuxIcon";
import { createSupabaseBrowser } from "../lib/supabase-browser";

/* ═══ Zinc palette ═══ */
const Z950 = "#09090B";
const Z900 = "#18181B";
const Z800 = "#27272A";
const Z700 = "#3F3F46";
const Z600 = "#52525B";
const Z500 = "#71717A";
const Z400 = "#A1A1AA";
const Z300 = "#D4D4D8";
const Z200 = "#E4E4E7";

/* ═══ Google SVG ═══ */
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

type AuthStep = "choose" | "email" | "sent";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [step, setStep] = useState<AuthStep>("choose");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Animate in
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep("choose");
      setEmail("");
      setError("");
      setLoading(false);
    }
  }, [isOpen]);

  // Focus email input when entering email step
  useEffect(() => {
    if (step === "email") {
      setTimeout(() => emailRef.current?.focus(), 100);
    }
  }, [step]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleGoogle = useCallback(async () => {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/auth/callback" },
    });
  }, []);

  const handleMagicLink = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setError("");
    setLoading(true);

    try {
      const supabase = createSupabaseBrowser();
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin + "/auth/callback" },
      });
      if (err) {
        setError(err.message);
        setLoading(false);
      } else {
        setStep("sent");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }, [email, loading]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: visible ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0)",
          backdropFilter: visible ? "blur(6px)" : "blur(0px)",
          WebkitBackdropFilter: visible ? "blur(6px)" : "blur(0px)",
          transition: "background 300ms ease-out, backdrop-filter 300ms ease-out",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        padding: 20,
      }}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 400,
            pointerEvents: "auto",
            background: Z950,
            border: `1px solid ${Z800}`,
            borderRadius: 18,
            boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)",
            overflow: "hidden",
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1) translateY(0)" : "scale(0.97) translateY(8px)",
            transition: "opacity 250ms ease-out, transform 250ms ease-out",
          }}
        >
          {/* Close button */}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "14px 16px 0",
          }}>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent", border: "none",
                cursor: "pointer", color: Z600,
                transition: "color 180ms ease-out, background 180ms ease-out",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = Z400; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = Z600; e.currentTarget.style.background = "transparent"; }}
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: "8px 36px 36px" }}>
            {step === "choose" && renderChooseStep()}
            {step === "email" && renderEmailStep()}
            {step === "sent" && renderSentStep()}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);

  /* ═══ STEP 1 — Choose method ═══ */
  function renderChooseStep() {
    return (
      <>
        {/* Brand mark */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <SignuxIcon size={28} variant="gold" />
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: 20, fontWeight: 500, color: Z200,
          textAlign: "center", margin: "0 0 6px",
          letterSpacing: -0.2,
        }}>
          Log in or sign up
        </h2>
        <p style={{
          fontSize: 13, color: Z600, textAlign: "center",
          margin: "0 0 32px", lineHeight: 1.5,
        }}>
          Sign in to save decisions and unlock all engines.
        </p>

        {/* Google */}
        <AuthButton onClick={handleGoogle} style={{ marginBottom: 10 }}>
          <GoogleIcon />
          Continue with Google
        </AuthButton>

        {/* Email */}
        <AuthButton onClick={() => setStep("email")}>
          <Mail size={16} strokeWidth={1.5} style={{ color: Z400 }} />
          Continue with email
        </AuthButton>

        {/* Terms */}
        <p style={{
          textAlign: "center", fontSize: 10.5, color: Z700,
          marginTop: 28, lineHeight: 1.7, marginBottom: 0,
        }}>
          By continuing, you agree to our{" "}
          <a href="/terms" style={{ color: Z600, textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.color = Z400}
            onMouseLeave={e => e.currentTarget.style.color = Z600}
          >Terms</a>
          {" "}and{" "}
          <a href="/privacy" style={{ color: Z600, textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.color = Z400}
            onMouseLeave={e => e.currentTarget.style.color = Z600}
          >Privacy Policy</a>
        </p>
      </>
    );
  }

  /* ═══ STEP 2 — Email entry ═══ */
  function renderEmailStep() {
    return (
      <>
        {/* Back button */}
        <button
          onClick={() => { setStep("choose"); setError(""); }}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            color: Z500, fontSize: 12, padding: 0, marginBottom: 24,
            transition: "color 180ms ease-out",
          }}
          onMouseEnter={e => e.currentTarget.style.color = Z300}
          onMouseLeave={e => e.currentTarget.style.color = Z500}
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back
        </button>

        <h2 style={{
          fontSize: 20, fontWeight: 500, color: Z200,
          margin: "0 0 6px", letterSpacing: -0.2,
        }}>
          Enter your email
        </h2>
        <p style={{
          fontSize: 13, color: Z600, margin: "0 0 24px", lineHeight: 1.5,
        }}>
          We&apos;ll send you a sign-in link. No password needed.
        </p>

        <form onSubmit={handleMagicLink}>
          <label style={{
            display: "block", fontSize: 11, color: Z500,
            marginBottom: 6, fontWeight: 500,
          }}>
            Email address
          </label>
          <input
            ref={emailRef}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            autoComplete="email"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${Z800}`,
              color: Z200,
              fontSize: 14,
              outline: "none",
              fontFamily: "var(--font-body)",
              transition: "border-color 180ms ease-out",
              marginBottom: error ? 0 : 16,
              boxSizing: "border-box",
            }}
            onFocus={e => e.currentTarget.style.borderColor = Z600}
            onBlur={e => e.currentTarget.style.borderColor = Z800}
          />

          {error && (
            <div style={{
              fontSize: 12, color: "#ef4444",
              padding: "8px 12px", marginTop: 8, marginBottom: 16,
              borderRadius: 8,
              background: "rgba(239,68,68,0.04)",
              border: "1px solid rgba(239,68,68,0.08)",
              lineHeight: 1.4,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 0",
              borderRadius: 10,
              background: loading ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)",
              border: `1px solid ${loading ? Z800 : Z700}`,
              color: loading ? Z600 : Z200,
              fontSize: 13.5,
              fontWeight: 500,
              cursor: loading ? "wait" : "pointer",
              transition: "all 180ms ease-out",
            }}
            onMouseEnter={e => {
              if (loading) return;
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              e.currentTarget.style.borderColor = Z600;
            }}
            onMouseLeave={e => {
              if (loading) return;
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.borderColor = Z700;
            }}
          >
            {loading ? "Sending link..." : "Continue"}
          </button>
        </form>
      </>
    );
  }

  /* ═══ STEP 3 — Link sent confirmation ═══ */
  function renderSentStep() {
    return (
      <div style={{ textAlign: "center" }}>
        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${Z800}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 22px",
        }}>
          <Mail size={22} strokeWidth={1.5} style={{ color: Z400 }} />
        </div>

        <h2 style={{
          fontSize: 20, fontWeight: 500, color: Z200,
          margin: "0 0 8px", letterSpacing: -0.2,
        }}>
          Check your email
        </h2>
        <p style={{
          fontSize: 13, color: Z500, lineHeight: 1.6,
          margin: "0 0 4px",
        }}>
          We sent a sign-in link to
        </p>
        <p style={{
          fontSize: 13.5, color: Z200, fontWeight: 500,
          margin: "0 0 24px",
          fontFamily: "var(--font-mono)",
          wordBreak: "break-all",
          letterSpacing: -0.2,
        }}>
          {email}
        </p>

        {/* Edit email / resend */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
          <button
            onClick={() => { setStep("email"); setError(""); setLoading(false); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: Z500, fontSize: 12,
              transition: "color 180ms ease-out",
              padding: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = Z300}
            onMouseLeave={e => e.currentTarget.style.color = Z500}
          >
            Edit email
          </button>
          <button
            onClick={() => { setLoading(false); setError(""); handleMagicLink({ preventDefault: () => {} } as React.FormEvent); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: Z500, fontSize: 12,
              transition: "color 180ms ease-out",
              padding: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = Z300}
            onMouseLeave={e => e.currentTarget.style.color = Z500}
          >
            Resend link
          </button>
        </div>

        {/* Try another method */}
        <div style={{ marginTop: 20 }}>
          <button
            onClick={() => { setStep("choose"); setError(""); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: Z600, fontSize: 11.5,
              transition: "color 180ms ease-out",
              padding: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = Z400}
            onMouseLeave={e => e.currentTarget.style.color = Z600}
          >
            Try another method
          </button>
        </div>
      </div>
    );
  }
}

/* ═══ Shared Auth Button ═══ */
function AuthButton({ children, onClick, style }: {
  children: React.ReactNode;
  onClick: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "12px 0",
        borderRadius: 10,
        background: "transparent",
        border: `1px solid ${Z800}`,
        color: Z200,
        fontSize: 13.5,
        fontWeight: 500,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        transition: "all 180ms ease-out",
        ...style,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = Z700;
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = Z800;
        e.currentTarget.style.background = "transparent";
      }}
    >
      {children}
    </button>
  );
}
