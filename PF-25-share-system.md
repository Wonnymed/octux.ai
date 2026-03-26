# PF-25 — Share System

## Context for AI

You are working on Octux AI — a Decision Operating System. Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui + Zustand + Lucide React + Framer Motion.

**Ref:** Perplexity (share button on every answer), Twitter/X (text snippet + link), LinkedIn (professional share), WhatsApp (mobile-first share). The verdict is the most shareable asset in the product — a probability-graded decision with agent consensus is inherently screenshot-worthy. The share system should make it effortless to share.

**What exists (PF-01 → PF-24):**
- VerdictCard (PF-14) with "Share" button that currently does `navigator.clipboard.writeText(url)`
- `VerdictResult` type with: recommendation, probability, grade, one_liner, main_risk, next_action, agent_scoreboard
- Conversations have UUIDs accessible via URL `/c/[id]`
- Auth system (PF-20) tracks user IDs
- Token billing (PF-21) with referral potential

**What this prompt builds:**

1. `ShareMenu` — dropdown with platform options (X, LinkedIn, WhatsApp, Copy Link, Copy Snippet)
2. `ShareDialog` — full modal with 3 tabs: Link, Snippet, Platforms
3. `lib/share/snippets.ts` — platform-specific text formatters (Twitter ≤280 chars, LinkedIn professional, WhatsApp casual)
4. `lib/share/referral.ts` — share URLs with `?ref=userId` tracking
5. Web Share API integration for mobile native share sheet
6. Integration into VerdictCard + conversation header

---

## Part A — Share URL Builder with Referral Tracking

CREATE `lib/share/url.ts`:

```typescript
/**
 * Builds share URLs with referral tracking.
 * Format: https://octux.ai/c/[id]/report?ref=[userId]
 *
 * The /report path is the public read-only view (PF-26).
 * The ?ref= param tracks who shared for referral rewards (PF-27).
 */

export function buildShareUrl(conversationId: string, userId?: string): string {
  const base = `${getBaseUrl()}/c/${conversationId}/report`;
  if (userId) {
    return `${base}?ref=${userId}`;
  }
  return base;
}

export function buildShareUrlChat(conversationId: string, userId?: string): string {
  const base = `${getBaseUrl()}/c/${conversationId}`;
  if (userId) {
    return `${base}?ref=${userId}`;
  }
  return base;
}

function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'https://signux-ai.vercel.app';
}
```

---

## Part B — Platform-Specific Snippets

CREATE `lib/share/snippets.ts`:

```typescript
import type { VerdictResult } from '@/lib/simulation/events';

export type SharePlatform = 'twitter' | 'linkedin' | 'whatsapp' | 'generic';

interface SnippetInput {
  question: string;
  verdict: VerdictResult;
  shareUrl: string;
}

/**
 * Generate platform-specific share text.
 * Twitter: ≤280 chars, punchy, with emoji
 * LinkedIn: professional tone, structured
 * WhatsApp: casual, conversational
 * Generic: clean, no platform constraints
 */
export function generateSnippet(platform: SharePlatform, input: SnippetInput): string {
  const { question, verdict, shareUrl } = input;
  const rec = (verdict.recommendation || 'proceed').toUpperCase();
  const prob = verdict.probability || 0;
  const grade = verdict.grade || '?';

  switch (platform) {
    case 'twitter':
      return generateTwitterSnippet(question, rec, prob, grade, shareUrl);
    case 'linkedin':
      return generateLinkedInSnippet(question, rec, prob, grade, verdict, shareUrl);
    case 'whatsapp':
      return generateWhatsAppSnippet(question, rec, prob, grade, shareUrl);
    default:
      return generateGenericSnippet(question, rec, prob, grade, verdict, shareUrl);
  }
}

function generateTwitterSnippet(
  question: string, rec: string, prob: number, grade: string, url: string,
): string {
  // Twitter max 280 chars. URL takes ~23 chars.
  const q = question.length > 80 ? question.substring(0, 77) + '...' : question;
  const text = `Asked Octux AI: "${q}"\n\n${getEmoji(rec)} ${rec} (${prob}%) · Grade ${grade}\n\n10 AI specialists debated it. Here's the full verdict:`;

  // Ensure under 280 - url length (~23)
  const maxTextLen = 280 - 24; // 23 for t.co + 1 newline
  const trimmed = text.length > maxTextLen
    ? text.substring(0, maxTextLen - 3) + '...'
    : text;

  return `${trimmed}\n${url}`;
}

