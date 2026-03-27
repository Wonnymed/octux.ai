import { redirect } from 'next/navigation';

type Props = { params: Promise<{ id: string }> };

/**
 * BUILD PLAN §4 — Simulation workspace URL shape.
 * Canonical implementation lives at `/c/[id]` (conversation + simulation UI).
 */
export default async function SimulationAliasPage({ params }: Props) {
  const { id } = await params;
  redirect(`/c/${id}`);
}
