import { addDays, startOfWeek, toKey, WEEKDAYS } from "../../utils/date.js";
import { IconPlus } from "../Icons.jsx";
import { formatHours } from "../../utils/shifts.js";

function colorFor(categories, name) {
  return categories.find((c) => c.name === name)?.color || "#3B6EF6";
}

export default function WeekView({ calDate, shiftsByDate, categories, onSelectDay }) {
  const weekStart = startOfWeek(calDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const todayKey = toKey(new Date());

  return (
    <div className="card p-4 sm:p-5">
      <div className="grid grid-cols-7 gap-2.5">
        {days.map((d, i) => {
          const key = toKey(d);
          const isToday = key === todayKey;
          const dayShifts = shiftsByDate.get(key) || [];
          const totalHours = dayShifts.filter((s) => !s._overnight).reduce((sum, sh) => sum + sh.hours, 0);

          return (
            <div key={key} className="flex flex-col min-h-[360px]">
              <button
                onClick={() => onSelectDay(key)}
                className={`flex flex-col items-center gap-1 pb-2.5 mb-2.5 border-b-2 rounded-t-lg ${
                  isToday ? "border-accent-blue" : "border-hairline"
                }`}
              >
                <span className="text-[10.5px] font-semibold text-subtle uppercase tracking-wider">{WEEKDAYS[i]}</span>
                <span
                  className={`text-[15px] font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                    isToday ? "bg-accent-blue text-white" : "text-ink"
                  }`}
                >
                  {d.getUTCDate()}
                </span>
                {totalHours > 0 && <span className="text-[9.5px] text-muted font-medium">{formatHours(totalHours)}</span>}
              </button>

              <div className="flex flex-col gap-1.5 flex-1">
                {dayShifts.map((s) => {
                  const color   = colorFor(categories, s.category);
                  const isCarry = !!s._overnight;
                  const clickKey = isCarry
                    ? new Date(s.date).toISOString().slice(0, 10)
                    : key;
                  return (
                    <button
                      key={isCarry ? `carry-${s._id}` : s._id}
                      onClick={() => onSelectDay(clickKey)}
                      className="text-left rounded-lg px-2 py-1.5 text-[10.5px] leading-tight"
                      style={{
                        background: `${color}14`,
                        color,
                        borderLeft: `2.5px ${isCarry ? "dashed" : "solid"} ${color}`,
                      }}
                      title={isCarry ? `Overnight carry-in — ends ${s.endTime}` : undefined}
                    >
                      {isCarry ? (
                        <div className="font-semibold truncate">🌙 …until {s.endTime}</div>
                      ) : (
                        <div className="font-semibold">{s.startTime}–{s.endsNextDay ? "next day" : s.endTime}</div>
                      )}
                      <div className="truncate opacity-80">{s.category}</div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => onSelectDay(key)}
                className="mt-1.5 flex items-center justify-center gap-1 text-[10.5px] font-medium text-subtle hover:text-accent-blue py-1.5 rounded-lg hover:bg-accent-blue-light transition-colors"
              >
                <IconPlus size={10} /> Add
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