function generateLinkedInSnippet(
  question: string, rec: string, prob: number, grade: string, verdict: VerdictResult, url: string,
): string {
  const agents = verdict.agent_scoreboard?.length || 10;
  return `I ran a decision analysis with Octux AI — 10 specialist agents debated my question in real-time.

Question: "${question}"

Result: ${rec} (${prob}%) · Grade ${grade}
${verdict.one_liner ? `\nKey insight: ${verdict.one_liner}` : ''}
${verdict.main_risk ? `Risk flagged: ${verdict.main_risk}` : ''}

${agents} AI agents. Multiple rounds of debate. Every claim traceable to the specialist who made it.

Full analysis: ${url}

#DecisionMaking #AI #Strategy`;
}

function generateWhatsAppSnippet(
  question: string, rec: string, prob: number, grade: string, url: string,
): string {
  return `${getEmoji(rec)} Check this out — I asked Octux AI: "${question}"

Result: *${rec}* (${prob}%) Grade ${grade}

10 AI specialists debated it live. Pretty wild.

${url}`;
}

function generateGenericSnippet(
  question: string, rec: string, prob: number, grade: string, verdict: VerdictResult, url: string,
): string {
  return `Octux AI Analysis: "${question}"

Verdict: ${rec} (${prob}%) · Grade ${grade}
${verdict.one_liner || ''}

Full analysis: ${url}`;
}

function getEmoji(rec: string): string {
  switch (rec.toLowerCase()) {
    case 'proceed': return '🟢';
    case 'delay': return '🟡';
    case 'abandon': return '🔴';
    default: return '⚖️';
  }
}

/**
 * Platform share URLs (open in new tab)
 */
export function getPlatformShareUrl(platform: SharePlatform, text: string, url: string): string {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedText}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case 'whatsapp':
      return `https://wa.me/?text=${encodedText}`;
    default:
      return '';
  }
}
```

---

## Part C — ShareMenu (Dropdown)

CREATE `components/share/ShareMenu.tsx`:

```typescript
'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Twitter, Linkedin, MessageCircle, Link2, FileText, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/design/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { buildShareUrl } from '@/lib/share/url';
import { generateSnippet, getPlatformShareUrl, type SharePlatform } from '@/lib/share/snippets';
import type { VerdictResult } from '@/lib/simulation/events';

interface ShareMenuProps {
  conversationId: string;
  question: string;
  verdict: VerdictResult;
  userId?: string;
  onOpenDialog?: () => void;
  className?: string;
}

