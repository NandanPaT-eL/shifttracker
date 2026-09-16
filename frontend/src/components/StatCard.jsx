export default function StatCard({ label, value, sub, accent = "#0A84FF" }) {
  return (
    <div className="glass rounded-xl2 shadow-glass p-4 sm:p-5 flex-1 min-w-[140px]">
      <div className="text-[12px] font-medium text-mist">{label}</div>
      <div className="text-[26px] sm:text-[30px] font-semibold text-ink tracking-tight mt-1" style={{ color: accent }}>
        {value}
      </div>
      {sub && <div className="text-[12px] text-mist mt-0.5">{sub}</div>}
    </div>
  );
}
