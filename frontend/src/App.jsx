import { useEffect, useMemo, useState, useCallback } from "react";
import TopNav from "./components/TopNav.jsx";
import CalendarView from "./components/CalendarView.jsx";
import ShiftModal from "./components/ShiftModal.jsx";
import AnalyticsView from "./components/AnalyticsView.jsx";
import { IconCalendar, IconChart, IconPlus } from "./components/Icons.jsx";
import { api } from "./api.js";
import { addDays, addMonths, addYears, startOfWeek, toKey } from "./utils/date.js";

export default function App() {
  const [view, setView] = useState("calendar");

  const [calView, setCalView] = useState("month");
  const [calDate, setCalDate] = useState(new Date());

  const [shifts, setShifts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [period, setPeriod]     = useState("week");
  const [refDate, setRefDate]   = useState(new Date());
  const [analytics, setAnalytics] = useState(null);

  /* ─── Calendar data ─────────────────────────── */
  const loadCalendarData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let from, to;
      if (calView === "month") {
        from = toKey(addDays(new Date(Date.UTC(calDate.getUTCFullYear(), calDate.getUTCMonth(), 1)), -7));
        to   = toKey(addDays(new Date(Date.UTC(calDate.getUTCFullYear(), calDate.getUTCMonth() + 1, 0)), 7));
      } else if (calView === "week") {
        const start = startOfWeek(calDate);
        from = toKey(addDays(start, -7));
        to   = toKey(addDays(start, 13));
      } else if (calView === "day") {
        from = toKey(addDays(calDate, -3));
        to   = toKey(addDays(calDate, 3));
      } else {
        from = `${calDate.getUTCFullYear()}-01-01`;
        to   = `${calDate.getUTCFullYear()}-12-31`;
      }
      const [shiftData, categoryData] = await Promise.all([
        api.getShifts({ from, to }),
        api.getCategories(),
      ]);
      setShifts(shiftData);
      setCategories(categoryData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [calView, calDate]);

  useEffect(() => { loadCalendarData(); }, [loadCalendarData]);

  /* ─── Analytics data ────────────────────────── */
  const loadAnalytics = useCallback(async () => {
    try {
      const data = await api.getAnalytics(period, toKey(refDate));
      setAnalytics(data);
      if (categories.length === 0) {
        setCategories(await api.getCategories());
      }
    } catch (e) {
      setError(e.message);
    }
  }, [period, refDate]);

  useEffect(() => { if (view === "analytics") loadAnalytics(); }, [view, loadAnalytics]);

  /* ─── Derived state ─────────────────────────── */
  const shiftsByDate = useMemo(() => {
    const map = new Map();
    for (const s of shifts) {
      // Primary day (shift starts here)
      const key = new Date(s.date).toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);

      // Detect overnight: use stored flag OR compare times directly
      // (time comparison handles old records that predate the endsNextDay field)
      const isOvernight = s.endsNextDay || (s.startTime && s.endTime && s.startTime > s.endTime);

      if (isOvernight) {
        const nextDay = new Date(s.date);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);
        const nextKey = nextDay.toISOString().slice(0, 10);
        if (!map.has(nextKey)) map.set(nextKey, []);
        map.get(nextKey).push({ ...s, _overnight: true });
      }
    }
    return map;
  }, [shifts]);



  const showPay = useMemo(() => shifts.some((s) => s.pay?.enabled), [shifts]);

  /* ─── Calendar navigation ───────────────────── */
  const handlePrev = () => {
    if (calView === "month") setCalDate((d) => addMonths(d, -1));
    else if (calView === "week") setCalDate((d) => addDays(d, -7));
    else if (calView === "year") setCalDate((d) => addYears(d, -1));
    else setCalDate((d) => addDays(d, -1));
  };
  const handleNext = () => {
    if (calView === "month") setCalDate((d) => addMonths(d, 1));
    else if (calView === "week") setCalDate((d) => addDays(d, 7));
    else if (calView === "year") setCalDate((d) => addYears(d, 1));
    else setCalDate((d) => addDays(d, 1));
  };
  const handleToday = () => setCalDate(new Date());

  /* ─── Analytics navigation ──────────────────── */
  const shiftPeriod = (dir) => {
    const d = new Date(refDate);
    if (period === "week")  d.setUTCDate(d.getUTCDate() + dir * 7);
    else if (period === "month") d.setUTCMonth(d.getUTCMonth() + dir);
    else d.setUTCFullYear(d.getUTCFullYear() + dir);
    setRefDate(d);
  };

  const rangeLabel = useMemo(() => {
    if (!analytics) return "";
    const start = new Date(analytics.rangeStart);
    const end   = new Date(analytics.rangeEnd);
    if (period === "year") return start.getUTCFullYear().toString();
    const opts = { month: "short", day: "numeric" };
    return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
  }, [analytics, period]);

  /* ─── CRUD handlers ─────────────────────────── */
  const handleSaveShift = async (form) => {
    const payload = {
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      category: form.category,
      location: form.location,
      notes: form.notes,
      pay: {
        enabled: form.pay.enabled,
        type: form.pay.type,
        rate: Number(form.pay.rate) || 0,
        flatAmount: Number(form.pay.flatAmount) || 0,
      },
    };
    if (form._id) await api.updateShift(form._id, payload);
    else await api.createShift(payload);
    await loadCalendarData();
  };

  const handleDeleteShift = async (id) => {
    await api.deleteShift(id);
    await loadCalendarData();
  };

  const handleCreateCategory = async (name) => {
    const created = await api.createCategory({ name });
    setCategories((prev) => [...prev, created]);
    return created;
  };

  const handleAddShiftFromNav = () => setSelectedDay(toKey(new Date()));

  /* ─── Render ────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <TopNav view={view} setView={setView} onAddShift={handleAddShiftFromNav} />

      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-hairline sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-blue to-accent-blue-dark flex items-center justify-center">
            <IconCalendar size={13} className="text-white" />
          </div>
          <span className="text-[15px] font-bold text-ink">shifttrack</span>
        </div>
        {loading && <div className="w-4 h-4 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />}
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 px-4 sm:px-6 md:px-8 py-6 pb-28 md:pb-8 overflow-y-auto">
          {error && (
            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 text-red-600 text-[13px] px-4 py-3 animate-fade-in">
              ⚠ {error}
            </div>
          )}

          {view === "calendar" && (
            <CalendarView
              calView={calView}
              setCalView={setCalView}
              calDate={calDate}
              setCalDate={setCalDate}
              shiftsByDate={shiftsByDate}
              categories={categories}
              onPrev={handlePrev}
              onNext={handleNext}
              onToday={handleToday}
              onSelectDay={setSelectedDay}
            />
          )}

          {view === "analytics" && (
            <AnalyticsView
              period={period}
              setPeriod={setPeriod}
              onPrev={() => shiftPeriod(-1)}
              onNext={() => shiftPeriod(1)}
              onToday={() => setRefDate(new Date())}
              rangeLabel={rangeLabel}
              data={analytics}
              categories={categories}
              showPay={showPay}
            />
          )}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-hairline flex items-center justify-around px-4 py-2 z-40 shadow-[0_-1px_12px_rgba(0,0,0,0.06)]">
        {[
          { id: "calendar",  label: "Calendar",  Icon: IconCalendar },
          { id: "analytics", label: "Analytics", Icon: IconChart },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            id={`mobile-nav-${id}`}
            onClick={() => setView(id)}
            className={`mobile-nav-btn ${view === id ? "active" : ""}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}

        <button
          id="mobile-add-shift"
          onClick={handleAddShiftFromNav}
          className="flex flex-col items-center gap-0.5"
        >
          <div className="w-11 h-11 rounded-2xl bg-ink flex items-center justify-center shadow-btn-primary -mt-5">
            <IconPlus size={20} className="text-white" />
          </div>
          <span className="text-[11px] font-medium text-subtle mt-0.5">Add</span>
        </button>
      </nav>

      {/* Shift modal */}
      {selectedDay && (
        <ShiftModal
          date={selectedDay}
          shifts={shiftsByDate.get(selectedDay) || []}
          categories={categories}
          onClose={() => setSelectedDay(null)}
          onSave={handleSaveShift}
          onDelete={handleDeleteShift}
          onCreateCategory={handleCreateCategory}
        />
      )}
    </div>
  );
}
