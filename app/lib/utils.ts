export function cleanAgentResponse(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  let text = raw.replace(/^```(?:json)?\s*\n?/gm, '').replace(/\n?```\s*$/gm, '').trim();
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      if (typeof parsed.text === 'string') return parsed.text;
      return Object.values(parsed).filter(v => typeof v === 'string').join(' ');
    }
    return String(parsed);
  } catch { return text; }
}
