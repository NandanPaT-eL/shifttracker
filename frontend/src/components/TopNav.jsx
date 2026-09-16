import { IconCalendar, IconSearch, IconBell, IconPlus } from "./Icons.jsx";

const NAV = [
  { id: "calendar", label: "Calendar" },
  { id: "analytics", label: "Analytics" },
];

export default function TopNav({ view, setView, onAddShift }) {
  return (
    <header className="hidden md:block topnav sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-6 lg:px-8 gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-blue to-accent-blue-dark flex items-center justify-center">
            <IconCalendar size={15} className="text-white" />
          </div>
          <span className="text-[16px] font-bold text-ink tracking-tight">shifttrack</span>
        </div>

        {/* Nav pills */}
        <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
          {NAV.map(({ id, label }) => (
            <button
              key={id}
              id={`nav-${id}`}
              onClick={() => setView(id)}
              className={`topnav-link ${view === id ? "active" : ""}`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="icon-btn" aria-label="Search">
            <IconSearch size={16} />
          </button>
          <button className="icon-btn relative" aria-label="Notifications">
            <IconBell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent-orange" />
          </button>
          <button
            id="header-add-shift"
            onClick={onAddShift}
            className="btn-primary flex items-center gap-1.5 py-2 px-3.5 text-[13px] ml-1"
          >
            <IconPlus size={13} />
            Log Shift
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-amber to-accent-orange flex items-center justify-center text-white text-[12px] font-bold ml-1">
            SP
          </div>
        </div>
      </div>
    </header>
  );
}
