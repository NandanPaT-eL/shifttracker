const W = 1000;
const H = 220;
const PAD_TOP = 40;
const PAD_BOTTOM = 28;

function formatPay(value) {
  return `$${value.toFixed(value % 1 === 0 ? 0 : 2)}`;
}

export default function EarningsLineChart({ title = "Earnings over time", data, color = "#16A34A" }) {
  if (!data.length) {
    return (
      <div className="card p-6 flex items-center justify-center text-[13px] text-muted min-h-[200px]">
        No earnings data for this period.
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const dataMax = Math.max(...values);
  const max = Math.max(1, dataMax);
  const min = 0;
  const range = max - min || 1;
  const n = data.length;
  const usableH = H - PAD_TOP - PAD_BOTTOM;
  const bottomY = PAD_TOP + usableH;

  const points = data.map((d, i) => ({
    x: n > 1 ? (i / (n - 1)) * W : W / 2,
    y: PAD_TOP + usableH - ((d.value - min) / range) * usableH,
    ...d,
  }));

  const peakIdx = dataMax > 0 ? values.indexOf(dataMax) : 0;
  const peak = points[peakIdx];

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[n - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: PAD_TOP + usableH * (1 - t),
    label: formatPay(max * t),
  }));

  return (
    <div className="card p-5 sm:p-6 flex flex-col gap-3">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[15px] font-semibold text-ink">{title}</div>
          <div className="text-[12px] text-muted mt-0.5">
            Total this period · {formatPay(values.reduce((s, v) => s + v, 0))}
          </div>
        </div>
        {dataMax > 0 && (
          <div className="callout-pill flex items-center gap-1.5">
            <span className="callout-dot w-1.5 h-1.5 inline-block" style={{ background: color }} />
            <span className="text-muted">Peak</span>
            <span className="font-semibold text-ink">{peak.display ?? formatPay(peak.value)}</span>
            <span className="text-subtle">· {peak.label}</span>
          </div>
        )}
      </div>

      <div className="relative w-full" style={{ paddingTop: `${(H / W) * 100}%` }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full overflow-visible">
          <defs>
            <linearGradient id="earnings-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {gridLines.map((g, i) => (
            <g key={i}>
              <line x1={0} y1={g.y} x2={W} y2={g.y} stroke="rgba(26,22,37,0.06)" strokeWidth={1} />
              <text x={0} y={g.y - 6} fill="#B4B8BF" fontSize={11} fontWeight="600">
                {g.label}
              </text>
            </g>
          ))}

          <path d={areaPath} fill="url(#earnings-area)" />
          <path d={linePath} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />

          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={i === peakIdx && dataMax > 0 ? 6 : 4}
              fill={i === peakIdx && dataMax > 0 ? color : "#FFFFFF"}
              stroke={color}
              strokeWidth={2}
            />
          ))}
        </svg>
      </div>

      <div className="flex justify-between text-[10.5px] font-medium text-subtle uppercase tracking-wide">
        {data.map((d, i) => (
          <span key={i} className="truncate px-0.5">{d.label}</span>
        ))}
      </div>
    </div>
  );
}