export default function ShareMenu({
  conversationId, question, verdict, userId, onOpenDialog, className,
}: ShareMenuProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = buildShareUrl(conversationId, userId);

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const handleCopySnippet = useCallback(async () => {
    const snippet = generateSnippet('generic', { question, verdict, shareUrl });
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [question, verdict, shareUrl]);

  const handlePlatformShare = useCallback((platform: SharePlatform) => {
    const snippet = generateSnippet(platform, { question, verdict, shareUrl });
    const url = getPlatformShareUrl(platform, snippet, shareUrl);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
    }
  }, [question, verdict, shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        const snippet = generateSnippet('generic', { question, verdict, shareUrl });
        await navigator.share({
          title: `Octux AI: ${question}`,
          text: snippet,
          url: shareUrl,
        });
      } catch {
        // User cancelled or not supported — fall through to dialog
        onOpenDialog?.();
      }
    } else {
      onOpenDialog?.();
    }
  }, [question, verdict, shareUrl, onOpenDialog]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs',
            'border border-border-subtle',
            'text-txt-secondary hover:text-txt-primary hover:bg-surface-2',
            'transition-colors',
            className,
          )}
        >
          <Share2 size={13} />
          Share
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52 bg-surface-raised border-border-subtle">
        {/* Platform shares */}
        <DropdownMenuItem
          onClick={() => handlePlatformShare('twitter')}
          className="flex items-center gap-2.5 text-xs cursor-pointer"
        >
          <Twitter size={14} className="text-txt-tertiary" />
          Share on X
          <ExternalLink size={10} className="ml-auto text-txt-disabled" />
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handlePlatformShare('linkedin')}
          className="flex items-center gap-2.5 text-xs cursor-pointer"
        >
          <Linkedin size={14} className="text-txt-tertiary" />
          Share on LinkedIn
          <ExternalLink size={10} className="ml-auto text-txt-disabled" />
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handlePlatformShare('whatsapp')}
          className="flex items-center gap-2.5 text-xs cursor-pointer"
        >
          <MessageCircle size={14} className="text-txt-tertiary" />
          Share on WhatsApp
          <ExternalLink size={10} className="ml-auto text-txt-disabled" />
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border-subtle/50" />

        {/* Copy options */}
        <DropdownMenuItem
          onClick={handleCopyLink}
          className="flex items-center gap-2.5 text-xs cursor-pointer"
        >
          {copied ? (
            <Check size={14} className="text-verdict-proceed" />
          ) : (
            <Link2 size={14} className="text-txt-tertiary" />
          )}
          {copied ? 'Copied!' : 'Copy link'}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleCopySnippet}
          className="flex items-center gap-2.5 text-xs cursor-pointer"
        >
          <FileText size={14} className="text-txt-tertiary" />
          Copy snippet
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border-subtle/50" />

        {/* Mobile native share / Full dialog */}
        <DropdownMenuItem
          onClick={handleNativeShare}
          className="flex items-center gap-2.5 text-xs cursor-pointer"
        >
          <Share2 size={14} className="text-accent" />
          <span className="text-accent">More options...</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## Part D — ShareDialog (Full Modal with Tabs)

CREATE `components/share/ShareDialog.tsx`:

