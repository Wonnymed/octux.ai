'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy } from 'lucide-react';
import { SettingSection, Divider } from '../_components';
import { useAuth } from '@/components/auth/AuthProvider';
import { cn } from '@/lib/design/cn';

export default function SettingsAccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();
  const [copied, setCopied] = useState(false);

  const [acctOpen, setAcctOpen] = useState(false);
  const [acctPhrase, setAcctPhrase] = useState('');
  const [acctBusy, setAcctBusy] = useState(false);
  const [acctErr, setAcctErr] = useState<string | null>(null);

  const userId = user?.id ?? '';

  async function copyId() {
    if (!userId) return;
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function onSignOut() {
    await signOut();
    router.push('/');
  }

  async function deleteAccount() {
    if (acctPhrase !== 'DELETE MY ACCOUNT') return;
    setAcctBusy(true);
    setAcctErr(null);
    try {
      const res = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'DELETE MY ACCOUNT' }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to delete account');
      }
      await signOut();
      router.push('/');
    } catch (e) {
      setAcctErr(e instanceof Error ? e.message : 'Failed');
    } finally {
      setAcctBusy(false);
    }
  }

  if (!isAuthenticated) {
    return <p className="text-sm text-gray-600 dark:text-white/40">Sign in to manage your account.</p>;
  }

  return (
    <div className="mx-auto max-w-container-narrow flex-1 space-y-10 pb-8">
      <SettingSection title="User ID" description="Your unique identifier. Useful for support.">
        <div className="flex flex-wrap items-center gap-2">
          <code className="field-input flex-1 min-w-0 overflow-x-auto font-mono text-xs text-gray-700 dark:text-white/70">
            {userId}
          </code>
          <button
            type="button"
            onClick={copyId}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/80 dark:hover:bg-white/[0.08]"
          >
            {copied ? <Check size={16} className="text-emerald-600 dark:text-emerald-500" /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </SettingSection>

      <Divider />

      <SettingSection title="Sign out" description="Sign out of this browser session.">
        <button
          type="button"
          onClick={onSignOut}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/80 dark:hover:bg-white/[0.08]"
        >
          Sign out
        </button>
      </SettingSection>

      <Divider />

      <SettingSection
        title="Delete account"
        description="Permanently delete your account, all simulations, and all data. Cannot be reversed."
      >
        <button
          type="button"
          onClick={() => {
            setAcctOpen(true);
            setAcctPhrase('');
            setAcctErr(null);
          }}
          className="rounded-lg border border-red-300 bg-transparent px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          Delete account
        </button>
      </SettingSection>

      {acctOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="del-acct-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAcctOpen(false);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-white/[0.08] dark:bg-[#14141a]">
            <h3 id="del-acct-title" className="text-base font-medium text-gray-900 dark:text-white">
              Delete your account?
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-white/40">This will permanently remove:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-white/50">
              <li>Your profile and preferences</li>
              <li>All simulations, messages, and verdicts</li>
              <li>Conversation history tied to your account</li>
              <li>Billing subscription data</li>
            </ul>
            <label className="mb-2 mt-4 block text-xs font-medium text-gray-700 dark:text-white/60">
              Type DELETE MY ACCOUNT to confirm
            </label>
            <input
              className="field-input mb-4 w-full text-sm"
              value={acctPhrase}
              onChange={(e) => setAcctPhrase(e.target.value)}
              autoComplete="off"
              placeholder="DELETE MY ACCOUNT"
            />
            {acctErr && <p className="mb-3 text-sm text-red-600 dark:text-red-400/90">{acctErr}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAcctOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-white/50 dark:hover:bg-white/[0.06]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={acctPhrase !== 'DELETE MY ACCOUNT' || acctBusy}
                onClick={deleteAccount}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium text-white',
                  acctPhrase === 'DELETE MY ACCOUNT' && !acctBusy
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'cursor-not-allowed bg-red-600/40',
                )}
              >
                {acctBusy ? 'Deleting…' : 'Permanently delete account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
