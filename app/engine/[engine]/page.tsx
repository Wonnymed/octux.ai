import { redirect } from 'next/navigation';

const ENGINES = new Set(['simulate', 'build', 'grow', 'hire', 'protect', 'compete']);

type Props = { params: Promise<{ engine: string }> };

/**
 * BUILD PLAN §4 — optional engine-specific landing (Phase 2 in plan).
 * For now: send to home with `?engine=` for future EngineSelector deep-linking.
 */
export default async function EngineLandingPage({ params }: Props) {
  const { engine } = await params;
  const key = engine.toLowerCase();
  if (ENGINES.has(key)) {
    redirect(`/?engine=${encodeURIComponent(key)}`);
  }
  redirect('/');
}
