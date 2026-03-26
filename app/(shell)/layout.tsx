import ChatLayout from '@/components/chat/ChatLayout';
import { CommandProvider } from '@/components/command';
import ShortcutOverlay from '@/components/ui/ShortcutOverlay';
import ShortcutToast from '@/components/ui/ShortcutToast';
import OnboardingProvider from '@/components/onboarding/OnboardingProvider';
import HydrateClient from './HydrateClient';
import { getAuthUserId } from '@/lib/auth/supabase-server';
import { getUserConversations } from '@/lib/conversation/manager';
import type { ConversationSummary } from '@/lib/store/app';

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  let userId: string | undefined;
  let initialConversations: ConversationSummary[] | undefined;

  try {
    userId = (await getAuthUserId()) ?? undefined;
    if (userId) {
      const rows = await getUserConversations(userId, 30);
      initialConversations = rows as ConversationSummary[];
    }
  } catch {
    userId = undefined;
    initialConversations = undefined;
  }

  return (
    <OnboardingProvider userId={userId}>
      <HydrateClient
        isAuthenticated={!!userId}
        initialConversations={userId ? initialConversations : undefined}
      >
        <CommandProvider>
          <ChatLayout>{children}</ChatLayout>
          <ShortcutOverlay />
          <ShortcutToast />
        </CommandProvider>
      </HydrateClient>
    </OnboardingProvider>
  );
}
