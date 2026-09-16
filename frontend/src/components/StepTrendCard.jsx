// Hand-built stepped-line chart (SVG) so the peak callout pill can be
// positioned with pixel precision, mirroring the reference "Retention" card.
const W = 600;
const H = 190;
const PAD_TOP = 34;

export default function StepTrendCard({ title, calloutLabel, data, color = "#EC4899" }) {
  const values = data.map((d) => d.value);
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const range = max - min || 1;
  const n = data.length;
  const usableH = H - PAD_TOP;

  const points = data.map((d, i) => ({
    x: n > 1 ? (i / (n - 1)) * W : W / 2,
    y: PAD_TOP + usableH - ((d.value - min) / range) * usableH,
    ...d,
  }));

  const peakIdx = values.indexOf(max);
  const peak = points[peakIdx];

  // Build a step-after path: hold value until the next x, then jump.
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    path += ` L ${cur.x} ${prev.y} L ${cur.x} ${cur.y}`;
  }

  const barW = n > 0 ? (W / n) * 0.55 : 0;

  return (
    <div className="card p-5 flex flex-col gap-1">
      <div className="text-[15px] font-semibold text-ink mb-2">{title}</div>

      <div className="relative w-full" style={{ paddingTop: `${(H / W) * 100}%` }}>
        {/* Floating callout pill above the peak point */}
        <div
          className="absolute callout-pill flex items-center gap-1"
          style={{
            left: `${(peak.x / W) * 100}%`,
            top: `${(peak.y / H) * 100}%`,
            transform: "translate(-50%, -140%)",
          }}
        >
          <span className="callout-dot w-1.5 h-1.5 inline-block" style={{ background: color }} />
          <span className="font-semibold">{peak.display ?? peak.value}</span>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full overflow-visible">
          {/* background bars */}
          {points.map((p, i) => (
            <rect
              key={i}
              x={p.x - barW / 2}
              y={PAD_TOP + usableH * 0.08}
              width={barW}
              height={usableH * 0.92}
              rx={barW / 2}
              fill={color}
              opacity={0.06}
            />
          ))}
          {/* step line */}
          <path d={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
          {/* peak marker */}
          <circle cx={peak.x} cy={peak.y} r={5} fill={color} stroke="#FFFFFF" strokeWidth={2} />
        </svg>
      </div>

      <div className="flex justify-between text-[10.5px] font-medium text-subtle uppercase tracking-wide mt-1">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}
