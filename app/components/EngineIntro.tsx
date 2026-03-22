"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { Zap, Hammer, TrendingUp, UserCheck, Shield, Swords } from "lucide-react";
import { ENGINES, type EngineId } from "../lib/engines";

/* ═══════════════════════════════════════════════════════════════
   EngineIntro — unique first-visit animation for each engine

   Only icon + name + a bespoke visual story per engine.
   No taglines, no chips, no bullets. Pure motion design.
   ═══════════════════════════════════════════════════════════════ */

type EngineIntroProps = {
  engineId: string;
  onComplete: () => void;
};

const NAME_COLOR = "#EDEDEF";

export default function EngineIntro({ engineId, onComplete }: EngineIntroProps) {
  const [active, setActive] = useState(false);
  const [exiting, setExiting] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const storageKey = `signux-intro-${engineId}`;

  const finish = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    localStorage.setItem(storageKey, "seen");
    timersRef.current.forEach(clearTimeout);
    setTimeout(() => onComplete(), 350);
  }, [storageKey, onComplete, exiting]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(storageKey) === "seen") {
      onComplete();
      return;
    }
    setActive(true);
  }, [storageKey, onComplete]);

  if (!active) return null;

  const engine = ENGINES[engineId as EngineId];
  if (!engine) { onComplete(); return null; }

  const color = engine.color;
  const Anim = ANIM_MAP[engineId as EngineId];
  if (!Anim) { onComplete(); return null; }

  return (
    <div
      onClick={finish}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#09090B",
        cursor: "pointer",
        opacity: exiting ? 0 : 1,
        transition: "opacity 350ms ease-out",
      }}
    >
      <Anim color={color} onAutoFinish={finish} />

      {/* Skip — bottom right, whisper quiet */}
      <span
        onClick={(e) => { e.stopPropagation(); finish(); }}
        style={{
          position: "absolute",
          bottom: 16,
          right: 20,
          fontSize: 10,
          fontFamily: "var(--font-mono)",
          letterSpacing: 0.8,
          color: "#71717A",
          opacity: 0.3,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        skip
      </span>

      <EngineIntroStyles />
    </div>
  );
}

/* ═══ Per-engine animation components ═══ */

type AnimProps = { color: string; onAutoFinish: () => void };

