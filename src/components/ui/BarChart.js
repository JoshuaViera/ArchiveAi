const TYPE_COLORS = {
  "Hook-driven Story": "#7C6AEF",
  "Framework / How-to": "#34D399",
  "Hot Take": "#FBBF24",
  "Listicle": "#60A5FA",
  "Question": "#C084FC",
};

export default function BarChart({ data, maxVal = 3.5 }) {
  return (
    <div className="flex flex-col gap-2.5">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3.5">
          <span className="w-[135px] text-[13px] text-text-muted text-right flex-shrink-0">
            {d.type}
          </span>
          <div className="flex-1 h-[22px] bg-bg rounded-md overflow-hidden">
            <div
              className="h-full rounded-md transition-all duration-700"
              style={{
                width: `${(d.avgEngagement / maxVal) * 100}%`,
                background: `linear-gradient(90deg, #7C6AEF, #9B8DF5)`,
              }}
            />
          </div>
          <span className="w-[44px] text-[13px] text-text-primary font-semibold text-right">
            {d.avgEngagement}x
          </span>
        </div>
      ))}
    </div>
  );
}
