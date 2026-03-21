"use client";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const ROUND_LABELS = [
  "First Impressions",
  "Challenge",
  "Data & Numbers",
  "Worst Case",
  "Best Case",
  "Alliances",
  "Cross-Examination",
  "Revision",
  "Final Arguments",
  "Vote",
];

type RoundTimelineProps = {
  completedRound: number;
  activeRound: number;
  setActiveRound: (r: number) => void;
  currentRoundLoading?: { round: number; label: string; model: string } | null;
  isMobile?: boolean;
};

export default function RoundTimeline({
  completedRound,
  activeRound,
  setActiveRound,
  currentRoundLoading,
  isMobile,
}: RoundTimelineProps) {
  return (
    <div style={{ padding: isMobile ? "12px 8px 8px" : "16px 20px 8px" }}>
      {/* Round dots */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: isMobile ? "flex-start" : "center",
        gap: isMobile ? 2 : 4,
        ...(isMobile ? {
          overflowX: "auto" as const,
          WebkitOverflowScrolling: "touch" as const,
          scrollbarWidth: "none" as const,
          msOverflowStyle: "none" as const,
          paddingBottom: 4,
        } : {}),
      }}>
        {Array.from({ length: 10 }, (_, i) => {
          const roundNum = i + 1;
          const isComplete = roundNum <= completedRound;
          const isCurrent = currentRoundLoading?.round === roundNum;
          const isActive = roundNum === activeRound;

          return (
            <button
              key={i}
              onClick={() => isComplete && setActiveRound(roundNum)}
              title={`R${roundNum}: ${ROUND_LABELS[i]}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                background: "none",
                border: "none",
                cursor: isComplete ? "pointer" : "default",
                opacity: isComplete ? 1 : 0.3,
                padding: isMobile ? "2px 4px" : "2px 6px",
              }}
            >
              <motion.div
                animate={{
                  width: isActive ? 14 : isCurrent ? 10 : 8,
                  height: isActive ? 14 : isCurrent ? 10 : 8,
                }}
                transition={{ duration: 0.2 }}
                style={{
                  borderRadius: "50%",
                  background: isActive
                    ? "#D4AF37"
                    : isCurrent
                    ? "transparent"
                    : isComplete
                    ? (roundNum <= 5 ? "#3B82F6" : "#8B5CF6")
                    : "var(--border-secondary)",
                  border: isCurrent
                    ? "2px solid #D4AF37"
                    : isActive
                    ? "none"
                    : "none",
                  boxShadow: isActive
                    ? "0 0 10px rgba(212,175,55,0.5)"
                    : isCurrent
                    ? "0 0 8px rgba(212,175,55,0.3)"
                    : "none",
                  transition: "all 200ms ease",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isCurrent && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      border: "1.5px solid #D4AF37",
                      borderTopColor: "transparent",
                    }}
                  />
                )}
              </motion.div>
              <span style={{
                fontSize: 8,
                fontFamily: "var(--font-mono)",
                color: isActive ? "#D4AF37" : isComplete ? "var(--text-tertiary)" : "var(--border-secondary)",
                fontWeight: isActive ? 700 : 400,
              }}>
                {roundNum}
              </span>
            </button>
          );
        })}

        {/* Connector lines between dots */}
      </div>

      {/* Active round label + model badge */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 6,
        minHeight: 22,
      }}>
        {currentRoundLoading ? (
          <>
            <Loader2 size={11} style={{ color: "#D4AF37", animation: "spin 1s linear infinite" }} />
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#D4AF37",
              fontFamily: "var(--font-mono)",
            }}>
              Round {currentRoundLoading.round}: {currentRoundLoading.label}
            </span>
            <span style={{
              fontSize: 8,
              padding: "2px 6px",
              borderRadius: 4,
              background: currentRoundLoading.model === "sonnet" ? "rgba(139,92,246,0.1)" : "rgba(59,130,246,0.1)",
              color: currentRoundLoading.model === "sonnet" ? "#8B5CF6" : "#3B82F6",
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              letterSpacing: "0.1em",
            }}>
              {currentRoundLoading.model?.toUpperCase()}
            </span>
          </>
        ) : completedRound > 0 ? (
          <span style={{
            fontSize: 11,
            color: "var(--text-tertiary)",
          }}>
            <span style={{ fontWeight: 600, color: activeRound <= 5 ? "#3B82F6" : "#8B5CF6" }}>
              Round {activeRound}:
            </span>{" "}
            {ROUND_LABELS[activeRound - 1]}
          </span>
        ) : null}
      </div>
    </div>
  );
}
