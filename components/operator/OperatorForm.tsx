'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  Briefcase,
  ChevronDown,
  Rocket,
  TrendingUp,
  X,
  ChevronUp,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/shadcn/collapsible';
import { useAuth } from '@/components/auth/AuthProvider';
import OperatorRewardBanner from '@/components/operator/OperatorRewardBanner';
import { useBillingStore } from '@/lib/store/billing';
import { cn } from '@/lib/design/cn';
import {
  branchFieldProgress,
  calculateCompleteness,
  decisionStyleProgress,
  goalsProgress,
} from '@/lib/operator/completeness';
import {
  emptyAspiring,
  emptyBusinessOwner,
  emptyCareer,
  emptyInvestor,
  emptyOperatorProfile,
  defaultCareerPriorities,
} from '@/lib/operator/defaults';
import { ensureBranchData } from '@/lib/operator/ensureBranch';
import { validateRequiredFields } from '@/lib/operator/validation';
import type { OperatorProfile, OperatorType } from '@/lib/operator/types';

const INDUSTRY_OPTIONS = [
  'Tech/SaaS',
  'E-commerce',
  'F&B',
  'Manufacturing',
  'Services',
  'Finance',
  'Healthcare',
  'Real Estate',
  'Other',
] as const;

const BUSINESS_STAGE = [
  'Just launched (<1 year)',
  'Growing (1-3 years)',
  'Established (3-10 years)',
  'Mature (10+ years)',
] as const;

const TEAM_SIZE = ['Solo', '2-5', '6-20', '21-50', '50+'] as const;

const ROLE_OPTIONS = [
  'Founder/CEO',
  'Co-founder',
  'C-suite',
  'VP/Director',
  'Manager',
] as const;

const REVENUE_OPTIONS = [
  'Pre-revenue',
  '<$50K',
  '$50-200K',
  '$200K-1M',
  '$1-5M',
  '$5M+',
] as const;

const CAPITAL_OPTIONS = [
  '<$10K',
  '$10-50K',
  '$50-100K',
  '$100-500K',
  '$500K-1M',
  '$1M+',
] as const;

const FUNDING_OPTIONS = [
  'Bootstrapped',
  'Friends & Family',
  'Pre-seed',
  'Seed',
  'Series A',
  'Series B+',
] as const;

const ASPIRING_STAGE = [
  'Just an idea',
  'Researching/validating',
  'Building MVP',
  'Ready to launch',
  'Just launched (<3 months)',
] as const;

const COFOUNDER_OPTIONS = ['Solo', '1 co-founder', '2+ co-founders', 'Looking for one'] as const;

const EMPLOYMENT_OPTIONS = [
  'Full-time job (will quit)',
  'Full-time job (side project for now)',
  'Part-time/freelance',
  'Student',
  'Unemployed/full-time on this',
] as const;

const INCOME_OPTIONS = ['<$1K', '$1-3K', '$3-5K', '$5-10K', '$10K+'] as const;

const RUNWAY_OPTIONS = ['1-3 months', '3-6 months', '6-12 months', '12+ months'] as const;

const EXPERIENCE_OPTIONS = [
  'None (first time)',
  'Some (worked in the industry)',
  'Strong (domain expert)',
  'Serial (started businesses before)',
] as const;

const HELP_CHECKBOXES = [
  'Should I start this business at all?',
  'Market validation — is there demand?',
  'Financial planning — can I afford this?',
  'Location/market selection',
  'Timing — is now the right moment?',
  'Business model — how to monetize?',
  'Competitive analysis',
  'Hiring — who do I need first?',
] as const;

const SENIORITY_OPTIONS = [
  'Entry',
  'Mid',
  'Senior',
  'Lead',
  'Manager',
  'Director',
  'VP',
  'C-level',
] as const;

const CAREER_SITUATIONS: { value: string; title: string; sub: string }[] = [
  { value: 'evaluating_offers', title: 'Evaluating job offers', sub: '' },
  { value: 'career_change', title: 'Considering a career change', sub: '' },
  { value: 'negotiating', title: 'Negotiating compensation or role', sub: '' },
  { value: 'side_project', title: 'Starting something on the side', sub: '' },
  { value: 'other', title: 'Other career decision', sub: '' },
];

const SALARY_OPTIONS = [
  '<$30K',
  '$30-50K',
  '$50-80K',
  '$80-120K',
  '$120-200K',
  '$200K+',
] as const;

const LOCATION_FLEX = [
  'Must stay local',
  'Open to relocate domestically',
  'Open to relocate internationally',
  'Remote only',
] as const;

const INVESTOR_TYPES = [
  'Angel investor',
  'VC',
  'Corporate investor',
  'Retail investor',
  'Analyst',
  'Family office',
  'Other',
] as const;

const INVESTMENT_FOCUS = [
  'Tech/SaaS',
  'E-commerce',
  'Fintech',
  'Healthcare',
  'Real Estate',
  'Crypto/Web3',
  'Public markets',
  'Other',
] as const;

