"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getProfile, updateProfile } from "./lib/profile";
import { LANGUAGES, Language, t } from "./lib/i18n";

/* ═══ Constants ═══ */
const OPERATION_KEYS = [
  "onboarding.operations.import_export",
  "onboarding.operations.offshore",
  "onboarding.operations.crypto",
  "onboarding.operations.digital_services",
  "onboarding.operations.ecommerce",
  "onboarding.operations.investments",
  "onboarding.operations.other",
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ═══ Shared styles ═══ */
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  fontSize: 15,
  fontFamily: "var(--font-sans)",
  color: "var(--text-primary)",
  background: "var(--bg-primary)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  outline: "none",
  transition: "border-color 0.2s",
};

/* ═══ Page wrapper animation ═══ */
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25, ease: "easeIn" } },
};

/* ═══ Step 1 — Language Selection ═══ */
function StepLanguage({ onSelect }: { onSelect: (lang: Language) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <motion.div key="step-lang" variants={pageVariants} initial="initial" animate="animate" exit="exit"
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, width: "100%" }}>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: "0.18em", color: "var(--accent)", fontFamily: "var(--font-sans)" }}>SIGNUX</span>
      </div>

      {/* Title */}
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, fontFamily: "var(--font-sans)", color: "var(--text-primary)", marginBottom: 6 }}>
          Choose your language
        </h1>
      </div>

      {/* Language grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, width: "100%" }}>
        {LANGUAGES.map(lang => {
          const isHovered = hovered === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => onSelect(lang.code)}
              onMouseEnter={() => setHovered(lang.code)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "14px 12px",
                borderRadius: 10,
                border: isHovered ? "1px solid var(--accent)" : "1px solid var(--border)",
                background: isHovered ? "var(--accent-light)" : "var(--bg-primary)",
                cursor: "pointer",
                fontSize: 14,
                fontFamily: "var(--font-sans)",
                color: "var(--text-primary)",
                transition: "all 0.2s",
                fontWeight: 400,
              }}
            >
              <span style={{ fontSize: 18 }}>{lang.flag}</span>
              <span>{lang.nativeName}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ═══ Step 2 — Profile Form ═══ */
function StepProfile({ lang, onSubmit }: { lang: Language; onSubmit: (data: { email: string; name: string; taxResidence: string; operations: string[] }) => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [taxResidence, setTaxResidence] = useState("");
  const [operations, setOperations] = useState<string[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const isValid = EMAIL_RE.test(email) && name.trim().length > 0;

  function toggleOp(key: string) {
    setOperations(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({ email: email.trim(), name: name.trim(), taxResidence: taxResidence.trim(), operations });
  }

  return (
    <motion.div key="step-profile" variants={pageVariants} initial="initial" animate="animate" exit="exit"
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, width: "100%" }}>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: "0.18em", color: "var(--accent)", fontFamily: "var(--font-sans)" }}>SIGNUX</span>
      </div>

      {/* Headline */}
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, fontFamily: "var(--font-sans)", color: "var(--text-primary)", marginBottom: 6 }}>
          {t("onboarding.welcome", lang)}
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          {t("onboarding.subtitle", lang)}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%" }}>
        {/* Email */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6, fontFamily: "var(--font-sans)" }}>
            {t("onboarding.email", lang)}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            style={{ ...inputStyle, borderColor: focusedField === "email" ? "var(--accent)" : "var(--border)" }}
            placeholder="you@company.com"
          />
        </div>

        {/* Name */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6, fontFamily: "var(--font-sans)" }}>
            {t("onboarding.name", lang)}
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            onFocus={() => setFocusedField("name")}
            onBlur={() => setFocusedField(null)}
            style={{ ...inputStyle, borderColor: focusedField === "name" ? "var(--accent)" : "var(--border)" }}
          />
        </div>

        {/* Tax Residence */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6, fontFamily: "var(--font-sans)" }}>
            {t("onboarding.country", lang)}
          </label>
          <input
            type="text"
            value={taxResidence}
            onChange={e => setTaxResidence(e.target.value)}
            onFocus={() => setFocusedField("country")}
            onBlur={() => setFocusedField(null)}
            style={{ ...inputStyle, borderColor: focusedField === "country" ? "var(--accent)" : "var(--border)" }}
            placeholder={t("onboarding.country_placeholder", lang)}
          />
        </div>

        {/* Operations */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 10, fontFamily: "var(--font-sans)" }}>
            {t("onboarding.operations", lang)}
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {OPERATION_KEYS.map(key => {
              const selected = operations.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleOp(key)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 20,
                    fontSize: 13,
                    fontFamily: "var(--font-sans)",
                    border: selected ? "1px solid var(--accent)" : "1px solid var(--border)",
                    background: selected ? "var(--accent-light)" : "var(--bg-primary)",
                    color: selected ? "var(--accent)" : "var(--text-secondary)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontWeight: selected ? 500 : 400,
                  }}
                >
                  {t(key, lang)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid}
          style={{
            width: "100%",
            padding: "14px 0",
            borderRadius: 10,
            border: "none",
            fontSize: 15,
            fontWeight: 600,
            fontFamily: "var(--font-sans)",
            background: isValid ? "var(--accent)" : "var(--border)",
            color: isValid ? "#FFFFFF" : "var(--text-tertiary)",
            cursor: isValid ? "pointer" : "not-allowed",
            transition: "all 0.2s",
            marginTop: 4,
          }}
        >
          {t("onboarding.start", lang)}
        </button>

        {/* Terms */}
        <p style={{ fontSize: 12, color: "var(--text-tertiary)", textAlign: "center", lineHeight: 1.5 }}>
          {t("onboarding.terms", lang)}
        </p>
      </form>
    </motion.div>
  );
}

/* ═══ Main Onboarding Page ═══ */
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"loading" | "language" | "profile">("loading");
  const [lang, setLang] = useState<Language>("en");

  // Check for existing profile — skip to dashboard
  useEffect(() => {
    const profile = getProfile();
    if (profile && profile.name && profile.email) {
      router.replace("/dashboard");
    } else {
      setStep("language");
    }
  }, [router]);

  function handleLanguageSelect(selected: Language) {
    setLang(selected);
    setStep("profile");
  }

  function handleProfileSubmit(data: { email: string; name: string; taxResidence: string; operations: string[] }) {
    // Save profile
    updateProfile({
      email: data.email,
      name: data.name,
      taxResidence: data.taxResidence,
      operations: data.operations,
      language: lang,
    });

    // Store welcome toast flag for dashboard to pick up
    if (typeof window !== "undefined") {
      sessionStorage.setItem("signux_welcome_toast", JSON.stringify({
        message: t("common.welcome_toast", lang, { name: data.name }),
        type: "success",
      }));
    }

    router.push("/dashboard");
  }

  // Loading state
  if (step === "loading") {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-primary)",
      }} />
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-primary)",
      padding: "40px 20px",
    }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <AnimatePresence mode="wait">
          {step === "language" && <StepLanguage onSelect={handleLanguageSelect} />}
          {step === "profile" && <StepProfile lang={lang} onSubmit={handleProfileSubmit} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
