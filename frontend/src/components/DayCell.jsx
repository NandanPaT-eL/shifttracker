function colorFor(categories, name) {
  return categories.find((c) => c.name === name)?.color || "#3B82F6";
}

export default function DayCell({ date, inMonth, isToday, shifts, categories, onClick, onSelectDay }) {
  const dayNum = date.getUTCDate();

  // Separate real shifts from overnight continuations
  const ownShifts        = shifts.filter((s) => !s._overnight);
  const overnightCarryin = shifts.filter((s) =>  s._overnight);

  const totalHours = ownShifts.reduce((s, sh) => s + sh.hours, 0);
  const hasOwn = ownShifts.length > 0;
  const hasOvernight = overnightCarryin.length > 0;

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col p-2 sm:p-2.5 h-[88px] sm:h-[100px] text-left transition-all duration-150 rounded-xl border
        ${inMonth
          ? isToday
            ? "bg-blue-50 border-blue-400 shadow-sm"
            : "bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-sm"
          : "bg-slate-50 border-slate-100 opacity-40"
        }
      `}
    >
      {/* Day number */}
      <div className="flex items-center justify-between w-full">
        <span
          className={`text-[12px] font-semibold w-6 h-6 flex items-center justify-center rounded-full transition-colors
            ${isToday
              ? "bg-blue-500 text-white"
              : inMonth
              ? "text-slate-700"
              : "text-slate-400"
            }
          `}
        >
          {dayNum}
        </span>
        {totalHours > 0 && (
          <span className="text-[9.5px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
            {totalHours}h
          </span>
        )}
      </div>

      {/* Shift pills */}
      <div className="mt-1.5 flex flex-col gap-0.5 overflow-hidden flex-1">
        {/* Overnight carry-ins from previous day */}
        {overnightCarryin.map((s) => {
          const color = colorFor(categories, s.category);
          return (
            <button
              key={`overnight-${s._id}`}
              onClick={(e) => {
                e.stopPropagation();
                // Navigate to the original start day
                const startKey = new Date(s.date).toISOString().slice(0, 10);
                onSelectDay(startKey);
              }}
              className="truncate rounded-md px-1.5 py-[2px] text-[9.5px] font-medium leading-4 w-full text-left"
              style={{
                background: `${color}12`,
                color,
                borderLeft: `2px dashed ${color}`,
              }}
              title={`Overnight shift ending ${s.endTime} (started previous day)`}
            >
              🌙 until {s.endTime}
            </button>
          );
        })}

        {/* Normal shifts starting this day */}
        {ownShifts.slice(0, hasOvernight ? 1 : 2).map((s) => {
          const color = colorFor(categories, s.category);
          return (
            <div
              key={s._id}
              className="truncate rounded-md px-1.5 py-[2px] text-[9.5px] font-medium leading-4"
              style={{
                background: `${color}18`,
                color,
                borderLeft: `2px solid ${color}`,
              }}
            >
              {s.startTime} · {s.category}
            </div>
          );
        })}

        {/* Overflow count */}
        {ownShifts.length > (hasOvernight ? 1 : 2) && (
          <div className="text-[9px] text-slate-400 pl-1 font-medium">
            +{ownShifts.length - (hasOvernight ? 1 : 2)} more
          </div>
        )}
      </div>

      {/* Hover add indicator */}
      {!hasOwn && !hasOvernight && inMonth && (
        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-blue-400 text-[18px] font-light">+</span>
        </span>
      )}
    </button>
  );
}
