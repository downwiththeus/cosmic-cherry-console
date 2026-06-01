import { planetStore, usePlanetStore, WIN_TARGET, SAFE_LOW, SAFE_HIGH } from "@/hooks/use-planet-store";

export function GameOverlay() {
  const s = usePlanetStore();
  if (s.status === "playing") return null;

  const map = {
    won: {
      title: "Harvest Complete",
      sub: `${WIN_TARGET} units of refined syrup delivered to the macrocosm.`,
      tone: "var(--syrup)",
      flavor: "The pie tastes you back.",
    },
    "lost-shatter": {
      title: "Lattice Shattered",
      sub: "Pressure breached 1000 psi. The seed split — planet bleeding syrup into the void.",
      tone: "var(--destructive)",
      flavor: "You squeezed too hard.",
    },
    "lost-collapse": {
      title: "Vein Collapsed",
      sub: "Pressure dropped to zero. Crust folded in on the dry pit.",
      tone: "var(--destructive)",
      flavor: "You drained the dream.",
    },
  } as const;
  const m = map[s.status as keyof typeof map];

  const streakNote = s.streak > 0 ? ` · Peak streak ${s.streak}×` : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
      style={{ background: "oklch(8% 0.03 18 / 0.85)" }}>
      <div className="clip-blob-soft px-12 py-10 max-w-md text-center"
        style={{ background: "oklch(14% 0.05 18)", boxShadow: `0 0 80px ${m.tone}` }}>
        <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-muted-foreground">
          End of Cycle
        </p>
        <h2 className="font-display text-4xl mt-3" style={{ color: m.tone }}>{m.title}</h2>
        <p className="font-mono text-xs mt-4 leading-relaxed" style={{ color: "var(--crust)" }}>
          {m.sub}
        </p>
        <p className="font-mono text-[10px] italic tracking-[0.15em] mt-3" style={{ color: m.tone }}>
          {m.flavor}
        </p>
        <div className="mt-5 pt-5 border-t" style={{ borderColor: "oklch(30% 0.08 18 / 0.4)" }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Refined: <span style={{ color: "var(--syrup)" }}>{s.refined.toFixed(0)}</span>
            {streakNote} · Safe band {SAFE_LOW}–{SAFE_HIGH} psi
          </p>
          {s.best_refined > 0 && (
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-1">
              Session best: <span style={{ color: "var(--syrup)" }}>{s.best_refined.toFixed(0)}</span> units
            </p>
          )}
        </div>
        <button
          onClick={() => planetStore.reset()}
          className="mt-6 px-8 py-3 font-mono text-[11px] uppercase tracking-[0.4em] clip-hex"
          style={{ background: "var(--grad-syrup)", color: "var(--pitted)" }}
        >
          Reseed Planet
        </button>
      </div>
    </div>
  );
}
