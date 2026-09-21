import { IconPlus } from "./Icons.jsx";

const NAV = [
  { id: "calendar", label: "Calendar" },
  { id: "analytics", label: "Analytics" },
];

export default function TopNav({ view, setView, onAddShift }) {
  return (
    <header className="hidden md:block sticky top-0 z-30 px-6 lg:px-8 pt-4 pb-3">
      <div className="glass-nav flex items-center justify-between h-14 px-5 gap-6">
        <h1 className="text-[17px] font-semibold text-ink tracking-tight flex-shrink-0">
          Welcome, <span className="font-bold">Nandan</span>
        </h1>

        <nav className="glass-pill-group flex items-center gap-1 p-1">
          {NAV.map(({ id, label }) => (
            <button
              key={id}
              id={`nav-${id}`}
              onClick={() => setView(id)}
              className={`glass-nav-link ${view === id ? "active" : ""}`}
            >
              {label}
            </button>
          ))}
        </nav>

        <button
          id="header-add-shift"
          onClick={onAddShift}
          className="glass-btn-primary flex items-center gap-1.5 py-2 px-4 text-[13px] flex-shrink-0"
        >
          <IconPlus size={14} />
          Log Shift
        </button>
      </div>
    </header>
  );
}
