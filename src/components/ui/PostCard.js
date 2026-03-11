const TYPE_COLORS = {
  "hook-driven-story": "#7C6AEF",
  "framework": "#34D399",
  "hot-take": "#FBBF24",
  "listicle": "#60A5FA",
  "question": "#C084FC",
  "other": "#878BA0",
};

const TYPE_LABELS = {
  "hook-driven-story": "Hook-driven Story",
  "framework": "Framework / How-to",
  "hot-take": "Hot Take",
  "listicle": "Listicle",
  "question": "Question",
  "other": "Other",
};

export default function PostCard({ post, onRevoice, compact }) {
  const c = TYPE_COLORS[post.post_type] || "#878BA0";
  const label = TYPE_LABELS[post.post_type] || post.post_type || "Unclassified";
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "";

  return (
    <div className="bg-surface border border-border rounded-xl p-5 transition-colors hover:border-border-hi">
      <div className="flex justify-between items-center mb-3.5 gap-3 flex-wrap">
        <div className="flex gap-2 items-center">
          <span
            className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg uppercase tracking-wider"
            style={{ background: `${c}15`, color: c }}
          >
            {label}
          </span>
          {post.performance_percentile >= 90 && (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 tracking-wide">
              TOP {100 - post.performance_percentile}%
            </span>
          )}
          {post.hook_style && (
            <span className="text-[10px] px-2 py-0.5 rounded-lg bg-bg text-text-dim">
              {post.hook_style}
            </span>
          )}
        </div>
        <span className="text-xs text-text-dim">{date}</span>
      </div>

      <p
        className="text-sm leading-relaxed text-text-primary m-0 whitespace-pre-wrap"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: compact ? 4 : 10,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {post.content}
      </p>

      <div className="flex justify-between items-center mt-4 pt-3.5 border-t border-border">
        <div className="flex gap-5">
          {[
            ["♥", post.likes],
            ["💬", post.comments],
            ["↗", post.shares],
          ].map(([icon, val], i) => (
            <span key={i} className="text-[13px] text-text-muted">
              {icon} <span className="font-semibold">{val}</span>
            </span>
          ))}
        </div>
        {onRevoice && (
          <button
            onClick={() => onRevoice(post)}
            className="px-4 py-1.5 rounded-lg text-[13px] font-semibold bg-accent/10 text-accent-light border border-accent/25 cursor-pointer transition-all hover:bg-accent/20"
          >
            Re-voice ✦
          </button>
        )}
      </div>
    </div>
  );
}
