export default function TrustStrip() {
  return (
    <section className="py-12 border-y border-border-subtle/30">
      <div className="max-w-landing mx-auto px-6">
        <p className="mb-6 text-center text-xs text-txt-tertiary">
          Counts reflect completed simulations with structured verdicts and specialist positions.
        </p>
        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mb-8">
          <Stat value="1,247" label="decisions simulated" />
          <StatDivider />
          <Stat value="10" label="AI specialists" />
          <StatDivider />
          <Stat value="1,000" label="market voices (swarm)" />
          <StatDivider />
          <Stat value="4" label="simulation modes" />
        </div>

        {/* Tech logos */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:gap-x-6">
          <span className="text-micro shrink-0 text-txt-disabled">Built with</span>
          <TechLogo name="Anthropic Claude" />
          <TechLogo name="Next.js" />
          <TechLogo name="Supabase" />
          <TechLogo name="Vercel" />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-xl sm:text-2xl font-bold text-txt-primary tabular-nums">{value}</div>
      <div className="text-micro text-txt-tertiary mt-0.5">{label}</div>
    </div>
  );
}

function StatDivider() {
  return <div className="hidden sm:block w-px h-8 bg-border-subtle" />;
}

function TechLogo({ name }: { name: string }) {
  return (
    <span className="text-xs text-txt-disabled hover:text-txt-tertiary transition-colors duration-normal cursor-default">
      {name}
    </span>
  );
}
