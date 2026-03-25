import { getAuthUserId } from '@/lib/auth/supabase-server';
import { redirect } from 'next/navigation';
import LandingPage from '@/components/landing/LandingPage';

export default async function RootPage() {
  const userId = await getAuthUserId();

  // Logged-in → product
  if (userId) redirect('/c');

  // Visitor → landing
  return <LandingPage />;
}
