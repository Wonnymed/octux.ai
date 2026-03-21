import jsPDF from "jspdf";

const BG = "#0A0A0F";
const BG_CARD = "#12121A";
const GOLD = "#D4AF37";
const GREEN = "#10B981";
const RED = "#EF4444";
const WHITE = "#E5E5E5";
const GRAY = "#9CA3AF";
const DARK_GRAY = "#6B7280";

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function setColor(doc: jsPDF, hex: string) {
  doc.setTextColor(...hexToRgb(hex));
}

function drawBg(doc: jsPDF) {
  doc.setFillColor(...hexToRgb(BG));
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
}

function drawCard(doc: jsPDF, x: number, y: number, w: number, h: number, borderColor = "#1E1E2E") {
  doc.setFillColor(...hexToRgb(BG_CARD));
  doc.roundedRect(x, y, w, h, 3, 3, "F");
  doc.setDrawColor(...hexToRgb(borderColor));
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 3, 3, "S");
}

function sectionTitle(doc: jsPDF, text: string, y: number): number {
  setColor(doc, GOLD);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(text.toUpperCase(), MARGIN, y);
  doc.setDrawColor(...hexToRgb(GOLD));
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y + 2, MARGIN + CONTENT_W, y + 2);
  return y + 8;
}

function footer(doc: jsPDF, page: number, total: number) {
  setColor(doc, DARK_GRAY);
  doc.setFontSize(7);
  doc.setFont("courier", "normal");
  doc.text("SIGNUX AI — Decision Intelligence", MARGIN, PAGE_H - 10);
  doc.text(`${page}/${total}`, PAGE_W - MARGIN, PAGE_H - 10, { align: "right" });
}

function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text || "", maxWidth);
}

