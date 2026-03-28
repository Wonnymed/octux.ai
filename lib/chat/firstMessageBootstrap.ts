/** Session key: first message from home → auto-send on /c/[id] mount */
export function pendingFirstMessageKey(conversationId: string): string {
  return `octux:first-msg:${conversationId}`;
}

/** Session key: dashboard Run → auto-start simulation on /c/[id] mount */
export function pendingSimulationKey(conversationId: string): string {
  return `octux:pending-sim:${conversationId}`;
}