/* ─── SIMULATE — 10 dots orbit → converge → Zap pulse ─── */
function SimulateAnim({ color, onAutoFinish }: AnimProps) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 50);    // dots appear
    const t2 = setTimeout(() => setPhase(2), 900);   // dots converge
    const t3 = setTimeout(() => setPhase(3), 1400);  // zap pulse + name
    const t4 = setTimeout(onAutoFinish, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onAutoFinish]);

  const DOT_COUNT = 10;
  const dots = Array.from({ length: DOT_COUNT }, (_, i) => {
    const angle = (i / DOT_COUNT) * Math.PI * 2 - Math.PI / 2;
    const r = 52;
    return { x: Math.cos(angle) * r, y: Math.sin(angle) * r, delay: i * 60 };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <div style={{ position: "relative", width: 120, height: 120 }}>
        {/* Orbital dots */}
        {dots.map((d, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%", top: "50%",
              width: 6, height: 6,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 8px ${color}60`,
              transform: phase >= 2
                ? "translate(-50%, -50%) scale(0)"
                : phase >= 1
                  ? `translate(calc(-50% + ${d.x}px), calc(-50% + ${d.y}px)) scale(1)`
                  : "translate(-50%, -50%) scale(0)",
              opacity: phase >= 2 ? 0 : phase >= 1 ? 1 : 0,
              transition: phase >= 2
                ? `all 400ms cubic-bezier(0.4, 0, 0.2, 1) ${i * 30}ms`
                : `all 350ms ease-out ${d.delay}ms`,
            }}
          />
        ))}

        {/* Central Zap */}
        <div style={{
          position: "absolute",
          left: "50%", top: "50%",
          transform: "translate(-50%, -50%)",
          opacity: phase >= 3 ? 1 : 0.15,
          transition: "opacity 300ms ease-out",
        }}>
          <div style={{
            position: "absolute", inset: -24,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? "scale(1)" : "scale(0.5)",
            transition: "all 400ms ease-out",
          }} />
          <Zap
            size={36}
            strokeWidth={1.5}
            style={{
              color,
              filter: phase >= 3 ? `drop-shadow(0 0 16px ${color}50)` : "none",
              transform: phase >= 3 ? "scale(1)" : "scale(0.85)",
              transition: "all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />
        </div>
      </div>

      {/* Name */}
      <span style={{
        fontSize: 22, fontWeight: 300, letterSpacing: 6,
        color: NAME_COLOR, fontFamily: "var(--font-brand)",
        opacity: phase >= 3 ? 1 : 0,
        transform: phase >= 3 ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 350ms ease-out, transform 350ms ease-out",
      }}>
        SIMULATE
      </span>
    </div>
  );
}

/* ─── BUILD — blocks stack up → Hammer lands ─── */
function BuildAnim({ color, onAutoFinish }: AnimProps) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);   // block 1
    const t2 = setTimeout(() => setPhase(2), 350);   // block 2
    const t3 = setTimeout(() => setPhase(3), 600);   // block 3
    const t4 = setTimeout(() => setPhase(4), 900);   // hammer drops
    const t5 = setTimeout(() => setPhase(5), 1200);  // name
    const t6 = setTimeout(onAutoFinish, 2200);
    return () => { [t1,t2,t3,t4,t5,t6].forEach(clearTimeout); };
  }, [onAutoFinish]);

  const BLOCKS = [
    { w: 48, h: 10, y: 0 },
    { w: 40, h: 10, y: -14 },
    { w: 32, h: 10, y: -28 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <div style={{ position: "relative", width: 120, height: 120, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        {/* Blocks */}
        <div style={{ position: "relative", marginBottom: 8 }}>
          {BLOCKS.map((b, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                bottom: -b.y,
                left: "50%",
                transform: phase > i
                  ? `translateX(-50%) translateY(0)`
                  : `translateX(-50%) translateY(-20px)`,
                width: b.w,
                height: b.h,
                borderRadius: 3,
                background: `${color}${phase > i ? "30" : "00"}`,
                border: `1px solid ${color}${phase > i ? "50" : "00"}`,
                opacity: phase > i ? 1 : 0,
                transition: `all 200ms cubic-bezier(0.34, 1.3, 0.64, 1)`,
              }}
            />
          ))}
        </div>

        {/* Hammer */}
        <div style={{
          position: "absolute",
          top: 8,
          left: "50%",
          transform: phase >= 4
            ? "translate(-50%, 0) rotate(0deg)"
            : "translate(-50%, -20px) rotate(-15deg)",
          opacity: phase >= 4 ? 1 : 0,
          transition: "all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}>
          <Hammer
            size={36}
            strokeWidth={1.5}
            style={{
              color,
              filter: phase >= 4 ? `drop-shadow(0 0 12px ${color}40)` : "none",
            }}
          />
        </div>
      </div>

      <span style={{
        fontSize: 22, fontWeight: 300, letterSpacing: 6,
        color: NAME_COLOR, fontFamily: "var(--font-brand)",
        opacity: phase >= 5 ? 1 : 0,
        transform: phase >= 5 ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 350ms ease-out, transform 350ms ease-out",
      }}>
        BUILD
      </span>
    </div>
  );
}

/* ─── GROW — line accelerates upward → TrendingUp appears ─── */
function GrowAnim({ color, onAutoFinish }: AnimProps) {
  const [phase, setPhase] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 50);    // line starts
    const t2 = setTimeout(() => setPhase(2), 1000);  // icon appears
    const t3 = setTimeout(() => setPhase(3), 1300);  // name
    const t4 = setTimeout(onAutoFinish, 2300);
    return () => { [t1,t2,t3,t4].forEach(clearTimeout); };
  }, [onAutoFinish]);

  useEffect(() => {
    if (phase < 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 120, H = 100;
    canvas.width = W * 2; canvas.height = H * 2;
    ctx.scale(2, 2);

    let frame = 0;
    const totalFrames = 55;
    let rafId: number;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const progress = Math.min(frame / totalFrames, 1);

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";

      const steps = Math.floor(progress * 60);
      for (let i = 0; i <= steps; i++) {
        const t = i / 60;
        // Exponential curve: slow start, fast finish
        const x = 10 + t * (W - 20);
        const y = H - 10 - Math.pow(t, 2.5) * (H - 20);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Glow dot at tip
      if (steps > 0) {
        const tipT = steps / 60;
        const tipX = 10 + tipT * (W - 20);
        const tipY = H - 10 - Math.pow(tipT, 2.5) * (H - 20);
        ctx.beginPath();
        ctx.arc(tipX, tipY, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      frame++;
      if (frame <= totalFrames) rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [phase, color]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div style={{ position: "relative", width: 120, height: 100 }}>
        <canvas
          ref={canvasRef}
          style={{ width: 120, height: 100, opacity: phase >= 1 ? 1 : 0, transition: "opacity 200ms" }}
        />

        {/* TrendingUp icon at top-right of curve */}
        <div style={{
          position: "absolute",
          top: -4, right: -4,
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? "scale(1)" : "scale(0.6)",
          transition: "all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}>
          <TrendingUp
            size={32}
            strokeWidth={1.5}
            style={{
              color,
              filter: `drop-shadow(0 0 12px ${color}50)`,
            }}
          />
        </div>
      </div>

      <span style={{
        fontSize: 22, fontWeight: 300, letterSpacing: 6,
        color: NAME_COLOR, fontFamily: "var(--font-brand)",
        opacity: phase >= 3 ? 1 : 0,
        transform: phase >= 3 ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 350ms ease-out, transform 350ms ease-out",
      }}>
        GROW
      </span>
    </div>
  );
}

/* ─── HIRE — 4 candidates → 3 fade → 1 gets checkmark ─── */
function HireAnim({ color, onAutoFinish }: AnimProps) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);   // 4 circles appear
    const t2 = setTimeout(() => setPhase(2), 600);   // #1 fades
    const t3 = setTimeout(() => setPhase(3), 800);   // #2 fades
    const t4 = setTimeout(() => setPhase(4), 1000);  // #3 fades
    const t5 = setTimeout(() => setPhase(5), 1250);  // #4 gets check → icon
    const t6 = setTimeout(() => setPhase(6), 1550);  // name
    const t7 = setTimeout(onAutoFinish, 2500);
    return () => { [t1,t2,t3,t4,t5,t6,t7].forEach(clearTimeout); };
  }, [onAutoFinish]);

  const CANDIDATES = [0, 1, 2, 3];
  const dismissed = (i: number) => {
    if (i === 0 && phase >= 2) return true;
    if (i === 1 && phase >= 3) return true;
    if (i === 2 && phase >= 4) return true;
    return false;
  };
  const chosen = phase >= 5;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", height: 64 }}>
        {CANDIDATES.map(i => {
          const isLast = i === 3;
          const isDismissed = dismissed(i);
          const isChosen = isLast && chosen;

          return (
            <div key={i} style={{
              position: "relative",
              width: 40, height: 40,
              borderRadius: "50%",
              background: isChosen ? `${color}20` : isDismissed ? "transparent" : "rgba(255,255,255,0.04)",
              border: isChosen ? `2px solid ${color}` : isDismissed ? "1px solid rgba(255,255,255,0.03)" : "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: phase >= 1 ? (isDismissed ? 0.15 : 1) : 0,
              transform: phase >= 1 ? "scale(1)" : "scale(0.7)",
              transition: "all 250ms ease-out",
            }}>
              {isChosen ? (
                <UserCheck size={20} strokeWidth={1.5} style={{
                  color,
                  filter: `drop-shadow(0 0 8px ${color}40)`,
                }} />
              ) : (
                /* Simple user silhouette */
                <div style={{
                  width: 12, height: 12, borderRadius: "50%",
                  background: isDismissed ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)",
                  transition: "background 200ms",
                }} />
              )}

              {/* Strikethrough line on dismissed */}
              {isDismissed && (
                <div style={{
                  position: "absolute",
                  width: "110%",
                  height: 1,
                  background: "rgba(255,255,255,0.08)",
                  transform: "rotate(-45deg)",
                }} />
              )}
            </div>
          );
        })}
      </div>

      <span style={{
        fontSize: 22, fontWeight: 300, letterSpacing: 6,
        color: NAME_COLOR, fontFamily: "var(--font-brand)",
        opacity: phase >= 6 ? 1 : 0,
        transform: phase >= 6 ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 350ms ease-out, transform 350ms ease-out",
      }}>
        HIRE
      </span>
    </div>
  );
}

/* ─── PROTECT — Shield ghost → ring expands → Shield solid ─── */
function ProtectAnim({ color, onAutoFinish }: AnimProps) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);   // shield ghost
    const t2 = setTimeout(() => setPhase(2), 500);   // ring expands
    const t3 = setTimeout(() => setPhase(3), 1000);  // shield solid
    const t4 = setTimeout(() => setPhase(4), 1300);  // name
    const t5 = setTimeout(onAutoFinish, 2300);
    return () => { [t1,t2,t3,t4,t5].forEach(clearTimeout); };
  }, [onAutoFinish]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <div style={{ position: "relative", width: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Expanding ring */}
        <div style={{
          position: "absolute",
          width: phase >= 2 ? 100 : 20,
          height: phase >= 2 ? 100 : 20,
          borderRadius: "50%",
          border: `1.5px solid ${color}`,
          opacity: phase >= 2 ? (phase >= 3 ? 0 : 0.5) : 0,
          transition: phase >= 3
            ? "opacity 300ms ease-out"
            : "all 500ms cubic-bezier(0.22, 1, 0.36, 1)",
        }} />

        {/* Second ring — delayed, larger */}
        <div style={{
          position: "absolute",
          width: phase >= 2 ? 130 : 20,
          height: phase >= 2 ? 130 : 20,
          borderRadius: "50%",
          border: `1px solid ${color}40`,
          opacity: phase >= 2 ? (phase >= 3 ? 0 : 0.3) : 0,
          transition: phase >= 3
            ? "opacity 300ms ease-out 100ms"
            : "all 600ms cubic-bezier(0.22, 1, 0.36, 1) 80ms",
        }} />

        {/* Shield icon */}
        <div style={{
          position: "relative",
          opacity: phase >= 1 ? (phase >= 3 ? 1 : 0.2) : 0,
          transition: "opacity 350ms ease-out",
        }}>
          <Shield
            size={40}
            strokeWidth={1.5}
            style={{
              color,
              filter: phase >= 3 ? `drop-shadow(0 0 14px ${color}40)` : "none",
              transition: "filter 300ms ease-out",
            }}
          />
        </div>
      </div>

      <span style={{
        fontSize: 22, fontWeight: 300, letterSpacing: 6,
        color: NAME_COLOR, fontFamily: "var(--font-brand)",
        opacity: phase >= 4 ? 1 : 0,
        transform: phase >= 4 ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 350ms ease-out, transform 350ms ease-out",
      }}>
        PROTECT
      </span>
    </div>
  );
}

/* ─── COMPETE — two lines cross → spark → Swords ─── */
function CompeteAnim({ color, onAutoFinish }: AnimProps) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);   // lines start
    const t2 = setTimeout(() => setPhase(2), 600);   // lines cross → spark
    const t3 = setTimeout(() => setPhase(3), 950);   // swords appear
    const t4 = setTimeout(() => setPhase(4), 1250);  // name
    const t5 = setTimeout(onAutoFinish, 2200);
    return () => { [t1,t2,t3,t4,t5].forEach(clearTimeout); };
  }, [onAutoFinish]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <div style={{ position: "relative", width: 120, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Left line */}
        <div style={{
          position: "absolute",
          left: phase >= 1 ? "50%" : "0%",
          top: "50%",
          width: 50,
          height: 1.5,
          background: `linear-gradient(90deg, transparent, ${color})`,
          transform: "translate(-100%, -50%) rotate(-20deg)",
          transformOrigin: "right center",
          opacity: phase >= 1 ? (phase >= 3 ? 0 : 1) : 0,
          transition: phase >= 3 ? "opacity 200ms" : "all 450ms ease-out",
        }} />

        {/* Right line */}
        <div style={{
          position: "absolute",
          right: phase >= 1 ? "50%" : "0%",
          top: "50%",
          width: 50,
          height: 1.5,
          background: `linear-gradient(-90deg, transparent, ${color})`,
          transform: "translate(100%, -50%) rotate(20deg)",
          transformOrigin: "left center",
          opacity: phase >= 1 ? (phase >= 3 ? 0 : 1) : 0,
          transition: phase >= 3 ? "opacity 200ms" : "all 450ms ease-out",
        }} />

        {/* Spark/flash at center */}
        <div style={{
          position: "absolute",
          width: phase >= 2 ? 24 : 0,
          height: phase >= 2 ? 24 : 0,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
          opacity: phase >= 2 ? (phase >= 3 ? 0 : 1) : 0,
          transition: "all 200ms ease-out",
        }} />

        {/* Swords icon */}
        <div style={{
          position: "relative",
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? "scale(1)" : "scale(0.6)",
          transition: "all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}>
          <Swords
            size={36}
            strokeWidth={1.5}
            style={{
              color,
              filter: `drop-shadow(0 0 12px ${color}40)`,
            }}
          />
        </div>
      </div>

      <span style={{
        fontSize: 22, fontWeight: 300, letterSpacing: 6,
        color: NAME_COLOR, fontFamily: "var(--font-brand)",
        opacity: phase >= 4 ? 1 : 0,
        transform: phase >= 4 ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 350ms ease-out, transform 350ms ease-out",
      }}>
        COMPETE
      </span>
    </div>
  );
}

/* ═══ Animation registry ═══ */
const ANIM_MAP: Record<string, React.ComponentType<AnimProps>> = {
  simulate: SimulateAnim,
  build: BuildAnim,
  grow: GrowAnim,
  hire: HireAnim,
  protect: ProtectAnim,
  compete: CompeteAnim,
};

/* ═══ Shared keyframes (minimal — most animation is phase-driven) ═══ */
function EngineIntroStyles() {
  return (
    <style>{`
      @keyframes eiGlow {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
    `}</style>
  );
}
