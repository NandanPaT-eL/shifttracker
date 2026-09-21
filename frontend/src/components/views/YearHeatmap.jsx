import { MONTHS_SHORT, toKey } from "../../utils/date.js";
import { formatHours } from "../../utils/shifts.js";

function buildMiniGrid(year, month) {
  const first = new Date(Date.UTC(year, month, 1));
  const startOffset = (first.getUTCDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setUTCDate(1 - startOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setUTCDate(gridStart.getUTCDate() + i);
    return d;
  });
}

function intensity(hours) {
  if (!hours) return "#F0F1F3";
  if (hours < 4) return "#C9D8FE";
  if (hours < 8) return "#7DA0FA";
  return "#3B6EF6";
}

export default function YearHeatmap({ calDate, shiftsByDate, onSelectMonth, onSelectDay }) {
  const year = calDate.getUTCFullYear();
  const todayKey = toKey(new Date());

  return (
    <div className="card p-4 sm:p-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {MONTHS_SHORT.map((label, month) => {
          const days = buildMiniGrid(year, month);
          return (
            <div key={label} className="rounded-xl border border-hairline p-3">
              <button
                onClick={() => onSelectMonth(month)}
                className="text-[12px] font-semibold text-ink-2 mb-2 hover:text-accent-blue transition-colors"
              >
                {label}
              </button>
              <div className="grid grid-cols-7 gap-[3px]">
                {days.map((d) => {
                  const inMonth = d.getUTCMonth() === month;
                  const key = toKey(d);
                  const hours = (shiftsByDate.get(key) || [])
                    .filter((sh) => !sh._overnight)
                    .reduce((s, sh) => s + sh.hours, 0);
                  return (
                    <button
                      key={key}
                      onClick={() => inMonth && onSelectDay(key)}
                      className="aspect-square rounded-[3px]"
                      style={{
                        background: inMonth ? intensity(hours) : "transparent",
                        outline: key === todayKey ? "1.5px solid #0B0D12" : "none",
                      }}
                      title={inMonth ? `${key}: ${formatHours(hours)}` : undefined}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mt-4 text-[11px] text-muted">
        <span>Less</span>
        {["#F0F1F3", "#C9D8FE", "#7DA0FA", "#3B6EF6"].map((c) => (
          <span key={c} className="w-3 h-3 rounded-[3px]" style={{ background: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
