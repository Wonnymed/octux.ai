/**
 * Development-only logging. Prefer `devLog` instead of ad-hoc logging in lib/app code.
 */
export function devLog(...args: unknown[]): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args); // keep — dev-only sink inside devLog()
  }
}
