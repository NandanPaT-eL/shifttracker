import { toKey } from "../../utils/date.js";
import { IconPlus, IconMapPin } from "../Icons.jsx";
import { formatHours } from "../../utils/shifts.js";

const START_HOUR = 0;   // Show full 24h so overnight shifts always fit
const END_HOUR   = 23;
const ROW_H      = 48;

function colorFor(categories, name) {
  return categories.find((c) => c.name === name)?.color || "#3B82F6";
}

function toMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** Pixel offset from the top of the grid for a given "HH:mm" time */
function topFor(t) {
  return ((toMinutes(t) - START_HOUR * 60) / 60) * ROW_H;
}

/**
 * For overnight shifts we compute layout differently:
 *   - On the START day  → block runs from startTime → bottom of grid (midnight)
 *   - On the END day (continuation) → block runs from top of grid (midnight) → endTime
 */
function blockLayout(s, isOvernightContinuation) {
  if (isOvernightContinuation) {
    // Continuation: from midnight (top) to endTime
    const top    = 0;
    const height = Math.max(28, topFor(s.endTime));
    return { top, height };
  }
  if (s.endsNextDay) {
    // Start day of overnight: from startTime to bottom of grid (24:00)
    const top    = topFor(s.startTime);
    const gridBottom = (END_HOUR - START_HOUR + 1) * ROW_H;
    const height = Math.max(28, gridBottom - top);
    return { top, height };
  }
  // Normal same-day shift
  const top    = topFor(s.startTime);
  const height = Math.max(28, topFor(s.endTime) - top);
  return { top, height };
}

export default function DayAgenda({ calDate, shiftsByDate, categories, onSelectDay }) {
  const key    = toKey(calDate);
  const allEntries = (shiftsByDate.get(key) || [])
    .slice()
    .sort((a, b) => {
      // Sort continuations to the top (they start at midnight conceptually)
      if (a._overnight && !b._overnight) return -1;
      if (!a._overnight && b._overnight) return 1;
      return a.startTime.localeCompare(b.startTime);
    });

  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  // Visible hours: trim leading/trailing empty hours for a cleaner look
  // but always show at least 6am–11pm if no shifts
  const occupiedMinutes = allEntries.flatMap((s) =>
    s._overnight
      ? [0, toMinutes(s.endTime)]
      : s.endsNextDay
      ? [toMinutes(s.startTime), END_HOUR * 60]
      : [toMinutes(s.startTime), toMinutes(s.endTime)]
  );
  const minMin = occupiedMinutes.length ? Math.max(0,   Math.min(...occupiedMinutes) - 60) : 6 * 60;
  const maxMin = occupiedMinutes.length ? Math.min(END_HOUR * 60, Math.max(...occupiedMinutes) + 60) : 23 * 60;
  const visHours = hours.filter((h) => h * 60 >= minMin && h * 60 <= maxMin);
  const visStart = visHours[0] ?? START_HOUR;

  const gridHeight = visHours.length * ROW_H;

  /** Pixel offset relative to the visible window */
  function visTop(t) {
    return ((toMinutes(t) - visStart * 60) / 60) * ROW_H;
  }
  function visLayout(s, isOvernightContinuation) {
    if (isOvernightContinuation) {
      const top    = Math.max(0, visTop("00:00"));
      const height = Math.max(28, visTop(s.endTime) - top);
      return { top, height };
    }
    if (s.endsNextDay) {
      const top        = visTop(s.startTime);
      const gridBottom = visHours.length * ROW_H;
      const height     = Math.max(28, gridBottom - top);
      return { top, height };
    }
    const top    = visTop(s.startTime);
    const height = Math.max(28, visTop(s.endTime) - top);
    return { top, height };
  }

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[13px] font-semibold text-ink-2">
          {allEntries.filter((s) => !s._overnight).length} shift
          {allEntries.filter((s) => !s._overnight).length !== 1 ? "s" : ""} logged
          {allEntries.some((s) => s._overnight) && (
            <span className="ml-2 text-[11px] font-medium text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
              🌙 overnight carry-in
            </span>
          )}
        </div>
        <button onClick={() => onSelectDay(key)} className="btn-primary flex items-center gap-1.5 py-1.5 px-3 text-[12px]">
          <IconPlus size={12} /> Log shift
        </button>
      </div>

      <div className="relative flex" style={{ height: gridHeight }}>
        {/* Hour ruler */}
        <div className="w-14 flex-shrink-0 relative">
          {visHours.map((h, i) => (
            <div
              key={h}
              className="absolute left-0 -translate-y-1/2 text-[10.5px] text-slate-400 font-medium"
              style={{ top: i * ROW_H }}
            >
              {h === 0 ? "12am" : h === 12 ? "12pm" : h < 12 ? `${h}am` : `${h - 12}pm`}
            </div>
          ))}
        </div>

        {/* Grid lines + shift blocks */}
        <div className="relative flex-1 border-l border-slate-100">
          {visHours.map((_, i) => (
            <div key={i} className="absolute left-0 right-0 border-t border-slate-100" style={{ top: i * ROW_H }} />
          ))}

          {allEntries.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-[13px] text-slate-400">
              No shifts logged for this day.
            </div>
          )}

          {allEntries.map((s) => {
            const color   = colorFor(categories, s.category);
            const isCarry = !!s._overnight;
            const { top, height } = visLayout(s, isCarry);

            // Only click through to the original day if it's an overnight carry-in
            const clickKey = isCarry ? new Date(s.date).toISOString().slice(0, 10) : key;

            return (
              <button
                key={isCarry ? `carry-${s._id}` : s._id}
                onClick={() => onSelectDay(clickKey)}
                className="absolute left-2 right-2 rounded-xl px-3 py-2 text-left overflow-hidden transition-opacity hover:opacity-90"
                style={{
                  top,
                  height,
                  background: `${color}14`,
                  borderLeft: `3px ${isCarry ? "dashed" : "solid"} ${color}`,
                }}
                title={isCarry ? `Overnight shift (started previous day) — ends ${s.endTime}` : `${s.startTime}–${s.endTime}`}
              >
                <div className="text-[12px] font-semibold truncate" style={{ color }}>
                  {isCarry ? (
                    <>🌙 …until {s.endTime} · {s.category}</>
                  ) : s.endsNextDay ? (
                    <>{s.startTime} – next day · {s.category}</>
                  ) : (
                    <>{s.startTime} – {s.endTime} · {s.category}</>
                  )}
                </div>
                {s.location && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                    <IconMapPin size={10} /> {s.location}
                  </div>
                )}
                {s.hours && (
                  <div className="text-[10.5px] mt-0.5" style={{ color, opacity: 0.7 }}>
                    {formatHours(s.hours)} total
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
