'use client';

import { useEffect, useState } from 'react';
import { SettingSection, SettingField, Divider, SettingSkeleton } from '../_components';
import { useAuth } from '@/components/auth/AuthProvider';

const SUKGO_PROFILE_KEY = 'sukgo_profile';

type LocalProfile = {
  name: string;
  location: string;
  operatorType: string;
};

const OPERATOR_TYPES: { id: string; label: string }[] = [
  { id: 'business_owner', label: 'Business owner' },
  { id: 'aspiring', label: 'Aspiring entrepreneur' },
  { id: 'investor', label: 'Investor' },
  { id: 'career', label: 'Career professional' },
];

function readLocalProfile(): LocalProfile {
  try {
    const raw = localStorage.getItem(SUKGO_PROFILE_KEY);
    if (!raw) return { name: '', location: '', operatorType: '' };
    const o = JSON.parse(raw) as Record<string, unknown>;
    return {
      name: typeof o.name === 'string' ? o.name : '',
      location: typeof o.location === 'string' ? o.location : '',
      operatorType: typeof o.operatorType === 'string' ? o.operatorType : '',
    };
  } catch {
    return { name: '', location: '', operatorType: '' };
  }
}

function writeLocalProfile(p: LocalProfile) {
  try {
    localStorage.setItem(SUKGO_PROFILE_KEY, JSON.stringify(p));
  } catch {
    /* private mode */
  }
}

export default function SettingsProfilePage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [decisionContext, setDecisionContext] = useState('');
  const [location, setLocation] = useState('');
  const [operatorType, setOperatorType] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      const local = readLocalProfile();
      setFullName(local.name);
      setDisplayName(local.name);
      setLocation(local.location);
      setOperatorType(local.operatorType);
      setLoading(false);
      return;
    }

    const localFirst = readLocalProfile();
    setLocation(localFirst.location);
    setOperatorType(localFirst.operatorType);

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        if (cancelled) return;
        setFullName(data.fullName || '');
        setDisplayName(data.displayName || '');
        setEmail(data.email || '');
        setDecisionContext(data.decisionContext || '');
        const local = readLocalProfile();
        setLocation((prev) => prev || local.location);
        setOperatorType((prev) => prev || local.operatorType);
      } catch {
        if (!cancelled) setError('Could not load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authLoading]);

  async function onSave() {
    const local: LocalProfile = {
      name: displayName.trim() || fullName.trim(),
      location: location.trim(),
      operatorType,
    };
    writeLocalProfile(local);

    if (!isAuthenticated) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      return;
    }

    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, displayName, decisionContext }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Save failed');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) {
    return <SettingSkeleton />;
  }

  const welcomeName =
    displayName.trim() ||
    fullName.trim() ||
    (typeof user?.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : '') ||
    user?.email?.split('@')[0] ||
    '';

  return (
    <div className="mx-auto w-full max-w-container-narrow flex-1 space-y-10 pb-12 text-gray-900 dark:text-[#f5f5f0]">
      <header className="space-y-1 border-b border-gray-200 pb-6 dark:border-white/[0.08]">
        <h1 className="text-[22px] font-medium tracking-tight text-gray-900 dark:text-[#f5f5f0]">
          My Operator
        </h1>
        <p className="text-[13px] text-gray-500 dark:text-[#8a8a82]">
          Your profile shapes how specialists analyze your decisions.
        </p>
      </header>

      {!isAuthenticated ? (
        <div
          className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-[13px] text-gray-800 dark:border-white/15 dark:bg-white/[0.06] dark:text-white/80"
          role="status"
        >
          Sign in to sync your name and decision context to your account. Until then, your operator
          details are saved only on this device.
          <button
            type="button"
            className="ml-2 font-medium text-[#b45309] underline-offset-2 hover:underline dark:text-white"
            onClick={() =>
              window.dispatchEvent(new CustomEvent('sukgo:show-auth', { detail: { mode: 'login' } }))
            }
          >
            Sign in
          </button>
        </div>
      ) : null}

      <SettingSection title="Operator context" description="Used to personalize simulations (stored on this device + your account when signed in).">
        <SettingField label="Location" hint="Where you operate">
          <input
            className="field-input w-full text-sm"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Seoul, New York, São Paulo…"
            autoComplete="off"
          />
        </SettingField>
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-700 dark:text-white/60">I am…</span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {OPERATOR_TYPES.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setOperatorType(opt.id)}
                className={`rounded-xl border px-4 py-3 text-left text-[13px] transition-all ${
                  operatorType === opt.id
                    ? 'border-white/30 bg-white/[0.08] text-white'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 dark:border-[#3a3a36] dark:bg-[#1a1a18] dark:text-[#8a8a82] dark:hover:border-[#5a5a55]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </SettingSection>

      {isAuthenticated ? (
        <>
          <Divider />
          <SettingSection title="Account profile" description="Your personal information.">
            {loading ? (
              <SettingSkeleton />
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  <SettingField label="Full name">
                    <input
                      className="field-input w-full text-sm"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoComplete="name"
                    />
                  </SettingField>
                  <SettingField label="Display name" hint="How Sukgo addresses you">
                    <input
                      className="field-input w-full text-sm"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      autoComplete="nickname"
                    />
                  </SettingField>
                </div>
                <SettingField label="Email" hint="Contact support to change">
                  <input
                    className="field-input w-full cursor-not-allowed text-sm opacity-80"
                    value={email}
                    disabled
                    readOnly
                  />
                </SettingField>
              </>
            )}
          </SettingSection>

          <Divider />

          <SettingSection
            title="Decision context"
            description="Tell Sukgo about your situation so simulations are more personalized."
          >
            <textarea
              className="field-input min-h-[104px] w-full resize-y text-sm leading-relaxed"
              placeholder="I'm a 28-year-old entrepreneur in Seoul…"
              rows={4}
              value={decisionContext}
              onChange={(e) => setDecisionContext(e.target.value)}
            />
          </SettingSection>
        </>
      ) : (
        <SettingSection title="Display name" description="How you’d like to be called in the app (saved on this device).">
          <SettingField label="Name">
            <input
              className="field-input w-full text-sm"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </SettingField>
        </SettingSection>
      )}

      {welcomeName ? (
        <p className="text-[12px] text-gray-500 dark:text-[#5a5a55]">
          Preview: simulations will reference “{welcomeName}” when helpful.
        </p>
      ) : null}

      {error ? (
        <div className="octx-banner-error" role="alert">
          {error}
        </div>
      ) : null}
      {saved ? (
        <div className="octx-banner-success" role="status">
          {isAuthenticated ? 'Changes saved.' : 'Saved on this device.'}
        </div>
      ) : null}

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving || (isAuthenticated && loading)}
          className="rounded-[8px] bg-white px-5 py-2.5 text-sm font-medium text-[#0a0a0f] shadow-sm transition-opacity hover:bg-[#e5e5e5] disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </div>

      <p className="text-center text-[11px] text-gray-500 dark:text-[#5a5a55]">
        This info helps the Chief design better specialists for your questions.
      </p>
    </div>
  );
}
