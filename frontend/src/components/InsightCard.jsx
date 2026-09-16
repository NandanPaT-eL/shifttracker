import { IconSparkles } from "./Icons.jsx";

export default function InsightCard({ badge = "Insights", value, headline, body, progress }) {
  return (
    <div className="insight-gradient card border-0 p-5 flex flex-col justify-between h-full min-h-[220px]">
      <span className="relative z-10 inline-flex items-center gap-1.5 self-start text-[11.5px] font-medium px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
        <IconSparkles size={12} />
        {badge}
      </span>

      <div className="relative z-10">
        <div className="text-[46px] font-bold tracking-tight leading-none mb-3">{value}</div>
        <div className="text-[15px] font-semibold leading-snug mb-1.5">{headline}</div>
        {body && <div className="text-[12.5px] text-white/80 leading-relaxed">{body}</div>}
      </div>

      {progress !== undefined && (
        <div className="relative z-10 h-1.5 rounded-full bg-white/25 overflow-hidden mt-4">
          <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
