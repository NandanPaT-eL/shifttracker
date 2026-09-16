import { useState } from "react";
import { IconSparkles, IconChevronDown, IconChevronUp } from "./Icons.jsx";

// Cosmetic + functional quick-action bar, styled after the reference
// dashboard's "What would you like to explore next?" element. Each
// suggestion is a real action (switch period, jump to today, log a shift).
export default function ExploreBar({ prompt, suggestions = [] }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-2xl bg-gradient-to-b from-accent-blue-light to-white border border-accent-blue-light overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-[13px] font-medium text-ink-2">
          <IconSparkles size={14} className="text-accent-blue" />
          {prompt}
        </span>
        {open ? <IconChevronUp size={13} className="text-muted" /> : <IconChevronDown size={13} className="text-muted" />}
      </button>

      {open && suggestions.length > 0 && (
        <div className="px-4 pb-3.5 flex flex-wrap gap-2 animate-fade-in">
          {suggestions.map((s) => (
            <button
              key={s.text}
              onClick={s.onClick}
              className="text-[12.5px] font-medium px-3 py-1.5 rounded-full bg-white border border-hairline text-ink-2 hover:border-accent-blue hover:text-accent-blue transition-colors shadow-sm"
            >
              {s.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