export function exportSimulationPdf(data: {
  scenario: string;
  rounds: any[];
  verdict: any;
  evolution: any[];
}) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const { scenario, rounds, verdict, evolution } = data;
  const totalPages = 6;
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // ═══ PAGE 1: COVER ═══
  drawBg(doc);

  // Gold accent line
  doc.setFillColor(...hexToRgb(GOLD));
  doc.rect(MARGIN, 60, 40, 1.5, "F");

  // Logo text
  setColor(doc, GOLD);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text("SIGNUX", MARGIN, 80);
  setColor(doc, WHITE);
  doc.setFontSize(32);
  doc.text(" AI", MARGIN + doc.getTextWidth("SIGNUX"), 80);

  // Subtitle
  setColor(doc, GRAY);
  doc.setFontSize(10);
  doc.setFont("courier", "normal");
  doc.text("DECISION INTELLIGENCE PLATFORM", MARGIN, 90);

  // Report title
  setColor(doc, WHITE);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Simulation Report", MARGIN, 120);

  // Scenario
  drawCard(doc, MARGIN, 135, CONTENT_W, 40, `${GOLD}40`);
  setColor(doc, GOLD);
  doc.setFontSize(8);
  doc.setFont("courier", "bold");
  doc.text("SCENARIO", MARGIN + 8, 143);
  setColor(doc, WHITE);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const scenarioLines = wrapText(doc, scenario, CONTENT_W - 16);
  doc.text(scenarioLines.slice(0, 4), MARGIN + 8, 151);

  // Meta
  setColor(doc, DARK_GRAY);
  doc.setFontSize(9);
  doc.setFont("courier", "normal");
  doc.text(dateStr, MARGIN, 190);
  doc.text("10 Agents · 10 Rounds · 100 Interactions", MARGIN, 197);

  // Tagline
  setColor(doc, DARK_GRAY);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("10 experts. 10 rounds. 100 perspectives. 1 decision.", MARGIN, PAGE_H - 30);

  footer(doc, 1, totalPages);

  // ═══ PAGE 2: EXECUTIVE SUMMARY ═══
  doc.addPage();
  drawBg(doc);
  let y = sectionTitle(doc, "Executive Summary", 25);

  if (verdict) {
    const isProceed = (verdict.proceedCount || 0) >= 6;

    // Vote result card
    drawCard(doc, MARGIN, y, CONTENT_W, 35, isProceed ? `${GREEN}40` : `${RED}40`);
    setColor(doc, isProceed ? GREEN : RED);
    doc.setFontSize(28);
    doc.setFont("courier", "bold");
    doc.text(`${verdict.proceedCount || 0}-${verdict.stopCount || 0}`, MARGIN + 8, y + 15);
    doc.setFontSize(10);
    doc.text(isProceed ? "PROCEED" : "STOP", MARGIN + 8, y + 22);

    // Viability
    setColor(doc, GOLD);
    doc.setFontSize(22);
    doc.text(`${verdict.viability || 0}/10`, MARGIN + 70, y + 15);
    doc.setFontSize(8);
    doc.setFont("courier", "normal");
    doc.text("VIABILITY", MARGIN + 70, y + 22);

    // Confidence
    setColor(doc, WHITE);
    doc.setFontSize(18);
    doc.setFont("courier", "bold");
    doc.text(`${verdict.avgConfidence || 0}`, MARGIN + 110, y + 15);
    doc.setFontSize(8);
    doc.setFont("courier", "normal");
    doc.text("AVG CONF", MARGIN + 110, y + 22);

    // ROI
    if (verdict.estimatedROI && verdict.estimatedROI !== "N/A") {
      const roiColor = verdict.estimatedROI.startsWith("-") ? RED : GREEN;
      setColor(doc, roiColor);
      doc.setFontSize(18);
      doc.setFont("courier", "bold");
      doc.text(verdict.estimatedROI, MARGIN + 140, y + 15);
      doc.setFontSize(8);
      doc.setFont("courier", "normal");
      doc.text("EST. ROI", MARGIN + 140, y + 22);
    }
    y += 42;

    // Verdict text
    if (verdict.verdict) {
      drawCard(doc, MARGIN, y, CONTENT_W, 30);
      setColor(doc, WHITE);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const verdictLines = wrapText(doc, verdict.verdict, CONTENT_W - 16);
      doc.text(verdictLines.slice(0, 5), MARGIN + 8, y + 8);
      y += 36;
    }

    // Key Risk + Key Opportunity
    if (verdict.keyRisk || verdict.keyOpportunity) {
      const halfW = (CONTENT_W - 4) / 2;
      if (verdict.keyRisk) {
        drawCard(doc, MARGIN, y, halfW, 30, `${RED}30`);
        setColor(doc, RED);
        doc.setFontSize(7);
        doc.setFont("courier", "bold");
        doc.text("KEY RISK", MARGIN + 6, y + 7);
        setColor(doc, GRAY);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const riskLines = wrapText(doc, verdict.keyRisk, halfW - 12);
        doc.text(riskLines.slice(0, 4), MARGIN + 6, y + 13);
      }
      if (verdict.keyOpportunity) {
        const ox = MARGIN + halfW + 4;
        drawCard(doc, ox, y, halfW, 30, `${GREEN}30`);
        setColor(doc, GREEN);
        doc.setFontSize(7);
        doc.setFont("courier", "bold");
        doc.text("KEY OPPORTUNITY", ox + 6, y + 7);
        setColor(doc, GRAY);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const oppLines = wrapText(doc, verdict.keyOpportunity, halfW - 12);
        doc.text(oppLines.slice(0, 4), ox + 6, y + 13);
      }
      y += 36;
    }

    // Individual votes
    if (verdict.votes && verdict.votes.length > 0) {
      y = sectionTitle(doc, "Individual Votes", y);
      verdict.votes.forEach((v: any, i: number) => {
        const vColor = v.vote === "PROCEED" ? GREEN : RED;
        const col = i % 2;
        const row = Math.floor(i / 2);
        const cx = MARGIN + col * (CONTENT_W / 2 + 2);
        const cy = y + row * 12;
        setColor(doc, vColor);
        doc.setFontSize(9);
        doc.setFont("courier", "bold");
        doc.text(`${v.avatar || "·"} ${v.agent || "Agent"}`, cx, cy);
        setColor(doc, DARK_GRAY);
        doc.setFont("courier", "normal");
        doc.text(`${v.vote} (${v.confidence}/10)`, cx + 50, cy);
      });
    }
  }

  footer(doc, 2, totalPages);

  // ═══ PAGE 3: AGENT OVERVIEW ═══
  doc.addPage();
  drawBg(doc);
  y = sectionTitle(doc, "Agent Overview — Final Positions", 25);

  const lastRound = rounds?.[rounds.length - 1];
  const agents = lastRound?.agents || [];

  agents.forEach((agent: any, i: number) => {
    if (y > PAGE_H - 30) {
      footer(doc, 3, totalPages);
      doc.addPage();
      drawBg(doc);
      y = 25;
    }
    const cardH = 22;
    drawCard(doc, MARGIN, y, CONTENT_W, cardH, `${agent.color || DARK_GRAY}30`);

    // Avatar + name
    setColor(doc, agent.color || GOLD);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${agent.avatar || "·"} ${agent.name || `Agent ${i + 1}`}`, MARGIN + 6, y + 7);

    // Sentiment + confidence
    const sentColor = agent.sentiment === "confident" || agent.sentiment === "optimistic" || agent.sentiment === "excited"
      ? GREEN : agent.sentiment === "worried" || agent.sentiment === "concerned" ? RED : GOLD;
    setColor(doc, sentColor);
    doc.setFontSize(8);
    doc.setFont("courier", "bold");
    doc.text(`${(agent.sentiment || "neutral").toUpperCase()} · ${agent.confidence || 0}/10`, MARGIN + 6, y + 13);

    // Text preview
    if (agent.text) {
      setColor(doc, GRAY);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const preview = wrapText(doc, agent.text, CONTENT_W - 12);
      doc.text(preview.slice(0, 1), MARGIN + 6, y + 19);
    }

    y += cardH + 3;
  });

  footer(doc, 3, totalPages);

  // ═══ PAGE 4: EVOLUTION ═══
  doc.addPage();
  drawBg(doc);
  y = sectionTitle(doc, "Agent Evolution — 10 Rounds", 25);

  if (evolution && evolution.length > 0) {
    evolution.forEach((agent: any) => {
      if (y > PAGE_H - 40) {
        footer(doc, 4, totalPages);
        doc.addPage();
        drawBg(doc);
        y = 25;
      }

      drawCard(doc, MARGIN, y, CONTENT_W, 20);

      // Agent name
      setColor(doc, agent.color || GOLD);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`${agent.avatar || "·"} ${agent.name || "Agent"}`, MARGIN + 6, y + 7);

      // Round-by-round dots
      const arc = agent.arc || [];
      const dotStartX = MARGIN + 60;
      const dotSpacing = 12;
      arc.forEach((r: any, ri: number) => {
        const dx = dotStartX + ri * dotSpacing;
        const sentCol = r.sentiment === "confident" || r.sentiment === "optimistic" || r.sentiment === "excited" || r.sentiment === "convinced"
          ? GREEN : r.sentiment === "worried" || r.sentiment === "concerned" ? RED
          : r.sentiment === "skeptical" || r.sentiment === "cautious" ? GOLD : GRAY;

        // Dot
        doc.setFillColor(...hexToRgb(r.changedMind ? GOLD : sentCol));
        doc.circle(dx, y + 6, r.changedMind ? 2 : 1.5, "F");

        // Confidence below
        setColor(doc, DARK_GRAY);
        doc.setFontSize(6);
        doc.setFont("courier", "normal");
        doc.text(`${r.confidence}`, dx - 2, y + 12);
      });

      // Changed mind count
      const changes = arc.filter((r: any) => r.changedMind).length;
      if (changes > 0) {
        setColor(doc, GOLD);
        doc.setFontSize(7);
        doc.setFont("courier", "bold");
        doc.text(`${changes}x changed`, MARGIN + 6, y + 16);
      }

      y += 23;
    });
  } else {
    setColor(doc, DARK_GRAY);
    doc.setFontSize(10);
    doc.text("Evolution data not available.", MARGIN, y + 10);
  }

  footer(doc, 4, totalPages);

  // ═══ PAGE 5: DISSENT NOTES ═══
  doc.addPage();
  drawBg(doc);
  y = sectionTitle(doc, "Dissent Notes", 25);

  const dissents = verdict?.dissents || [];
  if (dissents.length > 0) {
    drawCard(doc, MARGIN, y, CONTENT_W, Math.min(dissents.length * 18 + 8, PAGE_H - y - 30), `${RED}20`);
    y += 6;
    dissents.forEach((d: any) => {
      if (y > PAGE_H - 30) {
        footer(doc, 5, totalPages);
        doc.addPage();
        drawBg(doc);
        y = 25;
      }
      setColor(doc, WHITE);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`${d.avatar || "·"} ${d.agent || "Agent"}`, MARGIN + 8, y);
      if (d.note) {
        setColor(doc, GRAY);
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        const noteLines = wrapText(doc, `"${d.note}"`, CONTENT_W - 16);
        doc.text(noteLines.slice(0, 3), MARGIN + 8, y + 5);
        y += 5 + noteLines.slice(0, 3).length * 4;
      }
      y += 8;
    });
  } else {
    setColor(doc, DARK_GRAY);
    doc.setFontSize(10);
    doc.text("No dissenting opinions recorded.", MARGIN, y + 10);
  }

  footer(doc, 5, totalPages);

  // ═══ PAGE 6: EMERGENT PATTERNS ═══
  doc.addPage();
  drawBg(doc);
  y = sectionTitle(doc, "Emergent Patterns", 25);

  const PATTERN_COLORS: Record<string, string> = {
    consensus: GREEN,
    emerging_risk: RED,
    blind_spot: "#F59E0B",
    opportunity: "#3B82F6",
    tension: "#EC4899",
  };

  const patterns = verdict?.patterns || [];
  if (patterns.length > 0) {
    patterns.forEach((p: any) => {
      if (y > PAGE_H - 40) {
        footer(doc, 6, totalPages);
        doc.addPage();
        drawBg(doc);
        y = 25;
      }
      const pColor = PATTERN_COLORS[p.type] || DARK_GRAY;
      drawCard(doc, MARGIN, y, CONTENT_W, 24, `${pColor}30`);

      // Type dot
      doc.setFillColor(...hexToRgb(pColor));
      doc.circle(MARGIN + 8, y + 7, 2, "F");

      // Title
      setColor(doc, WHITE);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(p.title || "Pattern", MARGIN + 14, y + 8);

      // Type badge
      setColor(doc, pColor);
      doc.setFontSize(7);
      doc.setFont("courier", "bold");
      doc.text((p.type || "").toUpperCase().replace(/_/g, " "), MARGIN + CONTENT_W - 40, y + 8);

      // Description
      if (p.description) {
        setColor(doc, GRAY);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const descLines = wrapText(doc, p.description, CONTENT_W - 16);
        doc.text(descLines.slice(0, 2), MARGIN + 14, y + 14);
      }

      // Agents involved
      if (p.agents_involved && p.agents_involved.length > 0) {
        setColor(doc, DARK_GRAY);
        doc.setFontSize(7);
        doc.setFont("courier", "normal");
        doc.text(p.agents_involved.join(" · "), MARGIN + 14, y + 21);
      }

      y += 28;
    });
  } else {
    setColor(doc, DARK_GRAY);
    doc.setFontSize(10);
    doc.text("No emergent patterns detected.", MARGIN, y + 10);
  }

  footer(doc, 6, totalPages);

  // Save
  const dateSlug = new Date().toISOString().slice(0, 10);
  doc.save(`simulacao-${dateSlug}.pdf`);
}
