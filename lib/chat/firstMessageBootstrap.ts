/** Session key: first message from home → auto-send on /c/[id] mount */
export function pendingFirstMessageKey(conversationId: string): string {
  return `octux:first-msg:${conversationId}`;
}
