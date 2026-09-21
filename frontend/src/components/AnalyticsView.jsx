import PageHeader from "./PageHeader.jsx";
import ExploreBar from "./ExploreBar.jsx";
import FunnelBarCard from "./FunnelBarCard.jsx";
import StripedProgressCard from "./StripedProgressCard.jsx";
import StepTrendCard from "./StepTrendCard.jsx";
import DotHistogramCard from "./DotHistogramCard.jsx";
import InsightCard from "./InsightCard.jsx";
import { IconChevronLeft, IconChevronRight, IconClock, IconDollar, IconTrend, IconLayers } from "./Icons.jsx";

const PERIODS = [
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

function KpiCard({ label, value, sub, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div>
        <div className="text-[26px] font-bold text-ink tracking-tight leading-none">{value}</div>
        <div className="text-[12px] text-muted mt-1">{label}</div>
        {sub && <div className="text-[11px] text-subtle mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function AnalyticsView({ period, setPeriod, onPrev, onNext, onToday, rangeLabel, data, loading, error, categories, showPay }) {
  if (error) {
    return (
      <div className="flex items-center justify-center h-64 px-6 text-center animate-fade-in">
        <div className="max-w-md rounded-xl border border-red-100 bg-red-50 text-red-600 text-[13px] px-4 py-3">
          ⚠ {error}
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted text-sm animate-fade-in">
        Loading analytics…
      </div>
    );
  }

  const { totals, byCategory, series } = data;
  const avgRate = totals.hours > 0 ? (totals.pay / totals.hours).toFixed(2) : "0.00";
  const colorOf = (name) => categories.find((c) => c.name === name)?.color || "#3B6EF6";

  const funnelBars = byCategory.slice(0, 5).map((c) => ({
    label: c.category,
    value: c.hours,
    display: `${c.hours}h`,
    color: colorOf(c.category),
    calloutParts: [
      { label: "", strong: `${c.hours}h logged` },
      { label: "of total", strong: `${totals.hours > 0 ? Math.round((c.hours / totals.hours) * 100) : 0}%` },
      ...(showPay ? [{ label: "earned", strong: `$${c.pay.toFixed(0)}` }] : []),
    ],
  }));

  const sideRows = byCategory.map((c) => ({
    label: c.category,
    value: showPay ? c.pay : c.hours,
    display: showPay ? `$${c.pay.toFixed(0)}` : `${c.hours}h`,
    color: colorOf(c.category),
  }));

  const trendData = series.map((s) => ({ label: s.label, value: s.hours, display: `${s.hours}h` }));
  const peakBucket = series.reduce((a, b) => (b.hours > a.hours ? b : a), series[0] || { label: "—", hours: 0 });

  const topCategory = byCategory[0];

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <PageHeader title="Analytics" subtitle={rangeLabel || "Select a period"}>
        <div className="pill-group">
          {PERIODS.map((p) => (
            <button key={p.id} onClick={() => setPeriod(p.id)} className={`pill-btn ${period === p.id ? "active" : ""}`}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-white border border-hairline rounded-xl p-1 shadow-card">
          <button onClick={onPrev} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-ink transition-colors">
            <IconChevronLeft size={15} />
          </button>
          <button onClick={onToday} className="px-2 text-[12px] font-medium text-muted hover:text-ink transition-colors">Now</button>
          <button onClick={onNext} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-ink transition-colors">
            <IconChevronRight size={15} />
          </button>
        </div>
      </PageHeader>

      <ExploreBar
        prompt="What would you like to explore next?"
        suggestions={[
          { text: "/this week", onClick: () => setPeriod("week") },
          { text: "/this month", onClick: () => setPeriod("month") },
          { text: "/this year", onClick: () => setPeriod("year") },
          { text: "/jump to now", onClick: onToday },
        ]}
      />

      <div className={`grid gap-4 ${showPay ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2"}`}>
        <KpiCard label="Total Hours" value={`${totals.hours}h`} sub={`${totals.shiftCount} shift${totals.shiftCount !== 1 ? "s" : ""}`} icon={IconClock} iconBg="bg-accent-blue-light" iconColor="text-accent-blue" />
        <KpiCard label="Active Categories" value={byCategory.length} sub="job types" icon={IconLayers} iconBg="bg-[#F5F3FF]" iconColor="text-[#8B5CF6]" />
        {showPay && (
          <>
            <KpiCard label="Total Pay" value={`$${totals.pay.toFixed(0)}`} sub="gross earnings" icon={IconDollar} iconBg="bg-accent-green-light" iconColor="text-accent-green" />
            <KpiCard label="Avg. Hourly Rate" value={`$${avgRate}`} sub="per hour" icon={IconTrend} iconBg="bg-accent-amber-light" iconColor="text-accent-amber" />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 items-stretch">
        <div className="lg:col-span-2">
          {funnelBars.length > 0 ? (
            <FunnelBarCard title="Hours by category" bars={funnelBars} highlightIndex={0} />
          ) : (
            <div className="card p-5 h-full flex items-center justify-center text-[13px] text-muted">No shifts in this period.</div>
          )}
        </div>
        <StripedProgressCard
          title={showPay ? "Earnings by category" : "Hours by category"}
          value={showPay ? `$${totals.pay.toFixed(0)}` : `${totals.hours}h`}
          rows={sideRows}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 items-stretch">
        <StepTrendCard title="Hours over time" data={trendData} color="#EC4899" />
        <DotHistogramCard
          title="Shift activity"
          value={peakBucket.label}
          peakLabel="Peak"
          peakValue={`${peakBucket.hours}h`}
          deltaLabel="Total shifts"
          deltaValue={totals.shiftCount}
          data={series.map((s) => ({ label: s.label, value: s.hours }))}
          color="#16A34A"
        />
        <InsightCard
          value={topCategory ? `${Math.round((topCategory.hours / (totals.hours || 1)) * 100)}%` : "—"}
          headline={topCategory ? `Most of your time went to ${topCategory.category}` : "No activity yet this period"}
          body={topCategory ? `${topCategory.hours}h logged${showPay ? ` · $${topCategory.pay.toFixed(0)} earned` : ""} out of ${totals.hours}h total.` : "Log a shift to see insights here."}
          progress={topCategory ? Math.round((topCategory.hours / (totals.hours || 1)) * 100) : 0}
        />
      </div>

      {showPay && (
        <div className="grid lg:grid-cols-2 gap-4 items-stretch">
          <DotHistogramCard
            title="Pay activity"
            value={`$${series.reduce((m, s) => Math.max(m, s.pay), 0).toFixed(0)}`}
            peakLabel="Best period"
            peakValue={series.reduce((a, b) => (b.pay > a.pay ? b : a), series[0] || { label: "—" }).label}
            deltaLabel="Avg. hourly rate"
            deltaValue={`$${avgRate}`}
            data={series.map((s) => ({ label: s.label, value: s.pay }))}
            color="#3B6EF6"
          />
          <StripedProgressCard
            title="Pay by category"
            value={`$${totals.pay.toFixed(0)}`}
            rows={byCategory.map((c) => ({ label: c.category, value: c.pay, display: `$${c.pay.toFixed(2)}`, color: colorOf(c.category) }))}
          />
        </div>
      )}
    </div>
  );
}
