'use client';

const TIMELINE_POINTS = [
  { label: 'Launch', month: 'M1' },
  { label: 'Growth', month: 'M3' },
  { label: 'Decline', month: 'M6' },
  { label: 'Crisis', month: 'M9' },
  { label: '?', month: 'M12' },
] as const;

export function PremortemPreview() {
  return (
    <div className="flex h-full min-h-[280px] w-full items-center justify-center px-6 sm:px-12">
      <div className="flex w-full max-w-[520px] items-center">
        {TIMELINE_POINTS.map((point, i) => (
          <div key={point.month} className="flex min-w-0 flex-1 items-center">
            <div
              className="flex flex-col items-center"
              style={{ opacity: 0.22 + i * 0.06 }}
            >
              <div
                className={`h-3 w-3 rounded-full ${
                  i === TIMELINE_POINTS.length - 1 ? 'bg-[#c9a96e]/35' : 'bg-[#5a5a55]/35'
                }`}
              />
              <span className="mt-2 text-[9px] text-[#5a5a55]/55">{point.month}</span>
              <span className="text-[8px] italic text-[#5a5a55]/40">{point.label}</span>
            </div>
            {i < TIMELINE_POINTS.length - 1 ? (
              <div
                className="mx-1 h-px min-w-[8px] flex-1 sm:mx-2"
                style={{
                  background: `linear-gradient(to right, rgba(90,90,85,0.2), rgba(201,169,110,${0.06 + i * 0.03}))`,
                }}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
