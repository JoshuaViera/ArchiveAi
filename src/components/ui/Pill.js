export default function Pill({ text, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all whitespace-nowrap ${
        active
          ? "bg-accent/10 text-accent-light border-accent/25"
          : "bg-transparent text-text-muted border-border hover:border-border-hi"
      }`}
    >
      {text}
    </button>
  );
}
