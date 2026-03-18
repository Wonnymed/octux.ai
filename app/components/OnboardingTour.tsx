"use client";
import { useState, useEffect, useRef } from "react";
import { t } from "../lib/i18n";

const TOUR_COMPLETED_KEY = "signux_tour_completed";

export function isTourCompleted(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(TOUR_COMPLETED_KEY) === "true";
}

export function completeTour() {
  localStorage.setItem(TOUR_COMPLETED_KEY, "true");
}

export function resetTour() {
  localStorage.removeItem(TOUR_COMPLETED_KEY);
}

interface TourStep {
  target: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
  recommended?: boolean;
  openSidebar?: boolean;
}

type OnboardingTourProps = {
  onComplete: () => void;
  onOpenSidebar: () => void;
  onCloseSidebar: () => void;
};

const STEPS: TourStep[] = [
  {
    target: "chat-input",
    title: "tour.step1.title",
    description: "tour.step1.desc",
    position: "top",
  },
  {
    target: "sidebar-toggle",
    title: "tour.step2.title",
    description: "tour.step2.desc",
    position: "right",
  },
  {
    target: "simulate-mode",
    title: "tour.step3.title",
    description: "tour.step3.desc",
    position: "right",
    recommended: true,
    openSidebar: true,
  },
  {
    target: "intel-mode",
    title: "tour.step4.title",
    description: "tour.step4.desc",
    position: "right",
  },
  {
    target: "profile-settings",
    title: "tour.step5.title",
    description: "tour.step5.desc",
    position: "top",
  },
];

