"use client";
import { PenSquare, MessageSquare, Zap, Globe, Settings, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { t } from "../lib/i18n";
import { useIsMobile } from "../lib/useIsMobile";
import type { Mode } from "../lib/types";

const HISTORY_PLACEHOLDERS = [
  "sidebar.history.1", "sidebar.history.2", "sidebar.history.3",
  "sidebar.history.4", "sidebar.history.5",
];

function HistorySkeleton() {
  return (
    <div style={{ padding: "0 8px" }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton" style={{ height: 14, marginBottom: 10, width: `${70 - i * 10}%` }} />
      ))}
    </div>
  );
}

function EmptyHistory() {
  return (
    <div className="empty-state" style={{ padding: "24px 12px" }}>
      <MessageCircle size={20} style={{ opacity: 0.4 }} />
      <span>{t("sidebar.empty_history")}</span>
    </div>
  );
}

type SidebarProps = {
  mode: Mode;
  setMode: (m: Mode) => void;
  profileName: string;
  lang: string;
  rates: any;
  onNewConversation: () => void;
  onOpenSettings: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

/* ═══ Shared Content ═══ */
function SidebarContent({
  mode, setMode, profileName, rates, onNewConversation, onOpenSettings, isMobile, onClose,
}: {
  mode: Mode; setMode: (m: Mode) => void; profileName: string; rates: any;
  onNewConversation: () => void; onOpenSettings: () => void; isMobile: boolean; onClose?: () => void;
}) {
  const userInitials = profileName ? profileName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "OP";

  const handleMode = (m: Mode) => {
    setMode(m);
    onClose?.();
  };
  const handleNew = () => { onNewConversation(); onClose?.(); };
  const handleSettings = () => { onOpenSettings(); onClose?.(); };

  return (
    <>
      {/* Logo */}
      <div style={{ padding: "16px 14px 12px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          background: "var(--accent)", display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
        }}>
          S
        </div>
        <span className={isMobile ? undefined : "sidebar-logo-text"} style={{
          fontSize: 13, fontWeight: 600, letterSpacing: "0.1em",
          color: "var(--text-secondary)",
        }}>
          SIGNUX
        </span>
      </div>

      {/* New chat */}
      <div style={{ padding: "0 8px 8px" }}>
        <button
          onClick={handleNew}
          className="sidebar-icon-btn"
          style={{ justifyContent: isMobile ? "flex-start" : "center" }}
          aria-label="New conversation"
        >
          <PenSquare size={18} style={{ flexShrink: 0 }} />
          <span className={isMobile ? undefined : "sidebar-label"} style={{ fontSize: 13 }}>
            {mode === "chat" ? t("sidebar.new_chat") : t("sidebar.new_simulation")}
          </span>
        </button>
      </div>

      <div style={{ height: 1, background: "var(--border-secondary)", margin: "0 12px 8px" }} />

      {/* History */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "0 8px" }}>
        <div className={isMobile ? undefined : "sidebar-label"} style={{
          fontSize: 10, letterSpacing: "0.1em", color: "var(--text-tertiary)",
          textTransform: "uppercase", marginBottom: 6, padding: "0 8px",
        }}>
          {t("common.today")}
        </div>
        {HISTORY_PLACEHOLDERS.slice(0, 2).map(key => (
          <div
            key={key}
            className={`${isMobile ? "" : "sidebar-label "}sidebar-history-item`}
            style={{
              padding: "7px 10px", borderRadius: 6, fontSize: 13,
              color: "var(--text-secondary)", cursor: "pointer",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}
          >
            {t(key)}
          </div>
        ))}
        <div className={isMobile ? undefined : "sidebar-label"} style={{
          fontSize: 10, letterSpacing: "0.1em", color: "var(--text-tertiary)",
          textTransform: "uppercase", marginTop: 14, marginBottom: 6, padding: "0 8px",
        }}>
          {t("common.previous_7_days")}
        </div>
        {HISTORY_PLACEHOLDERS.slice(2).map(key => (
          <div
            key={key}
            className={`${isMobile ? "" : "sidebar-label "}sidebar-history-item`}
            style={{
              padding: "7px 10px", borderRadius: 6, fontSize: 13,
              color: "var(--text-secondary)", cursor: "pointer",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}
          >
            {t(key)}
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div style={{ borderTop: "1px solid var(--border-secondary)", padding: "8px" }}>
        {/* Rates */}
        {rates ? (
          <div className={isMobile ? undefined : "sidebar-label"} style={{
            padding: "4px 10px 8px", fontSize: 10,
            color: "var(--text-tertiary)", fontFamily: "var(--font-mono)",
          }}>
            USD/BRL {rates.USDBRL?.toFixed(2)} · USD/CNY {rates.USDCNY?.toFixed(2)}
          </div>
        ) : (
          <div className={isMobile ? undefined : "sidebar-label"} style={{ padding: "4px 10px 8px" }}>
            <div className="skeleton" style={{ height: 10, width: "80%" }} />
          </div>
        )}

        {/* Mode buttons */}
        {([
          { key: "chat" as Mode, icon: MessageSquare, label: t("sidebar.mode_chat") },
          { key: "simulate" as Mode, icon: Zap, label: t("sidebar.mode_simulate") },
          { key: "intel" as Mode, icon: Globe, label: t("sidebar.mode_intel") },
        ]).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => handleMode(key)}
            data-tour={key === "simulate" ? "simulate-mode" : key === "intel" ? "intel-mode" : undefined}
            className={`sidebar-icon-btn${mode === key ? " active" : ""}`}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            <span className={isMobile ? undefined : "sidebar-label"}>{label}</span>
          </button>
        ))}

        <div style={{ height: 1, background: "var(--border-secondary)", margin: "6px 4px" }} />

        {/* Settings */}
        <button onClick={handleSettings} className="sidebar-icon-btn" aria-label="Settings">
          <Settings size={18} style={{ flexShrink: 0 }} />
          <span className={isMobile ? undefined : "sidebar-label"}>{t("sidebar.settings")}</span>
        </button>

        {/* Profile */}
        <button onClick={handleSettings} data-tour="profile-settings" className="sidebar-icon-btn" style={{ marginTop: 2 }}>
          <div style={{
            width: 24, height: 24, borderRadius: "50%", background: "var(--accent-bg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 600, color: "var(--accent)", flexShrink: 0,
          }}>
            {userInitials}
          </div>
          <span className={isMobile ? undefined : "sidebar-label"} style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>
            {profileName}
          </span>
        </button>
      </div>
    </>
  );
}

export default function Sidebar({
  mode, setMode, profileName, lang, rates,
  onNewConversation, onOpenSettings, mobileOpen, onMobileClose,
}: SidebarProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="bottom-sheet-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onMobileClose}
            />
            <motion.div
              className="bottom-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 300) onMobileClose?.();
              }}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div className="bottom-sheet-handle" />
              <SidebarContent
                mode={mode} setMode={setMode} profileName={profileName}
                rates={rates} onNewConversation={onNewConversation}
                onOpenSettings={onOpenSettings} isMobile onClose={onMobileClose}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <aside className="sidebar-rail">
      <SidebarContent
        mode={mode} setMode={setMode} profileName={profileName}
        rates={rates} onNewConversation={onNewConversation}
        onOpenSettings={onOpenSettings} isMobile={false}
      />
    </aside>
  );
}
