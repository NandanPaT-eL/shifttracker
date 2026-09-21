import DayCell from "../DayCell.jsx";
import { WEEKDAYS, toKey } from "../../utils/date.js";

function buildGrid(year, month) {
  const first = new Date(Date.UTC(year, month, 1));
  const startOffset = (first.getUTCDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setUTCDate(1 - startOffset);
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setUTCDate(gridStart.getUTCDate() + i);
    days.push(d);
  }
  return days;
}

export default function MonthGrid({ calDate, shiftsByDate, categories, onSelectDay }) {
  const year = calDate.getUTCFullYear();
  const month = calDate.getUTCMonth();
  const days = buildGrid(year, month);
  const todayKey = toKey(new Date());

  const weekdayLetter = (w) => w.charAt(0);

  return (
    <>
      {/* Phone: compact month grid */}
      <div className="md:hidden card p-2.5">
        <div className="grid grid-cols-7 gap-px mb-1">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-center text-[10px] font-semibold text-subtle py-0.5">
              {weekdayLetter(w)}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const key = toKey(d);
            return (
              <DayCell
                key={`m-${key}`}
                compact
                date={d}
                inMonth={d.getUTCMonth() === month}
                isToday={key === todayKey}
                shifts={shiftsByDate.get(key) || []}
                categories={categories}
                onClick={() => onSelectDay(key)}
                onSelectDay={onSelectDay}
              />
            );
          })}
        </div>
        <p className="text-[11px] text-muted text-center mt-2.5 px-1">Tap a day to view or log shifts</p>
      </div>

      {/* Tablet+ */}
      <div className="hidden md:block card p-4 sm:p-5">
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-center text-[11px] font-semibold text-subtle py-1 uppercase tracking-wider">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((d) => {
            const key = toKey(d);
            return (
              <DayCell
                key={key}
                date={d}
                inMonth={d.getUTCMonth() === month}
                isToday={key === todayKey}
                shifts={shiftsByDate.get(key) || []}
                categories={categories}
                onClick={() => onSelectDay(key)}
                onSelectDay={onSelectDay}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
