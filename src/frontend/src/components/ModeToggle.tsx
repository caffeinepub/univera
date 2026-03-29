import { useApp } from "../context/AppContext";

export function ModeToggle() {
  const { mode, setMode } = useApp();

  return (
    <div
      className="flex items-center glass-dark rounded-full p-1"
      data-ocid="mode.toggle"
    >
      <button
        type="button"
        onClick={() => setMode("dating")}
        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
          mode === "dating"
            ? "bg-primary text-primary-foreground shadow-btn-violet"
            : "text-muted-foreground hover:text-foreground"
        }`}
        data-ocid="mode.dating.toggle"
      >
        💘 Dating
      </button>
      <button
        type="button"
        onClick={() => setMode("bff")}
        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
          mode === "bff"
            ? "bg-accent text-accent-foreground shadow-btn-pink"
            : "text-muted-foreground hover:text-foreground"
        }`}
        data-ocid="mode.bff.toggle"
      >
        🤝 BFF
      </button>
    </div>
  );
}
