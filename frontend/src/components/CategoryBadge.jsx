// CategoryBadge retained for compatibility (currently unused in redesign)
export default function CategoryBadge({ name, color }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
      style={{ background: `${color || "#3B82F6"}18`, color: color || "#3B82F6" }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color || "#3B82F6" }} />
      {name}
    </span>
  );
}
