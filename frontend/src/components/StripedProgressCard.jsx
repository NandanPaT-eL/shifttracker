import { IconTrendUp } from "./Icons.jsx";

// Mirrors the "Gross Volume" card: a big headline value with a delta pill,
// then a stacked list of diagonal-striped progress rows.
export default function StripedProgressCard({ title, value, deltaPct, rows }) {
  const max = Math.max(1, ...rows.map((r) => r.value));

  return (
    <div className="card p-5 flex flex-col gap-5 h-full">
      <div className="flex items-center justify-between">
        <div className="text-[15px] font-semibold text-ink">{title}</div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-[32px] font-bold text-ink tracking-tight leading-none">{value}</div>
        {deltaPct !== undefined && (
          <span className="stat-up flex items-center gap-1 text-[11.5px] font-semibold px-2 py-1 rounded-full">
            <IconTrendUp size={11} />
            {deltaPct}%
          </span>
        )}
      </div>

      <div className="border-t border-hairline pt-4 flex flex-col gap-4">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex items-center justify-between text-[12.5px] mb-1.5">
              <span className="text-ink-2 font-medium">{r.label}</span>
              <span className="text-ink font-semibold">{r.display}</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(r.value / max) * 100}%`, background: r.color }}
              />
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="text-[12.5px] text-muted py-2">No data for this period.</div>
        )}
      </div>
    </div>
  );
}
