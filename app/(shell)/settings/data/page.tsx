'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { SettingSection, Divider } from '../_components';
import { useAuth } from '@/components/auth/AuthProvider';
import { useAppStore } from '@/lib/store/app';
import { cn } from '@/lib/design/cn';

export default function SettingsDataPage() {
  const { isAuthenticated } = useAuth();
  const fetchConversations = useAppStore((s) => s.fetchConversations);
  const setActiveConversationId = useAppStore((s) => s.setActiveConversationId);

  const [exporting, setExporting] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [delPhrase, setDelPhrase] = useState('');
  const [delBusy, setDelBusy] = useState(false);
  const [delErr, setDelErr] = useState<string | null>(null);

  async function exportData() {
    if (!isAuthenticated) return;
    setExporting(true);
    try {
      const res = await fetch('/api/user/export');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `octux-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    } finally {
      setExporting(false);
    }
  }

  async function deleteAllConversations() {
    if (delPhrase !== 'DELETE') return;
    setDelBusy(true);
    setDelErr(null);
    try {
      const res = await fetch('/api/user/conversations', { method: 'DELETE' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Delete failed');
      }
      setActiveConversationId(null);
      await fetchConversations({ silent: true });
      setDelOpen(false);
      setDelPhrase('');
    } catch (e) {
      setDelErr(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDelBusy(false);
    }
  }

  if (!isAuthenticated) {
    return <p className="text-sm text-gray-600 dark:text-white/40">Sign in to export or delete data.</p>;
  }

  return (
    <div className="mx-auto max-w-container-narrow flex-1 space-y-10 pb-8">
      <SettingSection
        title="Export your data"
        description="Download all your conversations, simulations, and verdicts as JSON."
      >
        <button
          type="button"
          onClick={exportData}
          disabled={exporting}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/70 dark:hover:bg-white/[0.08]"
        >
          {exporting ? 'Preparing…' : 'Export all data'}
        </button>
      </SettingSection>

      <Divider />

      <SettingSection
        title="Delete all simulations"
        description="Permanently delete all simulations and their data. Cannot be undone."
      >
        <button
          type="button"
          onClick={() => {
            setDelOpen(true);
            setDelPhrase('');
            setDelErr(null);
          }}
          className="rounded-lg border border-red-300 bg-transparent px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          Delete all simulations
        </button>
      </SettingSection>

      {delOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="del-conv-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDelOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-white/[0.08] dark:bg-[#14141a]">
            <div className="mb-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <h3 id="del-conv-title" className="text-base font-medium text-gray-900 dark:text-white">
                  Delete all simulations?
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-white/40">
                  This removes every simulation and related messages from Octux. Exported files are not affected
                  until you delete your account.
                </p>
              </div>
            </div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-white/60">
              Type DELETE to confirm
            </label>
            <input
              className="field-input mb-4 w-full text-sm"
              value={delPhrase}
              onChange={(e) => setDelPhrase(e.target.value)}
              autoComplete="off"
              placeholder="DELETE"
            />
            {delErr && <p className="mb-3 text-sm text-red-600 dark:text-red-400/90">{delErr}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDelOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-white/50 dark:hover:bg-white/[0.06]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={delPhrase !== 'DELETE' || delBusy}
                onClick={deleteAllConversations}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium text-white',
                  delPhrase === 'DELETE' && !delBusy
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'cursor-not-allowed bg-red-600/40',
                )}
              >
                {delBusy ? 'Deleting…' : 'Permanently delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