const CHECK_SIZES = [
  '<$5K',
  '$5-25K',
  '$25-100K',
  '$100-500K',
  '$500K-2M',
  '$2M+',
] as const;

const PORTFOLIO_SIZES = ['First investment', '2-5', '6-20', '20+'] as const;

const TIME_HORIZONS = ['<1 year', '1-3 years', '3-5 years', '5-10 years', '10+'] as const;

const PRIORITY_OPTIONS = [
  'Growth',
  'Profitability',
  'Market share',
  'Sustainability',
  'Work-life balance',
  'Learning',
] as const;

const BRANCH_CARDS: {
  id: OperatorType;
  title: string;
  sub: string;
  Icon: typeof Building2;
}[] = [
  {
    id: 'business_owner',
    title: 'I run a business',
    sub: 'Already operating, making growth decisions',
    Icon: Building2,
  },
  {
    id: 'aspiring',
    title: "I'm starting a business",
    sub: 'Planning or early stage, validating ideas',
    Icon: Rocket,
  },
  {
    id: 'career',
    title: 'Career decisions',
    sub: 'Job offers, transitions, negotiation',
    Icon: Briefcase,
  },
  {
    id: 'investor',
    title: 'Investor / Analyst',
    sub: 'Evaluating opportunities and markets',
    Icon: TrendingUp,
  },
];

function fieldClass(invalid?: boolean) {
  return cn(
    'field-input w-full rounded-[10px] border bg-white/[0.03] px-3 py-2 text-sm text-white/90 outline-none transition-colors focus:border-[#e8593c]/50',
    invalid ? 'border-red-500/50' : 'border-white/[0.08]',
  );
}

function labelClass() {
  return 'mb-1.5 block text-[12px] font-medium text-white/45';
}

function ReqLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 flex items-center gap-1 text-[12px] font-medium text-white/45">
      <span>{children}</span>
      <span className="text-[10px] text-[#e8593c]">*</span>
    </span>
  );
}

function CharCount({ value, min, showHints }: { value: string; min: number; showHints: boolean }) {
  const n = value.trim().length;
  const short = n < min;
  const warn = showHints && short;
  return (
    <span className={cn('mt-1 block text-[11px]', warn ? 'text-red-400/80' : 'text-white/35')}>
      {n}/{min} characters
      {warn ? ` — at least ${min} required` : ''}
    </span>
  );
}