```typescript
'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Copy, Twitter, Linkedin, MessageCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/design/cn';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { buildShareUrl } from '@/lib/share/url';
import { generateSnippet, getPlatformShareUrl, type SharePlatform } from '@/lib/share/snippets';
import type { VerdictResult } from '@/lib/simulation/events';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  question: string;
  verdict: VerdictResult;
  userId?: string;
}

export default function ShareDialog({
  open, onClose, conversationId, question, verdict, userId,
}: ShareDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const shareUrl = buildShareUrl(conversationId, userId);

  const copyText = useCallback(async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const openPlatform = useCallback((platform: SharePlatform) => {
    const snippet = generateSnippet(platform, { question, verdict, shareUrl });
    const url = getPlatformShareUrl(platform, snippet, shareUrl);
    if (url) window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
  }, [question, verdict, shareUrl]);

  if (!open) return null;

  const rec = (verdict.recommendation || 'proceed').toUpperCase();
  const prob = verdict.probability || 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-surface-overlay/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 w-full max-w-lg mx-4 bg-surface-raised border border-border-subtle rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle/50">
          <div>
            <h3 className="text-sm font-medium text-txt-primary">Share this analysis</h3>
            <p className="text-micro text-txt-disabled mt-0.5">
              {rec} ({prob}%) — {question.substring(0, 50)}{question.length > 50 ? '...' : ''}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-txt-disabled hover:text-txt-tertiary hover:bg-surface-2 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <Tabs defaultValue="link" className="w-full">
            <TabsList className="w-full justify-start bg-surface-2/50 p-0.5 h-auto gap-0.5 mb-4">
              <TabsTrigger value="link" className="text-xs px-3 py-1.5 data-[state=active]:bg-surface-raised data-[state=active]:text-txt-primary">
                Link
              </TabsTrigger>
              <TabsTrigger value="snippet" className="text-xs px-3 py-1.5 data-[state=active]:bg-surface-raised data-[state=active]:text-txt-primary">
                Snippet
              </TabsTrigger>
              <TabsTrigger value="platforms" className="text-xs px-3 py-1.5 data-[state=active]:bg-surface-raised data-[state=active]:text-txt-primary">
                Platforms
              </TabsTrigger>
            </TabsList>

            {/* ─── LINK TAB ─── */}
            <TabsContent value="link" className="space-y-3">
              <CopyField
                label="Report link (read-only)"
                value={shareUrl}
                copied={copiedField === 'link'}
                onCopy={() => copyText(shareUrl, 'link')}
              />
              <p className="text-micro text-txt-disabled">
                Anyone with this link can view the verdict and analysis. They cannot see your chat.
              </p>
            </TabsContent>

            {/* ─── SNIPPET TAB ─── */}
            <TabsContent value="snippet" className="space-y-4">
              {(['twitter', 'linkedin', 'whatsapp'] as const).map((platform) => {
                const snippet = generateSnippet(platform, { question, verdict, shareUrl });
                const label = platform === 'twitter' ? 'X (Twitter)' : platform === 'linkedin' ? 'LinkedIn' : 'WhatsApp';
                return (
                  <div key={platform}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-txt-secondary font-medium">{label}</span>
                      {platform === 'twitter' && (
                        <span className={cn(
                          'text-micro tabular-nums',
                          snippet.length > 280 ? 'text-verdict-abandon' : 'text-txt-disabled',
                        )}>
                          {snippet.length}/280
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <pre className="text-xs text-txt-tertiary bg-surface-2/50 rounded-lg p-3 whitespace-pre-wrap break-words max-h-32 overflow-y-auto border border-border-subtle/50">
                        {snippet}
                      </pre>
                      <button
                        onClick={() => copyText(snippet, platform)}
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-surface-raised border border-border-subtle text-txt-disabled hover:text-txt-tertiary transition-colors"
                      >
                        {copiedField === platform ? <Check size={12} className="text-verdict-proceed" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            {/* ─── PLATFORMS TAB ─── */}
            <TabsContent value="platforms" className="space-y-2">
              {[
                { platform: 'twitter' as const, label: 'X (Twitter)', icon: Twitter, desc: 'Short verdict + link' },
                { platform: 'linkedin' as const, label: 'LinkedIn', icon: Linkedin, desc: 'Professional analysis share' },
                { platform: 'whatsapp' as const, label: 'WhatsApp', icon: MessageCircle, desc: 'Quick share with friends' },
              ].map(({ platform, label, icon: Icon, desc }) => (
                <button
                  key={platform}
                  onClick={() => openPlatform(platform)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border-subtle hover:bg-surface-2/50 hover:border-border-default transition-colors text-left"
                >
                  <Icon size={18} className="text-txt-tertiary shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm text-txt-primary">{label}</span>
                    <p className="text-micro text-txt-disabled">{desc}</p>
                  </div>
                  <ExternalLink size={13} className="text-txt-disabled shrink-0" />
                </button>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}

/** Reusable copy field */
function CopyField({ label, value, copied, onCopy }: {
  label: string; value: string; copied: boolean; onCopy: () => void;
}) {
  return (
    <div>
      <label className="text-xs text-txt-secondary mb-1.5 block">{label}</label>
      <div className="flex gap-2">
        <input
          readOnly
          value={value}
          className="flex-1 h-9 px-3 rounded-lg text-xs bg-surface-2/50 border border-border-subtle text-txt-secondary truncate"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <button
          onClick={onCopy}
          className={cn(
            'h-9 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border',
            copied
              ? 'bg-verdict-proceed/10 border-verdict-proceed/20 text-verdict-proceed'
              : 'bg-surface-2 border-border-subtle text-txt-secondary hover:text-txt-primary',
          )}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
```

