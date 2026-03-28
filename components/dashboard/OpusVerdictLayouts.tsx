'use client';

import type { CompareVerdict, PremortemOpusVerdict, StressOpusVerdict } from '@/lib/simulation/types';

const HEADER = 'text-[10px] font-medium uppercase tracking-[0.2em] text-white/25';

function SourcesBlock({ sources }: { sources?: { title: string; url: string }[] }) {
  if (!sources?.length) return null;
  return (
    <div className="border-t border-white/[0.06] pt-4">
      <p className={HEADER}>Sources</p>
      <ul className="mt-3 space-y-1.5">
        {sources.map((src, i) => (
          <li key={`${src.url}-${i}`}>
            <a
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-[12px] text-white/40 transition-colors hover:text-white/65"
            >
              {src.title || src.url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CompareOpusVerdictLayout({ verdict }: { verdict: CompareVerdict }) {
  const optA = verdict.option_a;
  const optB = verdict.option_b;
  return (
    <div className="mb-6 space-y-6">
      <div>
        <div className="text-[11px] text-white/30 uppercase tracking-wider">Head-to-head report</div>
        <div className="mt-1 text-[24px] font-medium text-white">
          {verdict.winner === 'neither' ? 'No clear winner' : `Option ${verdict.winner} wins`}
          <span className="ml-2 text-white/40">{verdict.confidence}%</span>
        </div>
        <div className="text-[13px] text-white/30">Grade: {verdict.grade}</div>
        <p className="mt-2 text-[14px] text-white/50">{verdict.headline}</p>
        {verdict.executive_summary ? (
          <p className="mt-3 text-[13px] leading-relaxed text-white/45">{verdict.executive_summary}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="mb-1 text-[12px] text-white/40">
            {optA?.label || 'Option A'}: {optA?.score ?? 0}/100
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-blue-500/60" style={{ width: `${Math.min(100, optA?.score ?? 0)}%` }} />
          </div>
          <div className="mt-2 space-y-1">
            {optA?.strengths?.map((s, j) => (
              <div key={j} className="text-[11px] text-green-400/60">
                ✓ {s}
              </div>
            ))}
            {optA?.weaknesses?.map((w, j) => (
              <div key={j} className="text-[11px] text-red-400/50">
                ✗ {w}
              </div>
            ))}
          </div>
          {optA?.specialist_consensus ? (
            <p className="mt-2 text-[11px] leading-relaxed text-white/35">Team A: {optA.specialist_consensus}</p>
          ) : null}
          {optA?.crowd_sentiment ? (
            <p className="mt-1 text-[11px] text-white/30">Crowd: {optA.crowd_sentiment}</p>
          ) : null}
        </div>
        <div>
          <div className="mb-1 text-[12px] text-white/40">
            {optB?.label || 'Option B'}: {optB?.score ?? 0}/100
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-rose-500/60" style={{ width: `${Math.min(100, optB?.score ?? 0)}%` }} />
          </div>
          <div className="mt-2 space-y-1">
            {optB?.strengths?.map((s, j) => (
              <div key={j} className="text-[11px] text-green-400/60">
                ✓ {s}
              </div>
            ))}
            {optB?.weaknesses?.map((w, j) => (
              <div key={j} className="text-[11px] text-red-400/50">
                ✗ {w}
              </div>
            ))}
          </div>
          {optB?.specialist_consensus ? (
            <p className="mt-2 text-[11px] leading-relaxed text-white/35">Team B: {optB.specialist_consensus}</p>
          ) : null}
          {optB?.crowd_sentiment ? (
            <p className="mt-1 text-[11px] text-white/30">Crowd: {optB.crowd_sentiment}</p>
          ) : null}
        </div>
      </div>

      {verdict.head_to_head?.length ? (
        <div>
          <div className={`${HEADER} mb-3`}>Head to head</div>
          {verdict.head_to_head.map((h, i) => {
            const sa = h.score_a ?? 50;
            const sb = h.score_b ?? 50;
            const sum = sa + sb || 1;
            const wa = Math.round((100 * sa) / sum);
            const wb = 100 - wa;
            return (
              <div key={i} className="mb-2 flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-[11px] text-white/40">{h.dimension}</span>
                <div className="flex h-3 flex-1 gap-0.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full bg-blue-500/50" style={{ width: `${wa}%` }} />
                  <div className="h-full bg-rose-500/50" style={{ width: `${wb}%` }} />
                </div>
                <span
                  className={`w-4 shrink-0 text-center text-[10px] font-medium ${
                    h.winner === 'A' ? 'text-blue-400' : h.winner === 'B' ? 'text-rose-400' : 'text-white/30'
                  }`}
                >
                  {h.winner === 'tie' ? '=' : h.winner}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}

      {verdict.risks ? (
        <div className="space-y-2 text-[12px] text-white/45">
          {verdict.risks.if_choosing_a?.length ? (
            <div>
              <p className={HEADER}>If you choose A</p>
              <ul className="mt-1 list-inside list-disc text-[11px] text-white/40">
                {verdict.risks.if_choosing_a.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {verdict.risks.if_choosing_b?.length ? (
            <div>
              <p className={HEADER}>If you choose B</p>
              <ul className="mt-1 list-inside list-disc text-[11px] text-white/40">
                {verdict.risks.if_choosing_b.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {verdict.risks.if_choosing_neither ? (
            <p className="border-l-2 border-amber-400/35 pl-3 text-[11px] text-white/40">
              If you delay: {verdict.risks.if_choosing_neither}
            </p>
          ) : null}
        </div>
      ) : null}

      {verdict.next_steps?.if_a?.length || verdict.next_steps?.if_b?.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {verdict.next_steps.if_a?.length ? (
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <p className={HEADER}>Next steps if A</p>
              <ul className="mt-2 space-y-2 text-[11px] text-white/50">
                {verdict.next_steps.if_a.map((n, i) => (
                  <li key={i}>
                    <span className="text-white/30">{n.timeframe}: </span>
                    {n.action}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {verdict.next_steps.if_b?.length ? (
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <p className={HEADER}>Next steps if B</p>
              <ul className="mt-2 space-y-2 text-[11px] text-white/50">
                {verdict.next_steps.if_b.map((n, i) => (
                  <li key={i}>
                    <span className="text-white/30">{n.timeframe}: </span>
                    {n.action}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {verdict.final_word ? (
        <div className="border-l-2 border-[#e8593c]/40 pl-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#e8593c]/80">Final word</p>
          <p className="mt-1 text-[13px] leading-relaxed text-white/55">{verdict.final_word}</p>
        </div>
      ) : null}

      <SourcesBlock sources={verdict.sources} />
    </div>
  );
}

export function StressOpusVerdictLayout({ verdict }: { verdict: StressOpusVerdict }) {
  const riskColors: Record<string, string> = {
    LOW: 'text-green-400',
    MODERATE: 'text-yellow-400',
    HIGH: 'text-orange-400',
    CRITICAL: 'text-red-400',
  };
  const severityClass: Record<string, string> = {
    critical: 'border-red-500/40 bg-red-500/5',
    high: 'border-orange-500/30 bg-orange-500/5',
    medium: 'border-yellow-500/20 bg-yellow-500/5',
    low: 'border-white/10 bg-white/[0.02]',
  };
  const rl = verdict.risk_level;
  return (
    <div className="mb-6 space-y-6">
      <div>
        <div className="text-[11px] text-white/30 uppercase tracking-wider">Vulnerability audit</div>
        <div className="mt-1 flex items-baseline gap-3">
          <span className="text-[28px] font-medium text-white">{verdict.survival_probability}%</span>
          <span className="text-[14px] text-white/40">survival probability</span>
        </div>
        <div className={`text-[13px] font-medium ${riskColors[rl] || 'text-white/50'}`}>Risk level: {rl}</div>
        <p className="mt-2 text-[14px] text-white/50">{verdict.headline}</p>
        {verdict.executive_summary ? (
          <p className="mt-2 text-[13px] leading-relaxed text-white/45">{verdict.executive_summary}</p>
        ) : null}
      </div>

      {verdict.breaking_point ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/[0.03] p-4">
          <div className="mb-1 text-[11px] uppercase tracking-wider text-red-400/60">Breaking point</div>
          <p className="text-[13px] text-white/70">{verdict.breaking_point.description}</p>
          <div className="mt-2 flex gap-4 text-[11px] text-white/30">
            <span>Probability: {verdict.breaking_point.probability}%</span>
            <span>When: {verdict.breaking_point.timeframe}</span>
          </div>
        </div>
      ) : null}

      {verdict.resilience_scores?.length ? (
        <div>
          <div className={`${HEADER} mb-3`}>Resilience scores</div>
          {verdict.resilience_scores.map((r, i) => (
            <div key={i} className="mb-2">
              <div className="mb-1 flex justify-between text-[11px]">
                <span className="text-white/40">{r.dimension}</span>
                <span className="text-white/30">{r.score}/100</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={`h-full rounded-full ${
                    r.score >= 70 ? 'bg-green-500/50' : r.score >= 40 ? 'bg-yellow-500/50' : 'bg-red-500/50'
                  }`}
                  style={{ width: `${Math.min(100, r.score)}%` }}
                />
              </div>
              {r.explanation ? <p className="mt-0.5 text-[10px] text-white/25">{r.explanation}</p> : null}
            </div>
          ))}
        </div>
      ) : null}

      {verdict.vulnerabilities?.length ? (
        <div>
          <div className={`${HEADER} mb-3`}>Vulnerabilities ({verdict.vulnerabilities.length})</div>
          {verdict.vulnerabilities.map((v, i) => (
            <div key={i} className={`mb-2 rounded-lg border p-3 ${severityClass[v.severity] || severityClass.low}`}>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                    v.severity === 'critical'
                      ? 'bg-red-500/20 text-red-400'
                      : v.severity === 'high'
                        ? 'bg-orange-500/20 text-orange-400'
                        : v.severity === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-white/10 text-white/40'
                  }`}
                >
                  {v.severity}
                </span>
                <span className="text-[12px] font-medium text-white/60">{v.title}</span>
              </div>
              <p className="text-[11px] text-white/40">{v.description}</p>
              {v.specialist_who_found ? (
                <p className="mt-1 text-[10px] text-white/25">Raised by: {v.specialist_who_found}</p>
              ) : null}
              <div className="mt-2 text-[11px] text-green-400/50">
                Fix: {v.mitigation?.action}
                {v.mitigation?.cost ? <span className="ml-2 text-white/20">({v.mitigation.cost})</span> : null}
                {typeof v.mitigation?.effectiveness === 'number' ? (
                  <span className="ml-2 text-white/25">~{v.mitigation.effectiveness}% effective</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {verdict.worst_case_scenario?.narrative ? (
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
          <p className={HEADER}>Worst case</p>
          <p className="mt-2 text-[12px] leading-relaxed text-white/50">{verdict.worst_case_scenario.narrative}</p>
          <div className="mt-2 text-[11px] text-white/35">
            <span className="text-white/25">Loss: </span>
            {verdict.worst_case_scenario.total_loss}
            <span className="mx-2 text-white/15">·</span>
            <span className="text-white/25">Recovery: </span>
            {verdict.worst_case_scenario.recovery_time}
          </div>
        </div>
      ) : null}

      {verdict.kill_switches?.length ? (
        <div>
          <div className={`${HEADER} mb-2`}>Kill switches</div>
          {verdict.kill_switches.map((ks, i) => (
            <div key={i} className="mb-2 flex flex-wrap gap-2 text-[11px]">
              <span className="shrink-0 text-red-400/50">IF:</span>
              <span className="min-w-0 text-white/40">{ks.trigger}</span>
              <span className="shrink-0 text-amber-400/50">→</span>
              <span className="min-w-0 text-white/50">{ks.action}</span>
            </div>
          ))}
        </div>
      ) : null}

      {verdict.immediate_actions?.length ? (
        <div>
          <div className={`${HEADER} mb-2`}>Before you launch</div>
          {verdict.immediate_actions.map((a, i) => (
            <div key={i} className="mb-1.5 flex gap-2">
              <span className="w-4 shrink-0 text-[10px] font-medium text-[#e8593c]">#{a.priority}</span>
              <div>
                <span className="text-[12px] text-white/50">{a.action}</span>
                <span className="ml-2 text-[10px] text-white/20">by {a.deadline}</span>
                {a.why ? <p className="text-[10px] text-white/25">{a.why}</p> : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {verdict.best_case_if_patched ? (
        <div className="rounded-lg border border-green-500/15 bg-green-500/[0.02] p-3">
          <div className="text-[11px] uppercase tracking-wider text-green-400/50">If you fix the top issues</div>
          <p className="mt-1 text-[12px] text-white/50">{verdict.best_case_if_patched.narrative}</p>
          <div className="mt-1 text-[13px] font-medium text-green-400/60">
            Survival: {verdict.survival_probability}% → {verdict.best_case_if_patched.survival_probability_after_fixes}%
          </div>
        </div>
      ) : null}

      {verdict.final_word ? (
        <div className="border-l-2 border-[#e8593c]/40 pl-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#e8593c]/80">Final word</p>
          <p className="mt-1 text-[13px] leading-relaxed text-white/55">{verdict.final_word}</p>
        </div>
      ) : null}

      <SourcesBlock sources={verdict.sources} />
    </div>
  );
}

export function PremortemOpusVerdictLayout({ verdict }: { verdict: PremortemOpusVerdict }) {
  return (
    <div className="mb-6 space-y-6">
      <div>
        <div className="text-[11px] text-white/30 uppercase tracking-wider">Failure autopsy</div>
        <div className="mt-1 text-[11px] text-red-400/40">Cause of death</div>
        <p className="mt-0.5 text-[16px] font-medium text-white/80">{verdict.cause_of_death}</p>
        <div className="mt-1 text-[13px] text-white/30">
          Failure probability: {verdict.failure_probability}% · Grade: {verdict.grade}
        </div>
        {verdict.headline ? <p className="mt-2 text-[14px] text-white/50">{verdict.headline}</p> : null}
      </div>

      {verdict.autopsy_narrative ? (
        <div className="border-l-2 border-red-500/20 pl-4">
          <p className="text-[13px] italic leading-relaxed text-white/50">{verdict.autopsy_narrative}</p>
        </div>
      ) : null}

      {verdict.timeline?.length ? (
        <div>
          <div className={`${HEADER} mb-3`}>Timeline of failure</div>
          <div className="space-y-3">
            {verdict.timeline.map((t, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${t.was_preventable ? 'bg-yellow-500/50' : 'bg-red-500/40'}`}
                  />
                  {i < verdict.timeline.length - 1 ? (
                    <div className="mt-1 h-6 w-px flex-1 bg-white/[0.06]" />
                  ) : null}
                </div>
                <div className="pb-3">
                  <div className="text-[11px] font-medium text-white/30">{t.month}</div>
                  <div className="mt-0.5 text-[12px] text-white/50">{t.event}</div>
                  <div className="mt-0.5 text-[11px] text-amber-400/40">Warning sign: {t.warning_sign}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {verdict.point_of_no_return ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/[0.03] p-4">
          <div className="mb-1 text-[11px] uppercase tracking-wider text-red-400/60">Point of no return</div>
          <div className="mb-1 text-[12px] text-white/30">{verdict.point_of_no_return.when}</div>
          <p className="text-[13px] text-white/60">{verdict.point_of_no_return.what_happened}</p>
          <div className="mt-2 text-[12px] text-green-400/50">
            What should have happened: {verdict.point_of_no_return.what_should_have_happened}
          </div>
        </div>
      ) : null}

      {verdict.what_the_crowd_saw ? (
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-[12px] text-white/45">
          <p className={HEADER}>What the crowd showed</p>
          <p className="mt-2">{verdict.what_the_crowd_saw.early_signal}</p>
          <p className="mt-2 text-amber-200/50">Ignored signal: {verdict.what_the_crowd_saw.ignored_warning}</p>
        </div>
      ) : null}

      {verdict.contributing_factors?.length ? (
        <div>
          <div className={`${HEADER} mb-2`}>Contributing factors</div>
          <ul className="space-y-2 text-[12px] text-white/55">
            {verdict.contributing_factors.map((c) => (
              <li key={c.rank} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
                <span className="text-white/35">#{c.rank} </span>
                {c.factor}
                <span className="text-[10px] text-white/30"> · weight {c.weight}%</span>
                {c.specialist_who_predicted ? (
                  <span className="block text-[10px] text-white/25">{c.specialist_who_predicted}</span>
                ) : null}
                <p className="mt-1 text-[11px] text-emerald-200/60">Prevention: {c.prevention}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {verdict.total_cost_of_failure ? (
        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div>
            <span className="text-white/25">Financial:</span>
            <span className="ml-1 text-red-400/50">{verdict.total_cost_of_failure.financial}</span>
          </div>
          <div>
            <span className="text-white/25">Time:</span>
            <span className="ml-1 text-white/40">{verdict.total_cost_of_failure.time}</span>
          </div>
          <div>
            <span className="text-white/25">Opportunity:</span>
            <span className="ml-1 text-white/40">{verdict.total_cost_of_failure.opportunity_cost}</span>
          </div>
          <div>
            <span className="text-white/25">Emotional:</span>
            <span className="ml-1 text-white/35">{verdict.total_cost_of_failure.emotional}</span>
          </div>
        </div>
      ) : null}

      {verdict.how_to_prevent_this?.length ? (
        <div className="rounded-lg border border-green-500/15 bg-green-500/[0.02] p-4">
          <div className="text-[11px] uppercase tracking-wider text-green-400/50">How to prevent this</div>
          {verdict.how_to_prevent_this.map((h, i) => (
            <div key={i} className="mb-2 mt-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-medium text-green-400/60">#{h.priority}</span>
                <span className="text-[12px] text-white/60">{h.intervention}</span>
              </div>
              <div className="ml-5 text-[10px] text-white/25">
                When: {h.when_to_act} · Success with fix: ~{h.success_probability_with_fix}%
              </div>
            </div>
          ))}
          {typeof verdict.revised_probability_if_all_prevented === 'number' ? (
            <div className="mt-3 border-t border-green-500/10 pt-2 text-[13px] font-medium text-green-400/60">
              If all interventions land: outlook ~{verdict.revised_probability_if_all_prevented}% success
            </div>
          ) : null}
        </div>
      ) : null}

      {verdict.final_word ? (
        <div className="border-l-2 border-[#e8593c]/40 pl-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#e8593c]/80">Final word</p>
          <p className="mt-1 text-[13px] leading-relaxed text-white/55">{verdict.final_word}</p>
        </div>
      ) : null}

      <SourcesBlock sources={verdict.sources} />
    </div>
  );
}
