import PageHeader from "./PageHeader.jsx";

import StripedProgressCard from "./StripedProgressCard.jsx";
import DotHistogramCard from "./DotHistogramCard.jsx";
import InsightCard from "./InsightCard.jsx";
import MonthGrid from "./views/MonthGrid.jsx";
import WeekView from "./views/WeekView.jsx";
import DayAgenda from "./views/DayAgenda.jsx";
import YearHeatmap from "./views/YearHeatmap.jsx";
import { IconChevronLeft, IconChevronRight } from "./Icons.jsx";
import {
  MONTHS, MONTHS_SHORT, WEEKDAYS_FULL,
  addDays, startOfWeek, toKey,
} from "../utils/date.js";
import { uniqueShifts, formatHours } from "../utils/shifts.js";

const FORMATS = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

function titleFor(calView, calDate) {
  const y = calDate.getUTCFullYear();
  if (calView === "month") return `${MONTHS[calDate.getUTCMonth()]} ${y}`;
  if (calView === "year") return `${y}`;
  if (calView === "day") {
    return `${WEEKDAYS_FULL[(calDate.getUTCDay() + 6) % 7]}, ${MONTHS[calDate.getUTCMonth()]} ${calDate.getUTCDate()}`;
  }
  const start = startOfWeek(calDate);
  const end = addDays(start, 6);
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();
  return `${MONTHS_SHORT[start.getUTCMonth()]} ${start.getUTCDate()} – ${sameMonth ? "" : MONTHS_SHORT[end.getUTCMonth()] + " "}${end.getUTCDate()}, ${y}`;
}

function rangeKeysFor(calView, calDate) {
  if (calView === "month") {
    const y = calDate.getUTCFullYear(), m = calDate.getUTCMonth();
    return [`${y}-${String(m + 1).padStart(2, "0")}-01`, `${y}-${String(m + 1).padStart(2, "0")}-31`];
  }
  if (calView === "week") {
    const start = startOfWeek(calDate);
    return [toKey(start), toKey(addDays(start, 6))];
  }
  if (calView === "year") {
    const y = calDate.getUTCFullYear();
    return [`${y}-01-01`, `${y}-12-31`];
  }
  const k = toKey(calDate);
  return [k, k];
}

export default function CalendarView({
  calView, setCalView, calDate, setCalDate,
  shiftsByDate, categories, onPrev, onNext, onToday, onSelectDay,
}) {
  const [fromKey, toKeyStr] = rangeKeysFor(calView, calDate);
  const periodShifts = uniqueShifts(
    [...shiftsByDate.entries()]
      .filter(([k]) => k >= fromKey && k <= toKeyStr)
      .flatMap(([, v]) => v)
  );

  const totalHours = periodShifts.reduce((s, sh) => s + sh.hours, 0);
  const totalPay = periodShifts.reduce((s, sh) => s + (sh.pay?.enabled ? sh.pay.amount || 0 : 0), 0);

  const byCategory = {};
  for (const s of periodShifts) {
    byCategory[s.category] = (byCategory[s.category] || 0) + s.hours;
  }
  const catRows = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([name, hours]) => ({
      label: name,
      value: hours,
      display: formatHours(hours),
      color: categories.find((c) => c.name === name)?.color || "#3B6EF6",
    }));

  const weekdayShifts = Array(7).fill(0);
  for (const s of periodShifts) {
    const d = (new Date(s.date).getUTCDay() + 6) % 7;
    weekdayShifts[d] += 1;
  }
  const WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const busiestIdx = weekdayShifts.indexOf(Math.max(...weekdayShifts));
  const categoryCount = new Set(periodShifts.map((s) => s.category)).size;

  const subtitle = `${periodShifts.length} shift${periodShifts.length !== 1 ? "s" : ""} · ${formatHours(totalHours)}`;

  const navButtons = (
    <div className="flex items-center gap-1 bg-white border border-hairline rounded-xl p-1 shadow-card flex-shrink-0">
      <button type="button" onClick={onPrev} className="w-9 h-9 md:w-8 md:h-8 flex items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-ink transition-colors">
        <IconChevronLeft size={15} />
      </button>
      <button type="button" onClick={onNext} className="w-9 h-9 md:w-8 md:h-8 flex items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-ink transition-colors">
        <IconChevronRight size={15} />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 md:gap-4 animate-fade-in">
      {/* Mobile toolbar */}
      <div className="md:hidden space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-[20px] font-bold text-ink tracking-tight leading-tight truncate">{titleFor(calView, calDate)}</h1>
            <p className="text-[12px] text-muted mt-0.5">{subtitle}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button type="button" onClick={onToday} className="btn-ghost text-[12px] px-2.5 py-2">Today</button>
            {navButtons}
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-0.5 -mx-1 px-1 scrollbar-none">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setCalView(f.id)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-full text-[12px] font-semibold transition-colors ${
                calView === f.id ? "bg-ink text-white" : "bg-white border border-hairline text-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden md:block">
        <PageHeader title={titleFor(calView, calDate)} subtitle={subtitle}>
          <div className="pill-group">
            {FORMATS.map((f) => (
              <button key={f.id} type="button" onClick={() => setCalView(f.id)} className={`pill-btn ${calView === f.id ? "active" : ""}`}>
                {f.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={onToday} className="btn-ghost text-[13px] px-3.5 py-2">Today</button>
          {navButtons}
        </PageHeader>
      </div>

      <div className="grid lg:grid-cols-3 gap-3 md:gap-4 items-start">
        <div className="lg:col-span-2 flex flex-col gap-3 md:gap-4 min-w-0">
          {calView === "month" && <MonthGrid calDate={calDate} shiftsByDate={shiftsByDate} categories={categories} onSelectDay={onSelectDay} />}
          {calView === "week" && <WeekView calDate={calDate} shiftsByDate={shiftsByDate} categories={categories} onSelectDay={onSelectDay} />}
          {calView === "day" && <DayAgenda calDate={calDate} shiftsByDate={shiftsByDate} categories={categories} onSelectDay={onSelectDay} />}
          {calView === "year" && (
            <YearHeatmap
              calDate={calDate}
              shiftsByDate={shiftsByDate}
              onSelectMonth={(m) => { setCalDate(new Date(Date.UTC(calDate.getUTCFullYear(), m, 1))); setCalView("month"); }}
              onSelectDay={onSelectDay}
            />
          )}

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-3 px-1">
              {categories.map((c) => (
                <div key={c._id} className="flex items-center gap-1.5 text-[12px] text-muted">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  {c.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hidden lg:flex flex-col gap-4">
          <StripedProgressCard
            title="Hours by category"
            value={formatHours(totalHours)}
            rows={catRows}
          />
          <DotHistogramCard
            title="Busiest day"
            value={weekdayShifts[busiestIdx] > 0 ? WD[busiestIdx] : "—"}
            peakLabel="Shifts"
            peakValue={periodShifts.length}
            deltaLabel="Total pay this period"
            deltaValue={totalPay > 0 ? `$${totalPay.toFixed(0)}` : "—"}
            data={WD.map((label, i) => ({ label, value: weekdayShifts[i] }))}
            color="#16A34A"
          />
          <InsightCard
            value={formatHours(totalHours)}
            headline={periodShifts.length > 0 ? `Logged across ${categoryCount} categor${categoryCount === 1 ? "y" : "ies"}` : "No shifts logged yet"}
            body={periodShifts.length > 0 ? "Tap any day to review or edit a shift." : "Log a shift to start tracking your hours."}
            progress={Math.min(100, (totalHours / 40) * 100)}
          />
        </div>
      </div>
    </div>
  );
}
