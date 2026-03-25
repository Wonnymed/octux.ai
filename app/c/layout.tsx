import ChatLayout from '@/components/chat/ChatLayout';

export default function ConversationLayout({ children }: { children: React.ReactNode }) {
  return <ChatLayout>{children}</ChatLayout>;
}
