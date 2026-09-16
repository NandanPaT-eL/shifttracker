// Dot-histogram card — mirrors the "Transactions" / "Customers" widgets:
// a big number, a bell-shaped grid of dots per category, a peak-label pill,
// and a "vs last period" delta on the right.
const MAX_DOTS = 5;

export default function DotHistogramCard({ title, value, peakLabel, peakValue, deltaLabel, deltaValue, data, color = "#16A34A" }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-[15px] font-semibold text-ink">{title}</div>
        {peakValue !== undefined && (
          <span className="text-[11.5px] font-medium text-muted bg-surface px-2.5 py-1 rounded-full">
            {peakLabel}: <span className="text-ink font-semibold">{peakValue}</span>
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="text-[30px] font-bold text-ink tracking-tight leading-none">{value}</div>

        <div className="flex items-end gap-[3px] h-[46px]">
          {data.map((d, i) => {
            const dots = Math.max(1, Math.round((d.value / max) * MAX_DOTS));
            return (
              <div key={i} className="flex flex-col-reverse gap-[3px]">
                {Array.from({ length: MAX_DOTS }).map((_, j) => (
                  <span
                    key={j}
                    className="w-[7px] h-[7px] rounded-full"
                    style={{
                      background: j < dots ? color : "#EEF0F3",
                      opacity: j < dots ? 0.45 + (0.55 * (j + 1)) / MAX_DOTS : 1,
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {deltaValue !== undefined && (
        <div className="flex items-center justify-between border-t border-hairline pt-3">
          <span className="text-[11.5px] text-muted">{deltaLabel}</span>
          <span className="text-[13px] font-semibold text-ink">{deltaValue}</span>
        </div>
      )}
    </div>
  );
}
