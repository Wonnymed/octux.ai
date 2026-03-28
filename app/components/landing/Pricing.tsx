"use client";

import { useState } from "react";
import { Check } from "lucide-react";

type Plan = {
  name: string;
  monthly: number;
  annual: number;
  features: string[];
  buttonLabel: string;
  featured: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Free",
    monthly: 0,
    annual: 0,
    features: [
      "2 simulation tokens/month",
      "Swarm mode",
      "Basic verdict + chat",
    ],
    buttonLabel: "Get started free",
    featured: false,
  },
  {
    name: "Pro",
    monthly: 29,
    annual: 23,
    features: [
      "30 simulation tokens/month",
      "Specialist + advanced modes",
      "Full verdict + citations",
      "PDF export & cross-sim memory",
    ],
    buttonLabel: "Start Pro",
    featured: true,
  },
  {
    name: "Max",
    monthly: 99,
    annual: 79,
    features: [
      "120 simulation tokens/month",
      "Everything in Pro",
      "Priority processing",
      "API & custom agents (roadmap)",
    ],
    buttonLabel: "Go Max",
    featured: false,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  return (
    <section
      style={{
        width: "100%",
        background: "#FFFFFF",
        padding: "96px 24px",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 300,
            color: "var(--text-primary)",
            lineHeight: 1.3,
            margin: 0,
          }}
        >
          Start free. Scale when ready.
        </h2>
        <p
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: "var(--text-tertiary)",
            fontStyle: "italic",
            marginTop: 12,
          }}
        >
          $50K McKinsey engagement in 60 seconds — starting free.
        </p>
      </div>

      {/* Toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          marginBottom: 48,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: annual ? 400 : 500,
            color: annual ? "var(--text-tertiary)" : "var(--text-primary)",
            transition: "all 150ms ease-out",
          }}
        >
          Monthly
        </span>
        <button
          onClick={() => setAnnual(!annual)}
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            border: "none",
            background: annual ? "#1A1815" : "var(--surface-3)",
            cursor: "pointer",
            position: "relative",
            transition: "background 150ms ease-out",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#FFFFFF",
              position: "absolute",
              top: 3,
              left: annual ? 23 : 3,
              transition: "left 150ms ease-out",
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
            }}
          />
        </button>
        <span
          style={{
            fontSize: 13,
            fontWeight: annual ? 500 : 400,
            color: annual ? "var(--text-primary)" : "var(--text-tertiary)",
            transition: "all 150ms ease-out",
          }}
        >
          Annual{" "}
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#1A1815",
              opacity: annual ? 1 : 0.6,
            }}
          >
            save 20%
          </span>
        </span>
      </div>

      {/* Cards */}
      <div className="pricing-grid">
        {PLANS.map((plan) => {
          const isHovered = hoveredCard === plan.name;
          const price = annual ? plan.annual : plan.monthly;
          const showStrike = annual && plan.monthly > 0;

          return (
            <div
              key={plan.name}
              onMouseEnter={() => setHoveredCard(plan.name)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                padding: 32,
                borderRadius: 12,
                border: plan.featured
                  ? "2px solid #1A1815"
                  : `1px solid ${isHovered ? "var(--border-strong)" : "var(--border-default)"}`,
                background: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                boxShadow: plan.featured
                  ? "0 8px 32px rgba(124,58,237,0.12)"
                  : "none",
                transition: "border-color 150ms ease-out",
              }}
            >
              {/* Badge */}
              {plan.featured && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "4px 14px",
                    borderRadius: "var(--radius-full)",
                    background: "#1A1815",
                    color: "#FFFFFF",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: 0.3,
                    whiteSpace: "nowrap",
                  }}
                >
                  Most Popular
                </div>
              )}

              {/* Plan name */}
              <p
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                {plan.name}
              </p>

              {/* Price */}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 4,
                  marginTop: 16,
                  marginBottom: 24,
                }}
              >
                {showStrike && (
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 400,
                      color: "var(--text-disabled)",
                      textDecoration: "line-through",
                      marginRight: 4,
                    }}
                  >
                    ${plan.monthly}
                  </span>
                )}
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    lineHeight: 1,
                  }}
                >
                  ${price}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 400,
                    color: "var(--text-tertiary)",
                  }}
                >
                  /mo
                </span>
              </div>

              {/* Features */}
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  flex: 1,
                }}
              >
                {plan.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      fontSize: 14,
                      fontWeight: 400,
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                    }}
                  >
                    <Check
                      size={15}
                      strokeWidth={2}
                      style={{
                        color: plan.featured ? "#1A1815" : "var(--icon-secondary)",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button
                onMouseEnter={() => setHoveredBtn(plan.name)}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  marginTop: 28,
                  transition: "all 150ms ease-out",
                  ...(plan.featured
                    ? {
                        background:
                          hoveredBtn === plan.name ? "#1A1815" : "#1A1815",
                        color: "#FFFFFF",
                        border: "none",
                      }
                    : {
                        background: "transparent",
                        color:
                          hoveredBtn === plan.name
                            ? "#1A1815"
                            : "var(--text-primary)",
                        border: `1px solid ${hoveredBtn === plan.name ? "#1A1815" : "var(--border-default)"}`,
                      }),
                }}
              >
                {plan.buttonLabel}
              </button>
            </div>
          );
        })}
      </div>

      {/* Anchor copy */}
      <p
        style={{
          textAlign: "center",
          fontSize: 13,
          fontWeight: 400,
          fontStyle: "italic",
          color: "var(--text-tertiary)",
          marginTop: 40,
        }}
      >
        McKinsey charges $500/hour per consultant. Sukgo runs 10 for $0.30.
      </p>

      <style>{`
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 1100px;
          margin: 0 auto;
        }
        @media (max-width: 768px) {
          .pricing-grid {
            grid-template-columns: 1fr;
            max-width: 400px;
          }
        }
      `}</style>
    </section>
  );
}
