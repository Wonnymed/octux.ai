import { cn } from '@/lib/design/cn';

export default function WhyNotChatGPT() {
  return (
    <section className="py-20 sm:py-28 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-medium text-txt-primary mb-3">
            Why not just ask ChatGPT?
          </h2>
          <p className="text-sm text-txt-tertiary">
            ChatGPT gives opinions. Octux gives analysis.
          </p>
        </div>

        {/* Side-by-side comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ChatGPT side */}
          <div className="rounded-xl border border-border-subtle bg-surface-1 overflow-hidden">
            <div className="px-4 py-3 border-b border-border-subtle bg-surface-2/30">
              <span className="text-xs text-txt-tertiary">ChatGPT says:</span>
            </div>
            <div className="p-5">
              <p className="text-sm text-txt-secondary leading-relaxed">
                Opening a restaurant in Gangnam could be a good idea! The area has high foot traffic and a vibrant dining scene. However, you should consider the high rent costs and competitive market. Make sure to do thorough market research and have a solid business plan. Good luck with your venture!
              </p>
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-micro text-txt-disabled">No probability</span>
                <span className="text-micro text-txt-disabled">&middot;</span>
                <span className="text-micro text-txt-disabled">No sources</span>
                <span className="text-micro text-txt-disabled">&middot;</span>
                <span className="text-micro text-txt-disabled">No grade</span>
              </div>
            </div>
          </div>

          {/* Octux side */}
          <div className="rounded-xl border border-accent/20 bg-surface-1 overflow-hidden ring-1 ring-accent/10">
            <div className="px-4 py-3 border-b border-border-subtle bg-accent-subtle/30">
              <span className="text-xs text-accent font-medium">Octux analyzes:</span>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full border-2 border-verdict-proceed flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-verdict-proceed">72%</span>
                </div>
                <div>
                  <span className="text-micro font-bold px-1.5 py-0.5 rounded-sm bg-verdict-proceed-muted text-verdict-proceed">PROCEED</span>
                  <span className="text-micro font-medium px-1 py-0.5 rounded-sm bg-surface-2 text-txt-secondary ml-1">B+</span>
                </div>
              </div>
              <p className="text-xs text-txt-secondary leading-relaxed mb-2">
                Market conditions favor launch, but permit timeline adds 2-month risk.
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-accent-muted text-accent">10 agents</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-accent-muted text-accent">4 citations</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-accent-muted text-accent">risk matrix</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-accent-muted text-accent">action plan</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-micro text-verdict-proceed">&#x2713; Probability-graded</span>
                <span className="text-micro text-verdict-proceed">&#x2713; Traceable</span>
                <span className="text-micro text-verdict-proceed">&#x2713; Adversarial</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <p className="text-center text-sm text-txt-tertiary mt-8">
          One gives you a paragraph. The other gives you a <span className="text-accent font-medium">decision framework</span>.
        </p>
      </div>
    </section>
  );
}
