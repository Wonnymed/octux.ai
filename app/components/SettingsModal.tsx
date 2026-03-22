"use client";
import { useState, useEffect } from "react";
import {
  X, Sliders, Palette, BarChart3, User, CreditCard, Bell,
  Shield, HelpCircle, Monitor, Sun, Moon, Download, Trash2,
  Brain, History, MessageSquare, ExternalLink, Mail,
} from "lucide-react";
import { t, ALL_LANGUAGES, Language, setLanguage } from "../lib/i18n";
import { useIsMobile } from "../lib/useIsMobile";
import { getProfile, updateProfile } from "../lib/profile";

/* ═══ Zinc palette ═══ */
const Z950 = "#09090B";
const Z800 = "#27272A";
const Z700 = "#3F3F46";
const Z600 = "#52525B";
const Z500 = "#71717A";
const Z400 = "#A1A1AA";
const Z300 = "#D4D4D8";
const Z200 = "#E4E4E7";

/* ═══ Section IDs ═══ */
type Section =
  | "general"
  | "appearance"
  | "usage"
  | "account"
  | "billing"
  | "notifications"
  | "privacy"
  | "help";

const SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "general", label: "General", icon: <Sliders size={14} strokeWidth={1.5} /> },
  { id: "appearance", label: "Appearance", icon: <Palette size={14} strokeWidth={1.5} /> },
  { id: "usage", label: "Usage", icon: <BarChart3 size={14} strokeWidth={1.5} /> },
  { id: "account", label: "Account", icon: <User size={14} strokeWidth={1.5} /> },
  { id: "billing", label: "Billing", icon: <CreditCard size={14} strokeWidth={1.5} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={14} strokeWidth={1.5} /> },
  { id: "privacy", label: "Privacy", icon: <Shield size={14} strokeWidth={1.5} /> },
  { id: "help", label: "Help", icon: <HelpCircle size={14} strokeWidth={1.5} /> },
];

/* ═══ Sub-components ═══ */

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{
        fontSize: 15, fontWeight: 500, color: Z200,
        margin: 0, letterSpacing: 0.1,
      }}>
        {title}
      </h2>
      {description && (
        <p style={{ fontSize: 12.5, color: Z500, margin: "4px 0 0", lineHeight: 1.5 }}>
          {description}
        </p>
      )}
    </div>
  );
}

