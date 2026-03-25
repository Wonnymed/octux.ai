import ChatLayout from '@/components/chat/ChatLayout';
import { CommandProvider } from '@/components/command';
import ShortcutOverlay from '@/components/ui/ShortcutOverlay';
import ShortcutToast from '@/components/ui/ShortcutToast';

export default function ConversationLayout({ children }: { children: React.ReactNode }) {
  return (
    <CommandProvider>
      <ChatLayout>{children}</ChatLayout>
      <ShortcutOverlay />
      <ShortcutToast />
    </CommandProvider>
  );
}
