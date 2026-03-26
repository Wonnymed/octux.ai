'use client';

import { useState } from 'react';
import { Pin, PinOff, Pencil, Share2, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/shadcn/dropdown-menu';
import { useAppStore } from '@/lib/store/app';
import DeleteConfirmDialog from './DeleteConfirmDialog';

interface ConversationContextMenuProps {
  conversationId: string;
  title: string;
  isPinned: boolean;
  children: React.ReactNode;
  onRename: () => void;
  onShare: () => void;
}

export default function ConversationContextMenu({
  conversationId,
  title,
  isPinned,
  children,
  onRename,
  onShare,
}: ConversationContextMenuProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const updateConversation = useAppStore((s) => s.updateConversation);
  const removeConversation = useAppStore((s) => s.removeConversation);

  const handlePin = async () => {
    const newPinned = !isPinned;
    updateConversation(conversationId, { is_pinned: newPinned });
    await fetch(`/api/c/${conversationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'pin', pinned: newPinned }),
    }).catch(() => {
      updateConversation(conversationId, { is_pinned: isPinned });
    });
  };

  const handleDelete = async () => {
    removeConversation(conversationId);
    await fetch(`/api/c/${conversationId}`, { method: 'DELETE' }).catch(() => {});
    setDeleteOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="right" className="w-44 bg-surface-raised border-border-subtle">
          <DropdownMenuItem onClick={handlePin} className="flex items-center gap-2.5 text-xs cursor-pointer">
            {isPinned ? <PinOff size={13} className="text-txt-tertiary" /> : <Pin size={13} className="text-txt-tertiary" />}
            {isPinned ? 'Unpin' : 'Pin to top'}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onRename} className="flex items-center gap-2.5 text-xs cursor-pointer">
            <Pencil size={13} className="text-txt-tertiary" />
            Rename
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onShare} className="flex items-center gap-2.5 text-xs cursor-pointer">
            <Share2 size={13} className="text-txt-tertiary" />
            Share report
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-border-subtle/50" />

          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-2.5 text-xs cursor-pointer text-verdict-abandon focus:text-verdict-abandon"
          >
            <Trash2 size={13} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={title}
      />
    </>
  );
}
