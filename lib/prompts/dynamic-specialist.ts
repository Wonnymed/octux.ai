import type { ChiefSimulationMode, SpecialistPlan } from '@/lib/simulation/types';

export function buildDynamicSpecialistPrompt(
  specialist: SpecialistPlan,
  question: string,
  mode: ChiefSimulationMode,
  round: number,
  previousResponses: { name: string; text: string }[],
): string {
  const teamLine =
    specialist.team != null ? `\nYOUR TEAM: ${specialist.team} — argue for your assigned side.` : '';

  return `You are ${specialist.name}. ${specialist.role}

EXPERTISE: ${specialist.expertise}
YOUR BIAS: ${specialist.bias}
PERSONALITY: ${specialist.personality}
HOW YOU TALK: "${specialist.speaking_style}"
YOUR TASK: ${specialist.task}
${teamLine}

QUESTION: "${question}"
MODE: ${mode}
ROUND: ${round}

${
  previousResponses.length > 0
    ? `PREVIOUS:\n${previousResponses.map((r) => `[${r.name}]: ${r.text}`).join('\n\n')}`
    : 'You speak first.'
}

RULES:
- Stay in character. Use your specific expertise.
- RESPOND to others — agree, challenge, add nuance
- Real numbers, real scenarios, local knowledge
- Under 200 words. Dense and valuable.
- End with: PROCEED / CAUTION / AGAINST

Respond as ${specialist.name}:`;
}