function SettingRow({ label, description, children }: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 16, padding: "14px 16px", borderRadius: 10,
      background: "rgba(255,255,255,0.015)",
      border: `1px solid ${Z800}`,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: Z200 }}>
          {label}
        </div>
        {description && (
          <div style={{ fontSize: 11.5, color: Z600, marginTop: 2, lineHeight: 1.4 }}>
            {description}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>
        {children}
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      width: 38, height: 20, borderRadius: 10,
      background: checked ? Z400 : Z800,
      border: `1px solid ${checked ? Z400 : Z700}`,
      position: "relative", cursor: "pointer",
      transition: "all 180ms ease-out",
      padding: 0,
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: "50%",
        background: checked ? Z950 : Z600,
        position: "absolute", top: 2,
        left: checked ? 20 : 2,
        transition: "all 180ms ease-out",
      }} />
    </button>
  );
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{
      display: "inline-flex", gap: 2, padding: 3, borderRadius: 10,
      background: `rgba(255,255,255,0.02)`,
      border: `1px solid ${Z800}`,
    }}>
      {options.map(opt => {
        const active = opt.id === value;
        return (
          <button key={opt.id} onClick={() => onChange(opt.id)} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 8,
            border: "none",
            background: active ? "rgba(255,255,255,0.08)" : "transparent",
            color: active ? Z200 : Z600,
            fontSize: 12, fontWeight: active ? 500 : 400,
            cursor: "pointer",
            transition: "all 180ms ease-out",
          }}>
            {opt.icon} {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function ActionRow({
  icon,
  label,
  description,
  onClick,
  href,
  external,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  href?: string;
  external?: boolean;
}) {
  const Tag = href ? "a" : "button";
  const extraProps = href
    ? { href, target: external ? "_blank" : undefined, rel: external ? "noopener noreferrer" : undefined }
    : { onClick };
  return (
    <Tag
      {...(extraProps as any)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px", borderRadius: 10,
        border: `1px solid ${Z800}`,
        background: "rgba(255,255,255,0.015)",
        color: Z200, fontSize: 13,
        cursor: "pointer", textAlign: "left" as const,
        width: "100%", textDecoration: "none",
        transition: "all 180ms ease-out",
      }}
      onMouseEnter={(e: any) => { e.currentTarget.style.borderColor = Z700; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
      onMouseLeave={(e: any) => { e.currentTarget.style.borderColor = Z800; e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}
    >
      <div style={{ flexShrink: 0, color: Z500 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: 13, color: Z200 }}>{label}</div>
        {description && (
          <div style={{ fontSize: 11, color: Z600, marginTop: 1 }}>{description}</div>
        )}
      </div>
      {external && <ExternalLink size={12} style={{ color: Z600, flexShrink: 0 }} />}
    </Tag>
  );
}

function Divider() {
  return <div style={{ height: 1, background: Z800, margin: "24px 0" }} />;
}

/* ═══ Types ═══ */

type SettingsModalProps = {
  onClose: () => void;
  onLanguageChange: (lang: Language) => void;
  onNameChange: (name: string) => void;
  tier?: string;
  usage?: { chat_today: number; simulations_month: number; researches_month: number; protect_month: number; hire_month: number };
  limits?: { chat_daily: number; simulate_monthly: number; research_monthly: number; protect_monthly: number; hire_monthly: number };
};

/* ═══ Main Component ═══ */

export default function SettingsModal({ onClose, onLanguageChange, onNameChange, tier, usage, limits }: SettingsModalProps) {
  const profile = getProfile();
  const [section, setSection] = useState<Section>("general");
  const [lang, setLang] = useState<Language>((profile?.language as Language) || "en");
  const [theme, setTheme] = useState<"auto" | "light" | "dark">(profile?.theme || "dark");
  const [webSearch, setWebSearch] = useState(profile?.webSearchEnabled !== false);
  const [aboutYou, setAboutYou] = useState(profile?.aboutYou || "");
  const [customInstructions, setCustomInstructions] = useState(profile?.customInstructions || "");
  const [memoryEnabled, setMemoryEnabled] = useState(profile?.memoryEnabled !== false);
  const [referenceHistory, setReferenceHistory] = useState(profile?.referenceHistory !== false);
  const [name, setName] = useState(profile?.name || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const isMobile = useIsMobile();

  const plan = tier || "free";

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.style.colorScheme = "light";
      root.setAttribute("data-theme", "light");
    } else if (theme === "auto") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const resolved = prefersDark ? "dark" : "light";
      root.style.colorScheme = resolved;
      root.setAttribute("data-theme", resolved);
    } else {
      root.style.colorScheme = "dark";
      root.setAttribute("data-theme", "dark");
    }
  }, [theme]);

  function save(updates: Record<string, any>) {
    updateProfile(updates);
  }

  function handleLanguageChange(code: string) {
    setLang(code as Language);
    setLanguage(code as Language);
    save({ language: code });
    onLanguageChange(code as Language);
  }

  function handleThemeChange(t: "auto" | "light" | "dark") {
    setTheme(t);
    save({ theme: t });
  }

  function handleNameBlur() {
    if (name.trim() && name.trim() !== profile?.name) {
      save({ name: name.trim() });
      onNameChange(name.trim());
    }
  }

  function savePersonalization() {
    save({ aboutYou, customInstructions });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    fontSize: 13,
    color: Z200,
    background: "rgba(255,255,255,0.02)",
    border: `1px solid ${Z800}`,
    borderRadius: 10,
    outline: "none",
    transition: "border-color 180ms ease-out",
    lineHeight: 1.5,
    fontFamily: "var(--font-body)",
    boxSizing: "border-box" as const,
  };

  /* ═══ Section renderers ═══ */

  const renderGeneral = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SectionHeader
        title="General"
        description="Language, input behavior, and product preferences."
      />

      {/* Language */}
      <SettingRow label="Language" description="Interface and response language">
        <select
          value={lang}
          onChange={e => handleLanguageChange(e.target.value)}
          style={{
            padding: "7px 30px 7px 12px", borderRadius: 8,
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${Z800}`,
            color: Z200, fontSize: 12,
            appearance: "none", cursor: "pointer",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23${Z500.slice(1)}' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            outline: "none",
          }}
        >
          {ALL_LANGUAGES.map(l => (
            <option key={l.code} value={l.code}>{l.nativeName}</option>
          ))}
        </select>
      </SettingRow>

      {/* Web search */}
      <SettingRow label="Web search" description="Allow Signux to search the web for current information">
        <ToggleSwitch checked={webSearch} onChange={v => { setWebSearch(v); save({ webSearchEnabled: v }); }} />
      </SettingRow>

      {/* Memory */}
      <SettingRow label="Memory" description="Remember information across conversations">
        <ToggleSwitch checked={memoryEnabled} onChange={v => { setMemoryEnabled(v); save({ memoryEnabled: v }); }} />
      </SettingRow>

      {/* Reference history */}
      <SettingRow label="Reference history" description="Use previous conversations for context">
        <ToggleSwitch checked={referenceHistory} onChange={v => { setReferenceHistory(v); save({ referenceHistory: v }); }} />
      </SettingRow>

      <Divider />

      {/* Personalization */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: Z200, marginBottom: 4 }}>
          Your context
        </div>
        <div style={{ fontSize: 11.5, color: Z600, marginBottom: 10, lineHeight: 1.4 }}>
          Help Signux understand your role and business for better answers.
        </div>
        <textarea
          value={aboutYou}
          onChange={e => setAboutYou(e.target.value)}
          placeholder="E.g., I'm a Brazilian entrepreneur importing electronics from China, based in Seoul."
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
          {["Founder", "Investor", "Executive", "Freelancer"].map(role => (
            <button key={role} onClick={() => setAboutYou(prev => prev ? `${prev}\nRole: ${role}` : `Role: ${role}`)} style={{
              padding: "3px 8px", borderRadius: 4,
              border: `1px dashed ${Z800}`,
              background: "transparent", color: Z600,
              fontSize: 10, cursor: "pointer",
              transition: "color 180ms ease-out",
            }}
              onMouseEnter={e => e.currentTarget.style.color = Z400}
              onMouseLeave={e => e.currentTarget.style.color = Z600}
            >
              + {role}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: Z200, marginBottom: 4 }}>
          Response preferences
        </div>
        <div style={{ fontSize: 11.5, color: Z600, marginBottom: 10, lineHeight: 1.4 }}>
          How should Signux communicate with you?
        </div>
        <textarea
          value={customInstructions}
          onChange={e => setCustomInstructions(e.target.value)}
          placeholder="E.g., Always respond in Portuguese. Be direct. Include cost breakdowns."
          rows={2}
          style={{ ...inputStyle, resize: "vertical" }}
        />
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
          {["Be concise", "Include numbers", "Respond in Portuguese", "Skip disclaimers"].map(pref => (
            <button key={pref} onClick={() => setCustomInstructions(prev => prev ? `${prev}\n${pref}` : pref)} style={{
              padding: "3px 8px", borderRadius: 4,
              border: `1px dashed ${Z800}`,
              background: "transparent", color: Z600,
              fontSize: 10, cursor: "pointer",
              transition: "color 180ms ease-out",
            }}
              onMouseEnter={e => e.currentTarget.style.color = Z400}
              onMouseLeave={e => e.currentTarget.style.color = Z600}
            >
              + {pref}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={savePersonalization} style={{
          padding: "8px 20px", borderRadius: 8,
          background: saved ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.08)",
          border: saved ? "1px solid rgba(34,197,94,0.2)" : `1px solid ${Z800}`,
          color: saved ? "#22c55e" : Z200,
          fontSize: 12, fontWeight: 500, cursor: "pointer",
          transition: "all 180ms ease-out",
        }}>
          {saved ? "Saved" : "Save preferences"}
        </button>
      </div>

      <Divider />

      {/* Shortcuts */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: Z200, marginBottom: 10 }}>
          Keyboard shortcuts
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "New conversation", key: "\u2318 N" },
            { label: "Search conversations", key: "\u2318 K" },
            { label: "Toggle sidebar", key: "\u2318 B" },
            { label: "Settings", key: "\u2318 ," },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: Z500 }}>{s.label}</span>
              <kbd style={{
                padding: "3px 8px", borderRadius: 5,
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${Z800}`,
                fontSize: 10, fontFamily: "var(--font-mono)",
                color: Z500,
              }}>
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SectionHeader
        title="Appearance"
        description="Choose how Signux appears across the product."
      />

      {/* Theme */}
      <div style={{
        padding: "16px", borderRadius: 12,
        background: "rgba(255,255,255,0.015)",
        border: `1px solid ${Z800}`,
      }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: Z200, marginBottom: 4 }}>
          Theme
        </div>
        <div style={{ fontSize: 11.5, color: Z600, marginBottom: 14, lineHeight: 1.4 }}>
          Dark is the product operating mode. Auto follows your system preference.
        </div>
        <SegmentedControl
          options={[
            { id: "auto" as const, label: "Auto", icon: <Monitor size={13} /> },
            { id: "light" as const, label: "Light", icon: <Sun size={13} /> },
            { id: "dark" as const, label: "Dark", icon: <Moon size={13} /> },
          ]}
          value={theme}
          onChange={handleThemeChange}
        />
      </div>
    </div>
  );

  const renderUsage = () => {
    const usageItems = [
      { label: "Messages today", used: usage?.chat_today || 0, limit: limits?.chat_daily || 5, color: "#C8A84E" },
      { label: "Simulations", used: usage?.simulations_month || 0, limit: limits?.simulate_monthly || 1, color: Z200 },
      { label: "Compete", used: usage?.researches_month || 0, limit: limits?.research_monthly || 0, color: "#ef4444" },
      { label: "Protect", used: usage?.protect_month || 0, limit: limits?.protect_monthly || 0, color: "#8B5CF6" },
      { label: "Hire", used: usage?.hire_month || 0, limit: limits?.hire_monthly || 0, color: "#3B82F6" },
    ].filter(item => item.limit > 0 || item.used > 0);

    const planLabel = plan === "pro" ? "Pro" : plan === "max" ? "Max" : plan === "founding" ? "Founding" : "Free";

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <SectionHeader
          title="Usage"
          description="View your current usage and product limits."
        />

        {/* Current plan summary */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8,
          marginBottom: 8,
        }}>
          {[
            { label: "Plan", value: planLabel },
            { label: "Messages/day", value: limits?.chat_daily === 0 ? "\u221E" : String(limits?.chat_daily || 5) },
            { label: "Simulations/mo", value: limits?.simulate_monthly === 0 ? "\u221E" : String(limits?.simulate_monthly || 1) },
          ].map((stat, i) => (
            <div key={i} style={{
              padding: "14px 12px", borderRadius: 10, textAlign: "center",
              border: `1px solid ${Z800}`,
              background: "rgba(255,255,255,0.015)",
            }}>
              <div style={{
                fontSize: 20, fontWeight: 600, color: Z200,
                fontFamily: "var(--font-mono)", lineHeight: 1,
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 10, color: Z600, marginTop: 4, fontFamily: "var(--font-mono)", letterSpacing: 0.3 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <Divider />

        {/* Progress bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {usageItems.map((item, i) => (
            <div key={i}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                fontSize: 12, marginBottom: 6,
              }}>
                <span style={{ color: Z400 }}>{item.label}</span>
                <span style={{ color: Z600, fontFamily: "var(--font-mono)", fontSize: 11 }}>
                  {item.used} / {item.limit === 0 ? "\u221E" : item.limit}
                </span>
              </div>
              <div style={{
                height: 3, borderRadius: 2,
                background: Z800,
              }}>
                <div style={{
                  height: "100%", borderRadius: 2,
                  background: item.color,
                  width: item.limit > 0
                    ? `${Math.min((item.used / item.limit) * 100, 100)}%`
                    : "3%",
                  transition: "width 500ms ease",
                }} />
              </div>
            </div>
          ))}
        </div>

        {plan === "free" && (
          <>
            <Divider />
            <div style={{
              padding: "14px 16px", borderRadius: 10,
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${Z800}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 12, color: Z500 }}>
                Need more capacity?
              </span>
              <a href="/pricing" style={{
                padding: "6px 16px", borderRadius: 6,
                background: "rgba(255,255,255,0.08)", border: `1px solid ${Z800}`,
                color: Z200, fontSize: 11, fontWeight: 500,
                textDecoration: "none",
                transition: "all 180ms ease-out",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              >
                View plans
              </a>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderAccount = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SectionHeader
        title="Account"
        description="Manage your identity and authentication."
      />

      {/* Profile fields */}
      <div style={{
        padding: 16, borderRadius: 12,
        background: "rgba(255,255,255,0.015)",
        border: `1px solid ${Z800}`,
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        <div>
          <label style={{ fontSize: 11, color: Z600, display: "block", marginBottom: 5 }}>Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={handleNameBlur}
            placeholder="Your name"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, color: Z600, display: "block", marginBottom: 5 }}>Email</label>
          <input
            type="email"
            value={profile?.email || ""}
            disabled
            style={{
              ...inputStyle,
              color: Z600,
              cursor: "not-allowed",
              opacity: 0.7,
            }}
          />
        </div>
      </div>

      <Divider />

      {/* Sign out */}
      <ActionRow
        icon={<ExternalLink size={14} />}
        label="Sign out"
        description="Sign out of your Signux account"
        onClick={() => { window.location.href = "/login"; }}
      />

      <Divider />

      {/* Danger zone */}
      <div>
        <div style={{
          fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 500,
          letterSpacing: 1.2, color: Z600, textTransform: "uppercase",
          marginBottom: 10,
        }}>
          Danger zone
        </div>
        <div style={{
          padding: "14px 16px", borderRadius: 10,
          border: "1px solid rgba(239,68,68,0.1)",
          background: "rgba(239,68,68,0.02)",
        }}>
          {!showDeleteConfirm ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: Z200 }}>Delete account</div>
                <div style={{ fontSize: 11, color: Z600, marginTop: 2 }}>Permanently remove your account and all data.</div>
              </div>
              <button onClick={() => setShowDeleteConfirm(true)} style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "7px 14px", borderRadius: 7,
                border: "1px solid rgba(239,68,68,0.15)",
                background: "transparent", color: "#ef4444",
                fontSize: 12, fontWeight: 500, cursor: "pointer",
                transition: "all 180ms ease-out",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <Trash2 size={12} />
                Delete
              </button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 12, marginTop: 0, lineHeight: 1.5 }}>
                This will permanently delete your account, all conversations, analyses, and data. This cannot be undone.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => {
                  localStorage.clear();
                  window.location.href = "/onboarding";
                }} style={{
                  padding: "7px 16px", borderRadius: 7,
                  background: "#ef4444", color: "#fff",
                  fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                }}>
                  Yes, delete everything
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} style={{
                  padding: "7px 16px", borderRadius: 7,
                  background: "transparent", color: Z400,
                  fontSize: 12, border: `1px solid ${Z800}`, cursor: "pointer",
                }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderBilling = () => {
    const planLabel = plan === "pro" ? "Pro" : plan === "max" ? "Max" : plan === "founding" ? "Founding" : "Free";
    const planPrice = plan === "pro" ? "$29/month" : plan === "max" ? "$99/month" : plan === "founding" ? "Founding" : "Free";

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <SectionHeader
          title="Billing"
          description="Manage your plan and billing details."
        />

        {/* Current plan */}
        <div style={{
          padding: 20, borderRadius: 12,
          background: "rgba(255,255,255,0.015)",
          border: `1px solid ${Z800}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: Z200 }}>{planLabel}</span>
                {plan !== "free" && (
                  <span style={{
                    padding: "2px 8px", borderRadius: 4, fontSize: 9,
                    background: "rgba(255,255,255,0.06)", color: Z400,
                    fontWeight: 600, letterSpacing: 0.5,
                    fontFamily: "var(--font-mono)", textTransform: "uppercase",
                  }}>
                    Active
                  </span>
                )}
              </div>
              <span style={{ fontSize: 12, color: Z600 }}>{planPrice}</span>
            </div>
            {plan === "free" ? (
              <a href="/pricing" style={{
                padding: "8px 18px", borderRadius: 8,
                background: "rgba(255,255,255,0.08)", border: `1px solid ${Z800}`,
                color: Z200, fontSize: 12, fontWeight: 500,
                textDecoration: "none",
                transition: "all 180ms ease-out",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
              >
                Upgrade
              </a>
            ) : (
              <button onClick={() => { window.location.href = "/pricing"; }} style={{
                padding: "8px 18px", borderRadius: 8,
                border: `1px solid ${Z800}`,
                background: "transparent", color: Z400,
                fontSize: 12, cursor: "pointer",
                transition: "all 180ms ease-out",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = Z700; e.currentTarget.style.color = Z200; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = Z800; e.currentTarget.style.color = Z400; }}
              >
                Manage plan
              </button>
            )}
          </div>
        </div>

        <Divider />

        {/* Invoice history placeholder */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: Z200, marginBottom: 4 }}>
            Invoices
          </div>
          <div style={{ fontSize: 11.5, color: Z600, marginBottom: 14, lineHeight: 1.4 }}>
            Past invoices and payment receipts.
          </div>
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "32px 24px", borderRadius: 10,
            border: `1px dashed ${Z800}`,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 13, color: Z500, marginBottom: 2 }}>No invoices yet</div>
            <div style={{ fontSize: 11.5, color: Z600 }}>Invoices will appear here after your first billing cycle.</div>
          </div>
        </div>
      </div>
    );
  };

  const renderNotifications = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SectionHeader
        title="Notifications"
        description="Control how Signux communicates with you."
      />

      <SettingRow label="Product updates" description="New features, improvements, and announcements">
        <ToggleSwitch checked={true} onChange={() => {}} />
      </SettingRow>

      <SettingRow label="Simulation completed" description="Get notified when a simulation finishes processing">
        <ToggleSwitch checked={true} onChange={() => {}} />
      </SettingRow>

      <SettingRow label="Billing notices" description="Payment confirmations and subscription changes">
        <ToggleSwitch checked={true} onChange={() => {}} />
      </SettingRow>

      <SettingRow label="Account alerts" description="Security events and important account activity">
        <ToggleSwitch checked={true} onChange={() => {}} />
      </SettingRow>
    </div>
  );

  const renderPrivacy = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SectionHeader
        title="Privacy"
        description="Your data, your control."
      />

      {/* Data handling */}
      <div style={{
        padding: 16, borderRadius: 12,
        background: "rgba(255,255,255,0.015)",
        border: `1px solid ${Z800}`,
      }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: Z200, marginBottom: 8 }}>
          How we handle your data
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            "Your simulations and analyses are private to your account.",
            "We do not sell or share your data with third parties.",
            "Conversations are encrypted in transit and at rest.",
            "You can export or delete your data at any time.",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <div style={{
                width: 4, height: 4, borderRadius: "50%",
                background: Z700, marginTop: 6, flexShrink: 0,
              }} />
              <span style={{ fontSize: 12.5, color: Z500, lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* Data actions */}
      <ActionRow
        icon={<Download size={14} />}
        label="Export my data"
        description="Download your profile, preferences, and conversation history"
        onClick={() => {
          const data = JSON.stringify(getProfile(), null, 2);
          const blob = new Blob([data], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = "signux-data.json"; a.click();
          URL.revokeObjectURL(url);
        }}
      />

      <Divider />

      {/* Legal links */}
      <ActionRow
        icon={<ExternalLink size={14} />}
        label="Terms of Service"
        description="Read our terms and conditions"
        href="/terms"
      />

      <ActionRow
        icon={<ExternalLink size={14} />}
        label="Privacy Policy"
        description="How we collect, use, and protect your information"
        href="/terms"
      />
    </div>
  );

  const renderHelp = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SectionHeader
        title="Help"
        description="Get support, learn more, or share feedback."
      />

      <ActionRow
        icon={<Mail size={14} />}
        label="Contact support"
        description="Reach our team for account or product questions"
        href="mailto:support@signux.ai"
        external
      />

      <ActionRow
        icon={<MessageSquare size={14} />}
        label="Report an issue"
        description="Something broken? Let us know"
        href="https://github.com/anthropics/claude-code/issues"
        external
      />

      <ActionRow
        icon={<HelpCircle size={14} />}
        label="Product guide"
        description="Learn how to get the most out of Signux"
        href="/use-cases"
      />

      <Divider />

      <div style={{
        padding: 16, borderRadius: 12,
        background: "rgba(255,255,255,0.015)",
        border: `1px solid ${Z800}`,
      }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: Z200, marginBottom: 8 }}>
          About Signux
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: Z600 }}>Version</span>
            <span style={{ fontSize: 12, color: Z500, fontFamily: "var(--font-mono)" }}>1.0.0</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: Z600 }}>Plan</span>
            <span style={{ fontSize: 12, color: Z500, fontFamily: "var(--font-mono)" }}>
              {plan === "pro" ? "Pro" : plan === "max" ? "Max" : plan === "founding" ? "Founding" : "Free"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const RENDER_MAP: Record<Section, () => React.ReactNode> = {
    general: renderGeneral,
    appearance: renderAppearance,
    usage: renderUsage,
    account: renderAccount,
    billing: renderBilling,
    notifications: renderNotifications,
    privacy: renderPrivacy,
    help: renderHelp,
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 100,
          animation: "fadeIn 0.15s ease",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed",
        ...(isMobile
          ? { inset: 0 }
          : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
        ),
        zIndex: 101,
        width: isMobile ? "100%" : "95vw",
        maxWidth: isMobile ? "100%" : 720,
        maxHeight: isMobile ? "100vh" : "85vh",
        height: isMobile ? "100vh" : undefined,
        borderRadius: isMobile ? 0 : 14,
        background: Z950,
        border: isMobile ? "none" : `1px solid ${Z800}`,
        boxShadow: isMobile ? "none" : "0 24px 48px rgba(0,0,0,0.5)",
        display: "flex", flexDirection: "column", overflow: "hidden",
        animation: isMobile ? "none" : "scaleIn 0.15s ease-out",
      }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: isMobile ? "14px 16px" : "16px 24px",
          borderBottom: `1px solid ${Z800}`,
          flexShrink: 0,
        }}>
          <div>
            <span style={{
              fontSize: 15, fontWeight: 500,
              color: Z200, letterSpacing: 0.1,
            }}>
              Settings
            </span>
            {!isMobile && (
              <span style={{ fontSize: 12, color: Z600, marginLeft: 10 }}>
                Manage your product preferences
              </span>
            )}
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 7,
            border: `1px solid ${Z800}`,
            background: "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: Z600,
            transition: "all 180ms ease-out",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = Z700; e.currentTarget.style.color = Z400; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = Z800; e.currentTarget.style.color = Z600; }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{
          flex: 1, minHeight: 0, display: "flex",
          flexDirection: isMobile ? "column" : "row",
          overflow: "hidden",
        }}>
          {/* Nav */}
          {isMobile ? (
            /* Mobile: horizontal scrolling tabs */
            <div style={{
              display: "flex", gap: 0,
              padding: "0 16px",
              borderBottom: `1px solid ${Z800}`,
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              flexShrink: 0,
            }}>
              {SECTIONS.map(s => (
                <button key={s.id} onClick={() => setSection(s.id)} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "10px 14px",
                  background: "transparent", border: "none",
                  borderBottom: `2px solid ${section === s.id ? Z400 : "transparent"}`,
                  color: section === s.id ? Z200 : Z600,
                  fontSize: 12, fontWeight: section === s.id ? 500 : 400,
                  cursor: "pointer", transition: "all 180ms ease-out",
                  whiteSpace: "nowrap", marginBottom: -1,
                }}>
                  {s.label}
                </button>
              ))}
            </div>
          ) : (
            /* Desktop: left sidebar nav */
            <div style={{
              width: 180, flexShrink: 0,
              borderRight: `1px solid ${Z800}`,
              padding: "12px 8px",
              overflowY: "auto",
            }}>
              {SECTIONS.map(s => {
                const active = s.id === section;
                return (
                  <button key={s.id} onClick={() => setSection(s.id)} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    width: "100%", padding: "8px 10px",
                    borderRadius: 7, border: "none",
                    background: active ? "rgba(255,255,255,0.06)" : "transparent",
                    color: active ? Z200 : Z500,
                    fontSize: 12.5, fontWeight: active ? 500 : 400,
                    cursor: "pointer",
                    transition: "all 180ms ease-out",
                    textAlign: "left",
                    marginBottom: 2,
                  }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = Z400; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = Z500; } }}
                  >
                    <span style={{ color: active ? Z400 : Z600, flexShrink: 0 }}>{s.icon}</span>
                    {s.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Content */}
          <div style={{
            flex: 1, minWidth: 0, minHeight: 0,
            overflowY: "auto",
            padding: isMobile ? "16px 16px 32px" : "20px 24px 24px",
            paddingBottom: isMobile ? "calc(32px + var(--safe-bottom, 0px))" : 24,
          }}>
            {RENDER_MAP[section]()}
          </div>
        </div>
      </div>
    </>
  );
}