---

## Part E — Wire into VerdictCard

UPDATE `components/verdict/VerdictCard.tsx`:

**Replace the basic Share button with ShareMenu:**

```typescript
import ShareMenu from '@/components/share/ShareMenu';
import ShareDialog from '@/components/share/ShareDialog';

// Inside VerdictCard, add state:
const [shareDialogOpen, setShareDialogOpen] = useState(false);

// Find the original question for sharing
const originalQuestion = verdict.one_liner || 'Decision analysis';

// Replace the Share button in the action buttons row:
<ShareMenu
  conversationId={conversationId}
  question={originalQuestion}
  verdict={verdict}
  userId={undefined} // TODO: pass from auth context
  onOpenDialog={() => setShareDialogOpen(true)}
/>

// Add dialog at the bottom of the component:
<ShareDialog
  open={shareDialogOpen}
  onClose={() => setShareDialogOpen(false)}
  conversationId={conversationId}
  question={originalQuestion}
  verdict={verdict}
  userId={undefined}
/>;
```

---

## Part F — Export

CREATE `components/share/index.ts`:

```typescript
export { default as ShareMenu } from './ShareMenu';
export { default as ShareDialog } from './ShareDialog';
```

---

## Testing

### Test 1 — ShareMenu opens:
Click "Share" on VerdictCard → dropdown appears with: X, LinkedIn, WhatsApp, Copy link, Copy snippet, More options.

### Test 2 — Copy link:
Click "Copy link" → clipboard has `https://signux-ai.vercel.app/c/[id]/report`. Shows "Copied!" with green check for 2s.

### Test 3 — Copy snippet:
Click "Copy snippet" → clipboard has generic formatted text with question, verdict, probability, grade, URL.

### Test 4 — Share on X:
Click "Share on X" → new window opens Twitter compose with pre-filled text ≤280 chars: question, emoji + verdict, URL.

### Test 5 — Share on LinkedIn:
Click "Share on LinkedIn" → new window opens LinkedIn share with professional text including insights and hashtags.

### Test 6 — Share on WhatsApp:
Click "Share on WhatsApp" → opens WhatsApp with casual text, bold verdict, URL.

### Test 7 — ShareDialog tabs:
Click "More options" → full modal opens with 3 tabs: Link (copy field), Snippet (3 platform previews with char count), Platforms (big buttons with descriptions).

### Test 8 — Twitter char count:
Snippet tab → Twitter preview shows char count. Green if ≤280, red if over.

### Test 9 — Web Share API (mobile):
On mobile → "More options" calls `navigator.share()` → native share sheet opens. If not supported, falls back to dialog.

### Test 10 — Referral URL:
If userId is provided → share URL includes `?ref=userId`. Without userId → no ref param.

### Test 11 — Snippet previews editable:
Click on snippet text → selectable. Copy button copies entire snippet.

### Test 12 — Dialog closes:
Press Escape or click backdrop → dialog closes.

---

## Files Created/Modified

```
CREATED:
  lib/share/url.ts — share URL builder with referral tracking
  lib/share/snippets.ts — platform-specific text formatters
  components/share/ShareMenu.tsx — dropdown with platform options
  components/share/ShareDialog.tsx — full modal with tabs
  components/share/index.ts — barrel export

MODIFIED:
  components/verdict/VerdictCard.tsx — replace basic Share with ShareMenu + ShareDialog
```

---

Manda pro Fernando. Próximo é **PF-26** (Boardroom Report Page — o `/c/[id]/report` público com OG image). 🐙

