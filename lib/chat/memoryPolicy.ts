/**
 * When true, skip injecting user-specific memory (profile, facts, sim history, graph)
 * for this turn. RAG / knowledge snippets may still apply.
 */
export function userRequestedContextFree(message: string): boolean {
  const m = message.toLowerCase();
  const phrases = [
    'forget context',
    'forget previous',
    'ignore context',
    'ignore previous',
    'ignore past',
    'no context',
    'without context',
    'fresh start',
    'clean slate',
    'just answer',
    'only answer',
    'sem contexto',
    'esqueça o contexto',
    'esquece o contexto',
    'ignora o contexto',
    'ignora contexto',
    'não use contexto',
    'nao use contexto',
    'responda só',
    'responda so',
    'start over',
  ];
  return phrases.some((p) => m.includes(p));
}