export default function OnboardingTour({ onComplete, onOpenSidebar, onCloseSidebar }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const highlightRef = useRef<DOMRect | null>(null);
  const [, forceUpdate] = useState(0);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);
  const sidebarOpenedByTour = useRef(false);

  const totalSteps = STEPS.length;
  const step = STEPS[currentStep];
  const isLast = currentStep === totalSteps - 1;

  // Initial fade in
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Position on step change — depends ONLY on currentStep
  useEffect(() => {
    if (!STEPS[currentStep]) return;
    const s = STEPS[currentStep];

    function position() {
      const el = document.querySelector(`[data-tour="${s.target}"]`);
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const pad = 8;
      highlightRef.current = {
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
        x: rect.x - pad,
        y: rect.y - pad,
        bottom: rect.bottom + pad,
        right: rect.right + pad,
        toJSON: () => {},
      };

      const popW = 320;
      const popH = 200;
      const gap = 12;
      const isMobile = window.innerWidth < 768;
      const pos = isMobile ? "bottom" : s.position;

      let top = 0;
      let left = 0;

      switch (pos) {
        case "top":
          top = rect.top - pad - popH - gap;
          left = rect.left + rect.width / 2 - popW / 2;
          break;
        case "bottom":
          top = rect.bottom + pad + gap;
          left = rect.left + rect.width / 2 - popW / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2 - popH / 2;
          left = rect.left - pad - popW - gap;
          break;
        case "right":
          top = rect.top + rect.height / 2 - popH / 2;
          left = rect.right + pad + gap;
          break;
      }

      left = Math.max(12, Math.min(left, window.innerWidth - popW - 12));
      top = Math.max(12, Math.min(top, window.innerHeight - popH - 12));

      setPopoverPos({ top, left });
      forceUpdate(n => n + 1);

      // Refine after popover renders with actual height
      requestAnimationFrame(() => {
        if (!popoverRef.current) return;
        const popRect = popoverRef.current.getBoundingClientRect();

        let refinedTop = top;
        let refinedLeft = left;

        switch (pos) {
          case "top":
            refinedTop = rect.top - pad - popRect.height - gap;
            refinedLeft = rect.left + rect.width / 2 - popRect.width / 2;
            break;
          case "bottom":
            refinedTop = rect.bottom + pad + gap;
            refinedLeft = rect.left + rect.width / 2 - popRect.width / 2;
            break;
          case "left":
            refinedTop = rect.top + rect.height / 2 - popRect.height / 2;
            refinedLeft = rect.left - pad - popRect.width - gap;
            break;
          case "right":
            refinedTop = rect.top + rect.height / 2 - popRect.height / 2;
            refinedLeft = rect.right + pad + gap;
            break;
        }

        refinedLeft = Math.max(12, Math.min(refinedLeft, window.innerWidth - popRect.width - 12));
        refinedTop = Math.max(12, Math.min(refinedTop, window.innerHeight - popRect.height - 12));

        setPopoverPos({ top: refinedTop, left: refinedLeft });
      });
    }

    if (s.openSidebar) {
      onOpenSidebar();
      sidebarOpenedByTour.current = true;
      const timer = setTimeout(position, 350);
      return () => clearTimeout(timer);
    } else {
      position();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Reposition on resize
  useEffect(() => {
    const handler = () => {
      const s = STEPS[currentStep];
      if (!s) return;
      const el = document.querySelector(`[data-tour="${s.target}"]`);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pad = 8;
      highlightRef.current = {
        top: rect.top - pad, left: rect.left - pad,
        width: rect.width + pad * 2, height: rect.height + pad * 2,
        x: rect.x - pad, y: rect.y - pad,
        bottom: rect.bottom + pad, right: rect.right + pad,
        toJSON: () => {},
      };
      forceUpdate(n => n + 1);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [currentStep]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        finish();
      } else if (e.key === "Enter" || e.key === " ") {
        if (document.activeElement?.tagName !== "TEXTAREA" && document.activeElement?.tagName !== "INPUT") {
          e.preventDefault();
          handleNext();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Auto-close if user starts typing
  useEffect(() => {
    const handler = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
        finish();
      }
    };
    window.addEventListener("focus", handler, true);
    return () => window.removeEventListener("focus", handler, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleNext() {
    if (isLast) {
      finish();
      return;
    }
    setFading(true);
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setFading(false);
    }, 150);
  }

  function finish() {
    completeTour();
    setVisible(false);
    if (sidebarOpenedByTour.current) {
      onCloseSidebar();
    }
    setTimeout(onComplete, 200);
  }

  const highlight = highlightRef.current;
  if (!step || !highlight) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.2s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* Overlay with spotlight cutout */}
      <div
        style={{
          position: "absolute",
          top: highlight.top,
          left: highlight.left,
          width: highlight.width,
          height: highlight.height,
          borderRadius: "var(--radius-md)",
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
          transition: "all 0.3s ease",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />

      {/* Clickable backdrop areas */}
      <div style={{ position: "absolute", inset: 0, zIndex: 9998 }} />

      {/* Popover */}
      <div
        ref={popoverRef}
        style={{
          position: "absolute",
          top: popoverPos.top,
          left: popoverPos.left,
          maxWidth: 320,
          width: "calc(100vw - 24px)",
          background: "var(--bg-primary)",
          border: "1px solid var(--border-primary)",
          borderRadius: "var(--radius-md)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          padding: 20,
          zIndex: 10000,
          opacity: fading ? 0 : 1,
          transition: "opacity 0.15s ease",
        }}
      >
        {/* Recommended badge */}
        {step.recommended && (
          <span style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 500,
            color: "var(--accent)",
            background: "var(--accent-bg)",
            borderRadius: "var(--radius-sm)",
            padding: "2px 8px",
            marginBottom: 8,
          }}>
            {t("tour.step3.recommended")}
          </span>
        )}

        {/* Title */}
        <div style={{
          fontSize: 15,
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: 6,
        }}>
          {t(step.title)}
        </div>

        {/* Description */}
        <div style={{
          fontSize: 14,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          marginBottom: 16,
        }}>
          {t(step.description)}
        </div>

        {/* Footer */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{
            fontSize: 12,
            color: "var(--text-tertiary)",
            fontFamily: "var(--font-mono)",
          }}>
            {t("tour.step_of", { current: String(currentStep + 1), total: String(totalSteps) })}
          </span>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={finish}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-tertiary)",
                fontSize: 13,
                cursor: "pointer",
                padding: "8px 12px",
              }}
            >
              {t("tour.skip")}
            </button>
            <button
              onClick={handleNext}
              style={{
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-sm)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                padding: "8px 16px",
              }}
            >
              {isLast ? t("tour.finish") : t("tour.next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