function SectionShell({
  title,
  filled,
  total,
  open,
  onOpenChange,
  children,
}: {
  title: string;
  filled: number;
  total: number;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="rounded-[12px] border border-white/[0.08] bg-white/[0.02]">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-[13px] font-semibold tracking-wide text-white/75">{title}</span>
          <span className="text-[11px] text-white/35">
            {filled}/{total} fields
          </span>
        </div>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-white/40 transition-transform', open && 'rotate-180')}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-white/[0.06] px-4 pb-4 pt-2">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function progressTone(pct: number) {
  if (pct < 30) return 'bg-red-500/90';
  if (pct <= 70) return 'bg-amber-400/90';
  return 'bg-emerald-500/90';
}

export default function OperatorForm() {
  const { isAuthenticated, isLoading } = useAuth();
  const fetchBalance = useBillingStore((s) => s.fetchBalance);
  const [profile, setProfile] = useState<OperatorProfile>(() => emptyOperatorProfile());
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const lastSavedJson = useRef<string>('');
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [showRequiredHints, setShowRequiredHints] = useState(false);

  const [openIdentity, setOpenIdentity] = useState(true);
  const [openBranch, setOpenBranch] = useState(true);
  const [openBranchDetail, setOpenBranchDetail] = useState(true);
  const [openStyle, setOpenStyle] = useState(true);
  const [openGoals, setOpenGoals] = useState(true);

  const [langInput, setLangInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const { percent } = useMemo(() => calculateCompleteness(profile), [profile]);
  const branchProg = useMemo(() => branchFieldProgress(profile), [profile]);
  const styleProg = useMemo(() => decisionStyleProgress(profile), [profile]);
  const goalsProg = useMemo(() => goalsProgress(profile), [profile]);

  const identityProgress = useMemo(() => {
    let f = 0;
    let t = 5;
    if (profile.name.trim()) f++;
    if (profile.age !== null) f++;
    if (profile.location.trim()) f++;
    if (profile.nationality.trim()) f++;
    if (profile.languages.length > 0) f++;
    return { f, t };
  }, [profile]);

  const branchProgress = useMemo(() => {
    let f = 0;
    let t = 1;
    if (profile.operatorType) f++;
    return { f, t };
  }, [profile.operatorType]);

  const requiredValidation = useMemo(() => validateRequiredFields(profile), [profile]);

  useEffect(() => {
    setClaimError(null);
  }, [profile]);

  const load = useCallback(async () => {
    const res = await fetch('/api/operator');
    if (!res.ok) throw new Error('load');
    const data = await res.json();
    const p = data.profile as OperatorProfile;
    setProfile(p);
    setRewardClaimed(Boolean(data.rewardClaimed));
    lastSavedJson.current = JSON.stringify(p);
    setLoaded(true);
  }, []);

  const claimReward = useCallback(async () => {
    setShowRequiredHints(true);
    if (!validateRequiredFields(profile).complete || rewardClaimed) return;
    setClaiming(true);
    setClaimError(null);
    try {
      const res = await fetch('/api/operator/claim-reward', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setClaimError(typeof data.error === 'string' ? data.error : 'Could not claim reward');
        return;
      }
      setRewardClaimed(true);
      await fetchBalance();
    } catch {
      setClaimError('Network error');
    } finally {
      setClaiming(false);
    }
  }, [profile, rewardClaimed, fetchBalance]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoaded(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, load]);

  const save = useCallback(async () => {
    if (!isAuthenticated) return;
    const json = JSON.stringify(profile);
    if (json === lastSavedJson.current) return;
    setSaveState('saving');
    try {
      const res = await fetch('/api/operator', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      if (!res.ok) throw new Error('save');
      lastSavedJson.current = json;
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch {
      setSaveState('idle');
    }
  }, [isAuthenticated, profile]);

  useEffect(() => {
    if (!loaded || !isAuthenticated) return;
    const t = setTimeout(() => {
      void save();
    }, 2000);
    return () => clearTimeout(t);
  }, [profile, loaded, isAuthenticated, save]);

  const setType = (type: OperatorType) => {
    setProfile((prev) => ensureBranchData({ ...prev, operatorType: type }, type));
  };

  const toggleHelp = (label: string) => {
    setProfile((prev) => {
      const a = prev.aspiring ?? emptyAspiring();
      const set = new Set(a.helpNeeded);
      if (set.has(label)) set.delete(label);
      else set.add(label);
      return { ...prev, aspiring: { ...a, helpNeeded: [...set] } };
    });
  };

  const movePriority = (idx: number, dir: -1 | 1) => {
    setProfile((prev) => {
      const c = prev.career ?? emptyCareer();
      const arr = [...(c.priorities?.length ? c.priorities : defaultCareerPriorities())];
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return prev;
      const tmp = arr[idx];
      arr[idx] = arr[j];
      arr[j] = tmp;
      return { ...prev, career: { ...c, priorities: arr } };
    });
  };

  if (isLoading || !loaded) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 rounded-lg bg-white/[0.06]" />
        <div className="h-40 rounded-lg bg-white/[0.04]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <p className="text-sm text-white/45">
        Sign in to build your Operator profile — it personalizes every simulation.
      </p>
    );
  }

  const bo = profile.businessOwner ?? emptyBusinessOwner();
  const asp = profile.aspiring ?? emptyAspiring();
  const car = profile.career ?? emptyCareer();
  const inv = profile.investor ?? emptyInvestor();

  return (
    <div className="relative mx-auto max-w-[720px] flex-1 space-y-6 pb-16">
      <OperatorRewardBanner
        rewardClaimed={rewardClaimed}
        validation={requiredValidation}
        claiming={claiming}
        claimError={claimError}
        onRequestHints={() => setShowRequiredHints(true)}
        onClaim={() => void claimReward()}
      />

      <div className="sticky top-0 z-10 -mx-1 mb-2 space-y-2 bg-[#0a0a0f]/90 px-1 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] text-white/55">
            Profile {percent}% complete — more detail = better simulations
          </p>
          <span className="text-[12px] text-white/40">
            {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved ✓' : ''}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className={cn('h-full rounded-full transition-all duration-500', progressTone(percent))}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <SectionShell
        title="Identity"
        filled={identityProgress.f}
        total={identityProgress.t}
        open={openIdentity}
        onOpenChange={setOpenIdentity}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ReqLabel>Full name</ReqLabel>
            <input
              className={fieldClass(
                showRequiredHints &&
                  (!profile.name.trim() || !/\S+\s+\S+/.test(profile.name.trim())),
              )}
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              autoComplete="name"
            />
            {showRequiredHints && profile.name.trim() && !/\S+\s+\S+/.test(profile.name.trim()) ? (
              <span className="mt-1 block text-[11px] text-red-400/75">
                Enter first and last name (two words)
              </span>
            ) : null}
          </div>
          <div>
            <ReqLabel>Age</ReqLabel>
            <input
              type="number"
              min={16}
              max={100}
              className={fieldClass(
                showRequiredHints &&
                  (profile.age == null || profile.age < 16 || profile.age > 100),
              )}
              value={profile.age ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                setProfile({
                  ...profile,
                  age: v === '' ? null : Math.max(0, parseInt(v, 10) || 0),
                });
              }}
            />
          </div>
          <div>
            <ReqLabel>Location</ReqLabel>
            <input
              className={fieldClass(showRequiredHints && !profile.location.trim())}
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            />
          </div>
          <div>
            <ReqLabel>Nationality</ReqLabel>
            <input
              className={fieldClass(showRequiredHints && !profile.nationality.trim())}
              value={profile.nationality}
              onChange={(e) => setProfile({ ...profile, nationality: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass()}>Languages</label>
            <div className="flex flex-wrap gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.03] p-2">
              {profile.languages.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1 rounded-full bg-white/[0.08] px-2.5 py-1 text-[12px] text-white/80"
                >
                  {lang}
                  <button
                    type="button"
                    className="rounded p-0.5 text-white/45 hover:text-white"
                    onClick={() =>
                      setProfile({
                        ...profile,
                        languages: profile.languages.filter((x) => x !== lang),
                      })
                    }
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                className="min-w-[120px] flex-1 bg-transparent px-1 py-1 text-sm text-white/90 outline-none"
                placeholder="Type and press Enter"
                value={langInput}
                onChange={(e) => setLangInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return;
                  e.preventDefault();
                  const t = langInput.trim();
                  if (!t) return;
                  if (!profile.languages.includes(t)) {
                    setProfile({ ...profile, languages: [...profile.languages, t] });
                  }
                  setLangInput('');
                }}
              />
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        title="What brings you to Octux?"
        filled={branchProgress.f}
        total={branchProgress.t}
        open={openBranch}
        onOpenChange={setOpenBranch}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {BRANCH_CARDS.map((c) => {
            const selected = profile.operatorType === c.id;
            const Icon = c.Icon;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setType(c.id)}
                className={cn(
                  'flex flex-col items-start rounded-[12px] border p-4 text-left transition-colors',
                  selected
                    ? 'border-[#e8593c] bg-[rgba(232,89,60,0.06)]'
                    : 'border-white/[0.08] bg-[rgba(255,255,255,0.03)] hover:border-white/[0.15] hover:bg-[rgba(255,255,255,0.05)]',
                  showRequiredHints && !profile.operatorType && 'ring-1 ring-red-500/30',
                )}
              >
                <Icon size={24} className="mb-2 text-white/80" strokeWidth={1.5} />
                <span className="text-[14px] font-semibold text-white/80">{c.title}</span>
                <span className="mt-1 text-[12px] leading-snug text-white/35">{c.sub}</span>
              </button>
            );
          })}
        </div>
        {showRequiredHints && !profile.operatorType ? (
          <p className="mt-2 text-[11px] text-red-400/75">Select one path above (required for reward).</p>
        ) : null}
      </SectionShell>

      <AnimatePresence mode="wait">
        {profile.operatorType ? (
          <motion.div
            key={profile.operatorType}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <SectionShell
              title="Your path — details"
              filled={branchProg.f}
              total={branchProg.t}
              open={openBranchDetail}
              onOpenChange={setOpenBranchDetail}
            >
              {profile.operatorType === 'business_owner' && (
                <div className="space-y-8">
                  <div>
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-white/35">
                      —— Your business ——
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <ReqLabel>Company name</ReqLabel>
                        <input
                          className={fieldClass(showRequiredHints && !bo.companyName.trim())}
                          value={bo.companyName}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              businessOwner: { ...bo, companyName: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <ReqLabel>Industry</ReqLabel>
                        <select
                          className={fieldClass(showRequiredHints && !bo.industry.trim())}
                          value={bo.industry}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              businessOwner: { ...bo, industry: e.target.value },
                            })
                          }
                        >
                          <option value="" disabled>
                            Select…
                          </option>
                          {INDUSTRY_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <ReqLabel>Business stage</ReqLabel>
                        <select
                          className={fieldClass(showRequiredHints && !bo.businessStage.trim())}
                          value={bo.businessStage}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              businessOwner: { ...bo, businessStage: e.target.value },
                            })
                          }
                        >
                          <option value="" disabled>
                            Select…
                          </option>
                          {BUSINESS_STAGE.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <ReqLabel>Team size</ReqLabel>
                        <select
                          className={fieldClass(showRequiredHints && !bo.teamSize.trim())}
                          value={bo.teamSize}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              businessOwner: { ...bo, teamSize: e.target.value },
                            })
                          }
                        >
                          <option value="" disabled>
                            Select…
                          </option>
                          {TEAM_SIZE.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass()}>Role</label>
                        <select
                          className={fieldClass()}
                          value={bo.role}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              businessOwner: { ...bo, role: e.target.value },
                            })
                          }
                        >
                          <option value="">Select…</option>
                          {ROLE_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-white/35">
                      —— Financials ——
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <ReqLabel>Annual revenue</ReqLabel>
                        <select
                          className={fieldClass(showRequiredHints && !bo.annualRevenue.trim())}
                          value={bo.annualRevenue}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              businessOwner: { ...bo, annualRevenue: e.target.value },
                            })
                          }
                        >
                          <option value="" disabled>
                            Select…
                          </option>
                          {REVENUE_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass()}>Monthly burn ($)</label>
                        <input
                          type="number"
                          className={fieldClass()}
                          value={bo.monthlyBurn ?? ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            setProfile({
                              ...profile,
                              businessOwner: {
                                ...bo,
                                monthlyBurn: v === '' ? null : Number(v),
                              },
                            });
                          }}
                        />
                      </div>
                      <div>
                        <ReqLabel>Available capital</ReqLabel>
                        <select
                          className={fieldClass(showRequiredHints && !bo.availableCapital.trim())}
                          value={bo.availableCapital}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              businessOwner: { ...bo, availableCapital: e.target.value },
                            })
                          }
                        >
                          <option value="" disabled>
                            Select…
                          </option>
                          {CAPITAL_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass()}>Funding status</label>
                        <select
                          className={fieldClass()}
                          value={bo.fundingStatus}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              businessOwner: { ...bo, fundingStatus: e.target.value },
                            })
                          }
                        >
                          <option value="">Select…</option>
                          {FUNDING_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass()}>Profitable?</label>
                        <div className="flex flex-wrap gap-2">
                          {(['Yes', 'No', 'Break-even'] as const).map((x) => (
                            <button
                              key={x}
                              type="button"
                              onClick={() =>
                                setProfile({
                                  ...profile,
                                  businessOwner: { ...bo, profitable: x },
                                })
                              }
                              className={cn(
                                'rounded-lg border px-3 py-1.5 text-[13px] transition-colors',
                                bo.profitable === x
                                  ? 'border-[#e8593c] bg-[rgba(232,89,60,0.08)] text-white/90'
                                  : 'border-white/[0.1] bg-white/[0.03] text-white/55 hover:border-white/20',
                              )}
                            >
                              {x}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-white/35">
                      —— Current focus ——
                    </p>
                    <div className="space-y-4">
                      <div>
                        <ReqLabel>What decisions are you facing right now?</ReqLabel>
                        <textarea
                          className={cn(
                            fieldClass(
                              showRequiredHints && bo.currentFocus.trim().length < 50,
                            ),
                            'min-h-[100px] resize-y',
                          )}
                          value={bo.currentFocus}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              businessOwner: { ...bo, currentFocus: e.target.value },
                            })
                          }
                        />
                        <CharCount value={bo.currentFocus} min={50} showHints={showRequiredHints} />
                      </div>
                      <div>
                        <ReqLabel>Top business challenges</ReqLabel>
                        <p className="mb-2 text-[11px] text-white/35">At least one required for reward</p>
                        {[0, 1, 2].map((i) => (
                          <input
                            key={i}
                            className={cn(
                              fieldClass(
                                showRequiredHints &&
                                  i === 0 &&
                                  !bo.topChallenges?.some((c) => c.trim().length > 0),
                              ),
                              'mb-2',
                            )}
                            placeholder={`${i + 1}.`}
                            value={bo.topChallenges[i] ?? ''}
                            onChange={(e) => {
                              const next = [...(bo.topChallenges.length ? bo.topChallenges : ['', '', ''])];
                              next[i] = e.target.value;
                              setProfile({
                                ...profile,
                                businessOwner: { ...bo, topChallenges: next },
                              });
                            }}
                          />
                        ))}
                      </div>
                      <div>
                        <label className={labelClass()}>Key constraints</label>
                        <textarea
                          className={cn(fieldClass(), 'min-h-[88px] resize-y')}
                          value={bo.constraints}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              businessOwner: { ...bo, constraints: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {profile.operatorType === 'aspiring' && (
                <div className="space-y-8">
                  <div>
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-white/35">
                      —— Your idea ——
                    </p>
                    <div className="space-y-4">
                      <div>
                        <ReqLabel>What&apos;s your business idea?</ReqLabel>
                        <textarea
                          className={cn(
                            fieldClass(
                              showRequiredHints && asp.businessIdea.trim().length < 50,
                            ),
                            'min-h-[100px] resize-y',
                          )}
                          value={asp.businessIdea}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              aspiring: { ...asp, businessIdea: e.target.value },
                            })
                          }
                        />
                        <CharCount value={asp.businessIdea} min={50} showHints={showRequiredHints} />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <ReqLabel>Industry</ReqLabel>
                          <select
                            className={fieldClass(showRequiredHints && !asp.industry.trim())}
                            value={asp.industry}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                aspiring: { ...asp, industry: e.target.value },
                              })
                            }
                          >
                            <option value="" disabled>
                              Select…
                            </option>
                            {INDUSTRY_OPTIONS.map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <ReqLabel>How far along?</ReqLabel>
                          <select
                            className={fieldClass(showRequiredHints && !asp.stage.trim())}
                            value={asp.stage}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                aspiring: { ...asp, stage: e.target.value },
                              })
                            }
                          >
                            <option value="" disabled>
                              Select…
                            </option>
                            {ASPIRING_STAGE.map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelClass()}>Co-founders</label>
                          <select
                            className={fieldClass()}
                            value={asp.coFounders}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                aspiring: { ...asp, coFounders: e.target.value },
                              })
                            }
                          >
                            <option value="">Select…</option>
                            {COFOUNDER_OPTIONS.map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-white/35">
                      —— Your resources ——
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <ReqLabel>Available capital</ReqLabel>
                        <select
                          className={fieldClass(showRequiredHints && !asp.availableCapital.trim())}
                          value={asp.availableCapital}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              aspiring: { ...asp, availableCapital: e.target.value },
                            })
                          }
                        >
                          <option value="" disabled>
                            Select…
                          </option>
                          {CAPITAL_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <ReqLabel>Current employment</ReqLabel>
                        <select
                          className={fieldClass(showRequiredHints && !asp.currentEmployment.trim())}
                          value={asp.currentEmployment}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              aspiring: { ...asp, currentEmployment: e.target.value },
                            })
                          }
                        >
                          <option value="" disabled>
                            Select…
                          </option>
                          {EMPLOYMENT_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass()}>Monthly income</label>
                        <select
                          className={fieldClass()}
                          value={asp.monthlyIncome}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              aspiring: { ...asp, monthlyIncome: e.target.value },
                            })
                          }
                        >
                          <option value="">Select…</option>
                          {INCOME_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass()}>Can go without income for</label>
                        <select
                          className={fieldClass()}
                          value={asp.runwayMonths}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              aspiring: { ...asp, runwayMonths: e.target.value },
                            })
                          }
                        >
                          <option value="">Select…</option>
                          {RUNWAY_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-white/35">
                      —— Your background ——
                    </p>
                    <div className="space-y-4">
                      <div>
                        <ReqLabel>Relevant experience</ReqLabel>
                        <select
                          className={fieldClass(showRequiredHints && !asp.relevantExperience.trim())}
                          value={asp.relevantExperience}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              aspiring: { ...asp, relevantExperience: e.target.value },
                            })
                          }
                        >
                          <option value="" disabled>
                            Select…
                          </option>
                          {EXPERIENCE_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <ReqLabel>Biggest fear about starting</ReqLabel>
                        <textarea
                          className={cn(
                            fieldClass(
                              showRequiredHints && asp.biggestFear.trim().length < 30,
                            ),
                            'min-h-[88px] resize-y',
                          )}
                          value={asp.biggestFear}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              aspiring: { ...asp, biggestFear: e.target.value },
                            })
                          }
                        />
                        <CharCount value={asp.biggestFear} min={30} showHints={showRequiredHints} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-white/35">
                      —— What you need help deciding ——
                    </p>
                    <div className="grid gap-2">
                      {HELP_CHECKBOXES.map((h) => (
                        <label key={h} className="flex cursor-pointer items-start gap-2 text-[13px] text-white/70">
                          <input
                            type="checkbox"
                            className="mt-1 rounded border-white/20 bg-white/5"
                            checked={asp.helpNeeded.includes(h)}
                            onChange={() => toggleHelp(h)}
                          />
                          <span>{h}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {profile.operatorType === 'career' && (
                <div className="space-y-8">
                  <div>
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-white/35">
                      —— Your career ——
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <ReqLabel>Current role</ReqLabel>
                        <input
                          className={fieldClass(showRequiredHints && !car.currentRole.trim())}
                          value={car.currentRole}
                          onChange={(e) =>
                            setProfile({ ...profile, career: { ...car, currentRole: e.target.value } })
                          }
                        />
                      </div>
                      <div>
                        <ReqLabel>Company</ReqLabel>
                        <input
                          className={fieldClass(showRequiredHints && !car.company.trim())}
                          value={car.company}
                          onChange={(e) =>
                            setProfile({ ...profile, career: { ...car, company: e.target.value } })
                          }
                        />
                      </div>
                      <div>
                        <ReqLabel>Industry</ReqLabel>
                        <select
                          className={fieldClass(showRequiredHints && !car.industry.trim())}
                          value={car.industry}
                          onChange={(e) =>
                            setProfile({ ...profile, career: { ...car, industry: e.target.value } })
                          }
                        >
                          <option value="" disabled>
                            Select…
                          </option>
                          {INDUSTRY_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass()}>Years in role</label>
                        <input
                          type="number"
                          className={fieldClass()}
                          value={car.yearsInRole ?? ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            setProfile({
                              ...profile,
                              career: {
                                ...car,
                                yearsInRole: v === '' ? null : Math.max(0, parseInt(v, 10) || 0),
                              },
                            });
                          }}
                        />
                      </div>
                      <div>
                        <ReqLabel>Years of experience</ReqLabel>
                        <input
                          type="number"
                          className={fieldClass(
                            showRequiredHints &&
                              (car.yearsExperience == null ||
                                typeof car.yearsExperience !== 'number' ||
                                car.yearsExperience < 0),
                          )}
                          value={car.yearsExperience ?? ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            setProfile({
                              ...profile,
                              career: {
                                ...car,
                                yearsExperience: v === '' ? null : Math.max(0, parseInt(v, 10) || 0),
                              },
                            });
                          }}
                        />
                      </div>
                      <div>
                        <ReqLabel>Seniority</ReqLabel>
                        <select
                          className={fieldClass(showRequiredHints && !car.seniority.trim())}
                          value={car.seniority}
                          onChange={(e) =>
                            setProfile({ ...profile, career: { ...car, seniority: e.target.value } })
                          }
                        >
                          <option value="" disabled>
                            Select…
                          </option>
                          {SENIORITY_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-white/35">
                      —— Your situation ——
                    </p>
                    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {CAREER_SITUATIONS.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() =>
                            setProfile({ ...profile, career: { ...car, situation: s.value } })
                          }
                          className={cn(
                            'rounded-[12px] border p-3 text-left text-[13px] transition-colors',
                            car.situation === s.value
                              ? 'border-[#e8593c] bg-[rgba(232,89,60,0.06)] text-white/85'
                              : 'border-white/[0.08] bg-[rgba(255,255,255,0.03)] hover:border-white/[0.15]',
                            showRequiredHints && !car.situation && 'ring-1 ring-red-500/35',
                          )}
                        >
                          {s.title}
                        </button>
                      ))}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass()}>Current salary range</label>
                        <select
                          className={fieldClass()}
                          value={car.salaryRange}
                          onChange={(e) =>
                            setProfile({ ...profile, career: { ...car, salaryRange: e.target.value } })
                          }
                        >
                          <option value="">Select…</option>
                          {SALARY_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass()}>Location flexibility</label>
                        <select
                          className={fieldClass()}
                          value={car.locationFlexibility}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              career: { ...car, locationFlexibility: e.target.value },
                            })
                          }
                        >
                          <option value="">Select…</option>
                          {LOCATION_FLEX.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-white/35">
                      —— Priorities ——
                    </p>
                    <p className="mb-2 text-[12px] text-white/40">Reorder (up/down)</p>
                    <ul className="space-y-2">
                      {(car.priorities?.length ? car.priorities : defaultCareerPriorities()).map((p, idx, arr) => (
                        <li
                          key={`${p}-${idx}`}
                          className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] text-white/75"
                        >
                          <span className="w-5 text-white/35">{idx + 1}.</span>
                          <span className="flex-1">{p}</span>
                          <button
                            type="button"
                            className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-white"
                            aria-label="Move up"
                            onClick={() => movePriority(idx, -1)}
                            disabled={idx === 0}
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            type="button"
                            className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-white"
                            aria-label="Move down"
                            onClick={() => movePriority(idx, 1)}
                            disabled={idx === arr.length - 1}
                          >
                            <ChevronDown size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <ReqLabel>What you need help deciding</ReqLabel>
                    <textarea
                      className={cn(
                        fieldClass(
                          showRequiredHints && car.decisionContext.trim().length < 50,
                        ),
                        'min-h-[100px] resize-y',
                      )}
                      value={car.decisionContext}
                      onChange={(e) =>
                        setProfile({ ...profile, career: { ...car, decisionContext: e.target.value } })
                      }
                    />
                    <CharCount value={car.decisionContext} min={50} showHints={showRequiredHints} />
                  </div>
                </div>
              )}

              {profile.operatorType === 'investor' && (
                <div className="space-y-8">
                  <div>
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-white/35">
                      —— Your profile ——
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <ReqLabel>Investor type</ReqLabel>
                        <select
                          className={fieldClass(showRequiredHints && !inv.investorType.trim())}
                          value={inv.investorType}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              investor: { ...inv, investorType: e.target.value },
                            })
                          }
                        >
                          <option value="" disabled>
                            Select…
                          </option>
                          {INVESTOR_TYPES.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <ReqLabel>Investment focus</ReqLabel>
                        <select
                          className={fieldClass(showRequiredHints && !inv.investmentFocus.trim())}
                          value={inv.investmentFocus}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              investor: { ...inv, investmentFocus: e.target.value },
                            })
                          }
                        >
                          <option value="" disabled>
                            Select…
                          </option>
                          {INVESTMENT_FOCUS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <ReqLabel>Typical check size</ReqLabel>
                        <select
                          className={fieldClass(showRequiredHints && !inv.checkSize.trim())}
                          value={inv.checkSize}
                          onChange={(e) =>
                            setProfile({ ...profile, investor: { ...inv, checkSize: e.target.value } })
                          }
                        >
                          <option value="" disabled>
                            Select…
                          </option>
                          {CHECK_SIZES.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass()}>Portfolio size</label>
                        <select
                          className={fieldClass()}
                          value={inv.portfolioSize}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              investor: { ...inv, portfolioSize: e.target.value },
                            })
                          }
                        >
                          <option value="">Select…</option>
                          {PORTFOLIO_SIZES.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-white/35">
                      —— Current focus ——
                    </p>
                    <div className="space-y-4">
                      <div>
                        <ReqLabel>What are you evaluating?</ReqLabel>
                        <textarea
                          className={cn(
                            fieldClass(
                              showRequiredHints && inv.currentEvaluation.trim().length < 50,
                            ),
                            'min-h-[100px] resize-y',
                          )}
                          value={inv.currentEvaluation}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              investor: { ...inv, currentEvaluation: e.target.value },
                            })
                          }
                        />
                        <CharCount value={inv.currentEvaluation} min={50} showHints={showRequiredHints} />
                      </div>
                      <div>
                        <ReqLabel>Risk appetite (1–10)</ReqLabel>
                        <p className="mb-1 text-[12px] text-white/45">
                          {inv.riskAppetite}/10 — Conservative → Aggressive
                        </p>
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={inv.riskAppetite}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              investor: { ...inv, riskAppetite: Number(e.target.value) },
                            })
                          }
                          className="w-full accent-[#e8593c]"
                        />
                      </div>
                      <div>
                        <label className={labelClass()}>Time horizon</label>
                        <select
                          className={fieldClass()}
                          value={inv.timeHorizon}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              investor: { ...inv, timeHorizon: e.target.value },
                            })
                          }
                        >
                          <option value="">Select…</option>
                          {TIME_HORIZONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </SectionShell>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <SectionShell
        title="Decision style"
        filled={styleProg.f}
        total={styleProg.t}
        open={openStyle}
        onOpenChange={setOpenStyle}
      >
        <div className="space-y-5">
          <div>
            <ReqLabel>Risk tolerance</ReqLabel>
            <p className="mb-1 text-[12px] text-white/45">
              {profile.riskTolerance}/10 — Conservative → Aggressive
            </p>
            {!profile._riskTouched ? (
              <p className="mb-1 text-[11px] text-amber-400/70">Adjust this slider (required for reward)</p>
            ) : null}
            <input
              type="range"
              min={1}
              max={10}
              value={profile.riskTolerance}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  riskTolerance: Number(e.target.value),
                  _riskTouched: true,
                })
              }
              className="w-full accent-[#e8593c]"
            />
          </div>
          <div>
            <ReqLabel>Decision speed</ReqLabel>
            <p className="mb-1 text-[12px] text-white/45">
              {profile.decisionSpeed}/10 — Methodical → Fast
            </p>
            {!profile._speedTouched ? (
              <p className="mb-1 text-[11px] text-amber-400/70">Adjust this slider (required for reward)</p>
            ) : null}
            <input
              type="range"
              min={1}
              max={10}
              value={profile.decisionSpeed}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  decisionSpeed: Number(e.target.value),
                  _speedTouched: true,
                })
              }
              className="w-full accent-[#e8593c]"
            />
          </div>
          <div>
            <label className={labelClass()}>Primary priority</label>
            <select
              className={fieldClass()}
              value={profile.priority}
              onChange={(e) => setProfile({ ...profile, priority: e.target.value })}
            >
              <option value="">Select…</option>
              {PRIORITY_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        title="Your goals"
        filled={goalsProg.f}
        total={goalsProg.t}
        open={openGoals}
        onOpenChange={setOpenGoals}
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-1">
            <div>
              <ReqLabel>6-month goal</ReqLabel>
              <textarea
                className={cn(
                  fieldClass(
                    showRequiredHints && profile.sixMonthGoal.trim().length < 20,
                  ),
                  'min-h-[72px] resize-y',
                )}
                value={profile.sixMonthGoal}
                onChange={(e) => setProfile({ ...profile, sixMonthGoal: e.target.value })}
              />
              <CharCount value={profile.sixMonthGoal} min={20} showHints={showRequiredHints} />
            </div>
            <div>
              <ReqLabel>1-year goal</ReqLabel>
              <textarea
                className={cn(
                  fieldClass(
                    showRequiredHints && profile.oneYearGoal.trim().length < 20,
                  ),
                  'min-h-[72px] resize-y',
                )}
                value={profile.oneYearGoal}
                onChange={(e) => setProfile({ ...profile, oneYearGoal: e.target.value })}
              />
              <CharCount value={profile.oneYearGoal} min={20} showHints={showRequiredHints} />
            </div>
            <div>
              <label className={labelClass()}>3-year goal</label>
              <input
                className={fieldClass()}
                value={profile.threeYearGoal}
                onChange={(e) => setProfile({ ...profile, threeYearGoal: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className={labelClass()}>Domain expertise</label>
            <p className="mb-2 text-[11px] text-white/35">Type a tag and press Enter</p>
            <div className="flex flex-wrap gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.03] p-2">
              {profile.domainExpertise.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-white/[0.08] px-2.5 py-1 text-[12px] text-white/80"
                >
                  {tag}
                  <button
                    type="button"
                    className="rounded p-0.5 text-white/45 hover:text-white"
                    onClick={() =>
                      setProfile({
                        ...profile,
                        domainExpertise: profile.domainExpertise.filter((x) => x !== tag),
                      })
                    }
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                className="min-w-[140px] flex-1 bg-transparent px-1 py-1 text-sm text-white/90 outline-none"
                placeholder="e.g. AI/ML, Korean market"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return;
                  e.preventDefault();
                  const t = tagInput.trim();
                  if (!t) return;
                  if (!profile.domainExpertise.includes(t)) {
                    setProfile({ ...profile, domainExpertise: [...profile.domainExpertise, t] });
                  }
                  setTagInput('');
                }}
              />
            </div>
          </div>
        </div>
      </SectionShell>
    </div>
  );
}
