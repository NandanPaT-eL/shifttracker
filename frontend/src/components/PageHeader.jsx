import { IconLink } from "./Icons.jsx";

export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
      <div className="flex items-center gap-2">
        <h1 className="text-[26px] font-bold text-ink tracking-tight">{title}</h1>
        <button className="icon-btn" aria-label="Copy link to this view">
          <IconLink size={13} />
        </button>
        {subtitle && <span className="text-[13px] text-muted ml-1">{subtitle}</span>}
      </div>
      <div className="flex items-center gap-2 flex-wrap">{children}</div>
    </div>
  );
}
