export default function StatCard({ label, value, sub }) {
  return (
    <div className="bg-surface border border-border rounded-xl px-6 py-5 flex-1 min-w-[155px]">
      <div className="text-[11px] text-text-dim uppercase tracking-wider mb-2 font-semibold">
        {label}
      </div>
      <div className="text-3xl font-bold text-text-primary tracking-tight">
        {value}
      </div>
      {sub && (
        <div className="text-xs text-text-dim mt-1.5">{sub}</div>
      )}
    </div>
  );
}
