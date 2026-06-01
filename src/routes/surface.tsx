import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { planetStore, usePlanetStore, WIN_TARGET, SAFE_LOW, SAFE_HIGH } from "@/hooks/use-planet-store";
import { GameOverlay } from "@/components/GameOverlay";
import { toast } from "sonner";

export const Route = createFileRoute("/surface")({
  head: () => ({
    meta: [
      { title: "The Surface // Crust Walk" },
      { name: "description", content: "Stand on the cherry crust. Seal fissures before the lattice splits." },
    ],
  }),
  component: SurfaceView,
});

interface Fissure {
  id: string;
  x: number; // %
  y: number; // %
  born: number; // ms
  life: number; // ms until burst
  size: number;
}

const SPAWN_BASE = 1800; // ms baseline between spawns
const FISSURE_LIFE = 3200;
const MAX_ACTIVE = 6;

function SurfaceView() {
  const s = usePlanetStore();
  const [fissures, setFissures] = useState<Fissure[]>([]);
  const [, setTick] = useState(0);
  const [stats, setStats] = useState({ sealed: 0, burst: 0, combo: 0 });
  const fissuresRef = useRef<Fissure[]>([]);
  const lastSpawn = useRef(0);
  const pressureRef = useRef(s.syrup_pressure);
  pressureRef.current = s.syrup_pressure;

  // Spawn + lifecycle loop (imperative — no side effects inside setState updaters)
  useEffect(() => {
    if (s.status !== "playing") return;
    let raf = 0;
    const loop = (now: number) => {
      const stress = Math.abs(pressureRef.current - 500) / 500;
      const interval = SPAWN_BASE - stress * 1100;

      let changed = false;
      const alive: Fissure[] = [];
      let bursts = 0;
      for (const fi of fissuresRef.current) {
        if (now - fi.born >= fi.life) bursts++;
        else alive.push(fi);
      }
      if (bursts > 0) {
        for (let i = 0; i < bursts; i++) planetStore.burst();
        setStats((st) => ({ ...st, burst: st.burst + bursts, combo: 0 }));
        changed = true;
      }

      if (now - lastSpawn.current > interval && alive.length < MAX_ACTIVE) {
        lastSpawn.current = now;
        alive.push({
          id: crypto.randomUUID(),
          x: 10 + Math.random() * 80,
          y: 18 + Math.random() * 64,
          born: now,
          life: FISSURE_LIFE - stress * 900,
          size: 60 + Math.random() * 60,
        });
        changed = true;
      }

      if (changed) {
        fissuresRef.current = alive;
        setFissures(alive);
      }
      setTick((t) => (t + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [s.status]);

  // Reset minigame state when game ends/resets
  useEffect(() => {
    if (s.status !== "playing") {
      fissuresRef.current = [];
      setFissures([]);
      setStats({ sealed: 0, burst: 0, combo: 0 });
    }
  }, [s.status]);

  const seal = (id: string) => {
    if (!fissuresRef.current.some((x) => x.id === id)) return;
    fissuresRef.current = fissuresRef.current.filter((x) => x.id !== id);
    setFissures(fissuresRef.current);
    planetStore.seal();
    setStats((st) => {
      const combo = st.combo + 1;
      if (combo > 0 && combo % 5 === 0) toast.success(`Combo x${combo} — clean glaze!`);
      return { ...st, sealed: st.sealed + 1, combo };
    });
  };


  const refined = s.refined ?? 0;
  const pct = Math.min(100, (refined / WIN_TARGET) * 100);
  const p = s.syrup_pressure;
  const inSafe = p >= SAFE_LOW && p <= SAFE_HIGH;

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <GameOverlay />

      {/* Sky — looking up from the crust */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 110%, oklch(45% 0.22 28) 0%, oklch(25% 0.14 20) 35%, oklch(12% 0.05 22) 75%, oklch(6% 0.02 20) 100%)",
        }}
      />
      {/* Distant cherry suns */}
      <div
        className="absolute rounded-full"
        style={{
          top: "12%", left: "18%", width: 90, height: 90,
          background: "radial-gradient(circle, oklch(85% 0.22 35), transparent 70%)",
          filter: "blur(2px)",
          animation: "pulse-syrup 9s var(--ease-viscous) infinite",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          top: "22%", right: "14%", width: 50, height: 50,
          background: "radial-gradient(circle, oklch(70% 0.2 18), transparent 70%)",
          filter: "blur(1px)",
          animation: "pulse-syrup 13s var(--ease-viscous) infinite",
        }}
      />

      {/* Crust horizon — convex curve filling lower half */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: "70%",
          background: "var(--grad-planet)",
          borderTopLeftRadius: "100% 80%",
          borderTopRightRadius: "100% 80%",
          boxShadow: "inset 0 -80px 180px oklch(8% 0.04 18 / 0.9), 0 -40px 80px oklch(70% 0.25 25 / 0.25)",
          transform: "scaleX(1.4)",
          transformOrigin: "center bottom",
        }}
      />
      {/* Glaze sheen on horizon */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          bottom: "62%",
          height: 6,
          background: "linear-gradient(to bottom, oklch(95% 0.08 60 / 0.45), transparent)",
          filter: "blur(3px)",
        }}
      />

      {/* Header */}
      <Link
        to="/"
        className="absolute top-8 left-8 z-20 font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground hover:text-syrup-glow"
        style={{ transition: "color 700ms var(--ease-viscous)" }}
      >
        ← Orbit
      </Link>
      <header className="absolute top-8 left-1/2 -translate-x-1/2 z-20 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          Glaze Layer 0.04 // Surface Walk
        </p>
        <h1 className="font-display text-3xl mt-1" style={{ color: "var(--crust)" }}>
          The Crust
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-1">
          Tap fissures before they burst · Each seal vents −8 psi & refines +5
        </p>
      </header>

      {/* Right HUD */}
      <aside className="absolute top-8 right-8 z-20 w-60 text-right flex flex-col gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            Refined · Quota
          </p>
          <p className="font-display text-2xl mt-1" style={{ color: "var(--syrup)" }}>
            {refined.toFixed(0)}<span className="text-sm text-muted-foreground"> / {WIN_TARGET}</span>
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "oklch(20% 0.06 18)" }}>
            <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, background: "var(--grad-syrup)" }} />
          </div>
        </div>
        <Readout label="Pressure" value={`${p.toFixed(0)} psi`} accent={!inSafe} />
        <Readout label="Sealed" value={stats.sealed} />
        <Readout label="Burst" value={stats.burst} accent={stats.burst > 0} />
        <Readout label="Combo" value={`x${stats.combo}`} />
      </aside>

      {/* Fissure field — clickable layer */}
      <div className="absolute inset-x-0 bottom-0 z-10" style={{ height: "62%" }}>
        {fissures.map((f) => {
          const age = performance.now() - f.born;
          const progress = Math.min(1, age / f.life);
          return (
            <button
              key={f.id}
              onClick={() => seal(f.id)}
              className="absolute group"
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                width: f.size,
                height: f.size,
                transform: "translate(-50%, -50%)",
              }}
              aria-label="Seal fissure"
            >
              {/* warning ring */}
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  border: `2px solid oklch(${60 + progress * 20}% 0.27 ${22 - progress * 4} / ${0.3 + progress * 0.6})`,
                  transform: `scale(${1 + progress * 0.4})`,
                  transition: "transform 120ms var(--ease-viscous)",
                  filter: `blur(${progress * 1.2}px)`,
                }}
              />
              {/* crack svg */}
              <svg viewBox="-50 -50 100 100" className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id={`crk-${f.id}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="oklch(15% 0.05 18)" />
                    <stop offset="100%" stopColor={`oklch(${55 + progress * 15}% 0.27 22)`} />
                  </linearGradient>
                </defs>
                <path
                  d="M -40 -8 L -18 -2 L -10 -14 L 2 4 L 14 -6 L 28 8 L 40 -2"
                  fill="none"
                  stroke={`url(#crk-${f.id})`}
                  strokeWidth={2 + progress * 3}
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 ${4 + progress * 8}px oklch(70% 0.25 25 / ${0.4 + progress * 0.5}))` }}
                />
                <path
                  d="M -6 4 L -14 22 M 4 4 L 10 24 M 14 -6 L 22 -22"
                  fill="none"
                  stroke={`oklch(${50 + progress * 20}% 0.25 22 / ${0.4 + progress * 0.6})`}
                  strokeWidth={1 + progress * 2}
                  strokeLinecap="round"
                />
              </svg>
              <span
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100"
                style={{ color: "var(--syrup)", transition: "opacity 300ms" }}
              >
                seal
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom guidance */}
      <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground text-center">
        unsealed fissures burst → +25 psi · keep pressure inside {SAFE_LOW}–{SAFE_HIGH}
      </footer>

      {/* Navigation back to orbit */}
      <Link
        to="/core"
        className="absolute bottom-6 right-8 z-20 font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground hover:text-syrup-glow"
        style={{ transition: "color 700ms var(--ease-viscous)" }}
      >
        Descend to Pit →
      </Link>
    </main>
  );
}

function Readout({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div
      className="clip-hex px-5 py-2 flex items-center justify-between gap-3"
      style={{ background: "oklch(18% 0.06 18)" }}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</span>
      <span className="font-display text-base" style={{ color: accent ? "var(--destructive)" : "var(--syrup)" }}>{value}</span>
    </div>
  );
}
