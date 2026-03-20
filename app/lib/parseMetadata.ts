export interface SignuxVerification {
  confidence: number;
  checked: string[];
  caveats: string[];
}

export interface SignuxWorklogStep {
  action: string;
  detail: string;
}

export interface SignuxWorklog {
  steps: SignuxWorklogStep[];
  sources_count: number;
  domains_used: number;
  reasoning_steps: number;
}

export type BlindSpot = { domain: string; question: string; why: string };

export interface SignuxMetadata {
  domains: string[];
  domainCount: number;
  blindspots: BlindSpot[];
  depth: number;
  verification: SignuxVerification | null;
  worklog: SignuxWorklog | null;
}

export function parseSignuxMetadata(content: string): { cleanContent: string; metadata: SignuxMetadata } {
  let clean = content;

  // Parse domains
  const domainMatch = clean.match(/<!--\s*signux_domains:\s*(.+?)\s*-->/);
  const domains = domainMatch ? domainMatch[1].split(",").map(d => d.trim()).filter(Boolean) : [];
  clean = clean.replace(/<!--\s*signux_domains:\s*.+?\s*-->/g, "");

  // Parse domain count
  const countMatch = clean.match(/<!--\s*signux_domain_count:\s*(\d+)\s*-->/);
  const domainCount = countMatch ? parseInt(countMatch[1], 10) : domains.length;
  clean = clean.replace(/<!--\s*signux_domain_count:\s*\d+\s*-->/g, "");

  // Parse blindspots
  const blindspotMatch = clean.match(/<!--\s*signux_blindspots:\s*(\[[\s\S]*?\])\s*-->/);
  let blindspots: BlindSpot[] = [];
  try { if (blindspotMatch) blindspots = JSON.parse(blindspotMatch[1]); } catch {}
  clean = clean.replace(/<!--\s*signux_blindspots:\s*\[[\s\S]*?\]\s*-->/g, "");

  // Parse depth
  const depthMatch = clean.match(/<!--\s*signux_depth:\s*(\d+)\s*-->/);
  const depth = depthMatch ? parseInt(depthMatch[1], 10) : 0;
  clean = clean.replace(/<!--\s*signux_depth:\s*\d+\s*-->/g, "");

  // Parse verification
  const verifyMatch = clean.match(/<!--\s*signux_verification:\s*(\{[\s\S]*?\})\s*-->/);
  let verification: SignuxVerification | null = null;
  try { if (verifyMatch) verification = JSON.parse(verifyMatch[1]); } catch {}
  clean = clean.replace(/<!--\s*signux_verification:\s*\{[\s\S]*?\}\s*-->/g, "");

  // Parse worklog
  const worklogMatch = clean.match(/<!--\s*signux_worklog:\s*(\{[\s\S]*?\})\s*-->/);
  let worklog: SignuxWorklog | null = null;
  try { if (worklogMatch) worklog = JSON.parse(worklogMatch[1]); } catch {}
  clean = clean.replace(/<!--\s*signux_worklog:\s*\{[\s\S]*?\}\s*-->/g, "");

  return {
    cleanContent: clean.trim(),
    metadata: { domains, domainCount, blindspots, depth, verification, worklog },
  };
}
