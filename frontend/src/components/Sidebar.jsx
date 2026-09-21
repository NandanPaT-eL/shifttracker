import { IconCalendar, IconChart, IconPlus } from "./Icons.jsx";

const NAV = [
  { id: "calendar", label: "Calendar", Icon: IconCalendar },
  { id: "analytics", label: "Analytics", Icon: IconChart },
];

export default function Sidebar({ view, setView, onAddShift }) {
  return (
    <aside className="sidebar hidden md:flex fixed left-0 top-0 bottom-0 z-40 flex-col w-[var(--sidebar-w)]">
      {/* Logo */}
      <div className="px-5 pt-7 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-violet to-accent-violet-dark flex items-center justify-center shadow-glow">
            <IconCalendar size={18} className="text-white" />
          </div>
          <div>
            <div className="text-[15px] font-bold text-white tracking-tight">ShiftTrack</div>
            <div className="text-[11px] text-sidebar-text font-medium">Time & pay</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-1">
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-sidebar-text/60">
          Menu
        </div>
        {NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            id={`nav-${id}`}
            onClick={() => setView(id)}
            className={`sidebar-link ${view === id ? "active" : ""}`}
          >
            <Icon size={18} className="sidebar-icon" />
            {label}
          </button>
        ))}
      </nav>

      {/* Bottom CTA */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          id="sidebar-add-shift"
          onClick={onAddShift}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-[13px]"
        >
          <IconPlus size={15} />
          Log Shift
        </button>
      </div>
    </aside>
  );
}
