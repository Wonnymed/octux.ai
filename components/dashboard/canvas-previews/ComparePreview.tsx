'use client';

export function ComparePreview() {
  return (
    <div className="relative flex h-full min-h-[280px] w-full">
      <div className="flex flex-1 flex-col items-center justify-center gap-2.5 opacity-[0.28] sm:gap-3">
        <div className="mb-1 text-[11px] text-[#8a8a82]">Option A</div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={`a-${i}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#3a3a36] bg-[#1a1a18]"
          >
            <span className="text-[9px] text-[#5a5a55]">{i}</span>
          </div>
        ))}
      </div>

      <div
        className="w-px shrink-0 bg-gradient-to-b from-transparent via-[#c9a96e]/20 to-transparent"
        aria-hidden
      />

      <div className="flex flex-1 flex-col items-center justify-center gap-2.5 opacity-[0.28] sm:gap-3">
        <div className="mb-1 text-[11px] text-[#8a8a82]">Option B</div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={`b-${i}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#c9a96e]/15 bg-[#c9a96e]/[0.03]"
          >
            <span className="text-[9px] text-[#c9a96e]/35">{i}</span>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[12px] font-medium text-[#5a5a55]/35">
        vs
      </div>
    </div>
  );
}
