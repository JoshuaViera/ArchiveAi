export default function Spinner({ text }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-12 text-center">
      <div
        className="w-9 h-9 border-[3px] border-border border-t-accent rounded-full mx-auto mb-4"
        style={{ animation: "spin 0.7s linear infinite" }}
      />
      <p className="text-text-muted text-sm m-0">{text}</p>
    </div>
  );
}
