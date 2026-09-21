import { addDays, startOfWeek, toKey, WEEKDAYS, WEEKDAYS_FULL } from "../../utils/date.js";
import { IconPlus, IconChevronRight } from "../Icons.jsx";
import { formatHours } from "../../utils/shifts.js";

function colorFor(categories, name) {
  return categories.find((c) => c.name === name)?.color || "#3B6EF6";
}

function ShiftChip({ s, categories, onSelectDay, dayKey }) {
  const color = colorFor(categories, s.category);
  const isCarry = !!s._overnight;
  const clickKey = isCarry ? new Date(s.date).toISOString().slice(0, 10) : dayKey;

  return (
    <button
      type="button"
      onClick={() => onSelectDay(clickKey)}
      className="text-left rounded-lg px-2.5 py-2 text-[12px] leading-snug w-full"
      style={{
        background: `${color}14`,
        color,
        borderLeft: `3px ${isCarry ? "dashed" : "solid"} ${color}`,
      }}
    >
      {isCarry ? (
        <div className="font-semibold">🌙 Until {s.endTime}</div>
      ) : (
        <div className="font-semibold">
          {s.startTime}–{s.endsNextDay ? "next day" : s.endTime}
        </div>
      )}
      <div className="text-[11px] opacity-85 mt-0.5">{s.category} · {formatHours(s.hours)}</div>
    </button>
  );
}

function WeekDayColumn({ d, i, shiftsByDate, categories, onSelectDay, todayKey }) {
  const key = toKey(d);
  const isToday = key === todayKey;
  const dayShifts = shiftsByDate.get(key) || [];
  const totalHours = dayShifts.filter((s) => !s._overnight).reduce((sum, sh) => sum + sh.hours, 0);

  return (
    <div key={key} className="flex flex-col min-h-[360px]">
      <button
        type="button"
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
        {dayShifts.map((s) => (
          <ShiftChip key={s._overnight ? `carry-${s._id}` : s._id} s={s} categories={categories} onSelectDay={onSelectDay} dayKey={key} />
        ))}
      </div>

      <button
        type="button"
        onClick={() => onSelectDay(key)}
        className="mt-1.5 flex items-center justify-center gap-1 text-[10.5px] font-medium text-subtle hover:text-accent-blue py-1.5 rounded-lg hover:bg-accent-blue-light transition-colors"
      >
        <IconPlus size={10} /> Add
      </button>
    </div>
  );
}

function WeekDayRow({ d, shiftsByDate, categories, onSelectDay, todayKey }) {
  const key = toKey(d);
  const isToday = key === todayKey;
  const dayShifts = shiftsByDate.get(key) || [];
  const ownCount = dayShifts.filter((s) => !s._overnight).length;
  const totalHours = dayShifts.filter((s) => !s._overnight).reduce((sum, sh) => sum + sh.hours, 0);
  const wdIdx = (d.getUTCDay() + 6) % 7;

  return (
    <div
      className={`rounded-xl border overflow-hidden ${
        isToday ? "border-blue-300 bg-blue-50/40 shadow-sm" : "border-slate-200 bg-white"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelectDay(key)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left active:bg-slate-50/80"
      >
        <div className="flex flex-col items-center w-11 flex-shrink-0">
          <span className="text-[10px] font-semibold text-subtle uppercase">{WEEKDAYS[wdIdx]}</span>
          <span
            className={`mt-0.5 text-[17px] font-bold w-9 h-9 flex items-center justify-center rounded-full ${
              isToday ? "bg-blue-500 text-white" : "text-ink"
            }`}
          >
            {d.getUTCDate()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-ink truncate">{WEEKDAYS_FULL[wdIdx]}</div>
          <div className="text-[12px] text-muted mt-0.5">
            {ownCount === 0 && dayShifts.length === 0
              ? "No shifts — tap to add"
              : `${ownCount} shift${ownCount !== 1 ? "s" : ""}${totalHours > 0 ? ` · ${formatHours(totalHours)}` : ""}`}
          </div>
        </div>
        <IconChevronRight size={16} className="text-slate-300 flex-shrink-0" />
      </button>

      {dayShifts.length > 0 && (
        <div className="px-3 pb-3 flex flex-col gap-1.5 border-t border-slate-100 pt-2">
          {dayShifts.map((s) => (
            <ShiftChip key={s._overnight ? `carry-${s._id}` : s._id} s={s} categories={categories} onSelectDay={onSelectDay} dayKey={key} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WeekView({ calDate, shiftsByDate, categories, onSelectDay }) {
  const weekStart = startOfWeek(calDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const todayKey = toKey(new Date());

  return (
    <>
      <div className="hidden md:block card p-4 sm:p-5">
        <div className="grid grid-cols-7 gap-2.5">
          {days.map((d, i) => (
            <WeekDayColumn
              key={toKey(d)}
              d={d}
              i={i}
              shiftsByDate={shiftsByDate}
              categories={categories}
              onSelectDay={onSelectDay}
              todayKey={todayKey}
            />
          ))}
        </div>
      </div>

      <div className="md:hidden flex flex-col gap-2">
        {days.map((d) => (
          <WeekDayRow
            key={toKey(d)}
            d={d}
            shiftsByDate={shiftsByDate}
            categories={categories}
            onSelectDay={onSelectDay}
            todayKey={todayKey}
          />
        ))}
      </div>
    </>
  );
}
