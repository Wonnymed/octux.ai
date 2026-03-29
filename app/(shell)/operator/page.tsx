import { redirect } from 'next/navigation';

/** Legacy “My Operator” URL — profile is the canonical destination. */
export default function LegacyOperatorRedirect() {
  redirect('/settings/profile');
}
