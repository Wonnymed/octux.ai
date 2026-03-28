/**
 * Authenticated fetch wrapper that adds the x-sukgo-client header.
 */
export function sukgoFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("x-sukgo-client", process.env.NEXT_PUBLIC_CLIENT_TOKEN || "");
  return fetch(url, { ...options, headers });
}
