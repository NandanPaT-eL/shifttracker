import { useState } from "react";

// Descending bar chart — click any bar to highlight it and show its callout.
export default function FunnelBarCard({ title, bars, highlightIndex = 0 }) {
  const [activeIndex, setActiveIndex] = useState(highlightIndex);
  const max = Math.max(1, ...bars.map((b) => b.value));
  const highlighted = bars[activeIndex];

  return (
    <div className="card p-5">
      <div className="text-[15px] font-semibold text-ink mb-5">{title}</div>

      {/* Labels + values row */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${bars.length}, minmax(0,1fr))` }}>
        {bars.map((b, i) => (
          <button
            key={b.label}
            onClick={() => setActiveIndex(i)}
            className="text-center focus:outline-none"
          >
            <div className={`text-[11px] mb-1 truncate transition-colors ${i === activeIndex ? "text-ink font-semibold" : "text-slate-400 hover:text-slate-600"}`}>
              {b.label}
            </div>
            <div className={`text-[15px] sm:text-[17px] font-bold tracking-tight transition-colors ${i === activeIndex ? "text-ink" : "text-slate-300 hover:text-slate-500"}`}>
              {b.display}
            </div>
          </button>
        ))}
      </div>

      {/* Chart area */}
      <div className="relative mt-4">
        {/* Floating callout pill */}
        {highlighted && (
          <div
            className="absolute callout-pill z-10 -translate-x-1/2 flex items-center gap-1.5 whitespace-nowrap pointer-events-none"
            style={{
              left: `${((activeIndex + 0.5) / bars.length) * 100}%`,
              top: `${100 - (highlighted.value / max) * 100}%`,
              marginTop: "-46px",
            }}
          >
            {highlighted.calloutParts.map((part, i) => (
              <span key={i} className={i > 0 ? "text-slate-500" : ""}>
                {i > 0 && <span className="text-slate-200 mr-1.5">|</span>}
                {part.label}
                {part.strong && <span className="font-semibold text-ink ml-1">{part.strong}</span>}
              </span>
            ))}
          </div>
        )}

        {/* Bars */}
        <div
          className="grid gap-3 items-end h-[160px]"
          style={{ gridTemplateColumns: `repeat(${bars.length}, minmax(0,1fr))` }}
        >
          {bars.map((b, i) => {
            const heightPct = Math.max(6, (b.value / max) * 100);
            const isHi = i === activeIndex;
            const color = b.color || "#3B82F6";
            return (
              <div key={b.label} className="flex flex-col items-center justify-end h-full">
                <button
                  onClick={() => setActiveIndex(i)}
                  className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                  style={{
                    height: `${heightPct}%`,
                    background: isHi ? color : `${color}28`,
                    focusRingColor: color,
                  }}
                  title={`${b.label}: ${b.display}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
