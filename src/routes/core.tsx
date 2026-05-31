import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { usePlanetStore } from "@/hooks/use-planet-store";
import { GameOverlay } from "@/components/GameOverlay";

export const Route = createFileRoute("/core")({
  head: () => ({
    meta: [
      { title: "The Pit // Planetary Core" },
      { name: "description", content: "Descent into the planetary pit — stress telemetry of the cherry seed core." },
    ],
  }),
  component: PitView,
});

const DOCTRINE = [
  "The pit anchors the planet. Pry to relieve, never to shatter.",
  "A seed that fractures yields no second harvest.",
  "Syrup is currency. Pressure is debt. Balance is creed.",
  "Listen to the lattice; it hums before it splits.",
  "Every harvester is a finger on the planet's pulse.",
  "Glaze is memory. Crust is law. Pit is origin.",
];

const EVENTS = [
  { t: "−02:14", msg: "Microfissure sealed at strata 7", level: "ok" as const },
  { t: "−04:38", msg: "Pry cycle absorbed 142 psi spike", level: "ok" as const },
  { t: "−07:02", msg: "Lattice resonance: 41.2 Hz", level: "info" as const },
  { t: "−09:51", msg: "Harvester ψ-12 calibrated yield", level: "info" as const },
  { t: "−13:20", msg: "Glaze layer drift +0.003", level: "warn" as const },
  { t: "−18:44", msg: "Seed core thermal: 318 K", level: "info" as const },
  { t: "−22:09", msg: "Syrup vein rerouted, sector 4", level: "ok" as const },
];

// Seismograph isolated so its 80ms interval doesn't re-render PitView.
function Seismograph({ pressure }: { pressure: number }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPhase((p) => p + 0.12), 80);
    return () => clearInterval(t);
  }, []);
  const amp = 10 + (pressure / 1000) * 22;
  const W = 320, H = 60;
  const pts = Array.from({ length: 64 }, (_, i) => {
    const x = (i / 63) * W;
    const y = H / 2 + Math.sin(i * 0.45 + phase) * amp * 0.6 + Math.sin(i * 0.18 + phase * 0.7) * amp * 0.4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <div className="clip-hex px-4 py-3" style={{ background: "oklch(18% 0.06 18)" }}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="oklch(30% 0.08 18 / 0.5)" strokeDasharray="2 4" />
        <polyline
          fill="none"
          stroke={pressure > 800 ? "var(--destructive)" : "var(--syrup)"}
          strokeWidth="1.5"
          points={pts}
          style={{ filter: "drop-shadow(0 0 4px currentColor)" }}
        />
      </svg>
    </div>
  );
}

function PitView() {
  const data = usePlanetStore();
  const p = data.syrup_pressure;
  // Integrity peaks at the pressure midpoint (500 psi) and drops to 0% at both extremes.
  const integrity = Math.max(0, 100 - Math.abs(p - 500) / 5);
  const totalPit = data.total_pit;
  const totalJuice = data.total_juice;
  const totalCrust = data.total_crust;
  const fissure = Math.min(99, Math.abs(p - 500) / 5);
  const resonance = 38 + (p / 1000) * 18;

  // Rotating doctrine
  const [dIdx, setDIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDIdx((d) => (d + 1) % DOCTRINE.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <GameOverlay />
      <Link
        to="/"
        className="absolute top-8 left-8 z-10 font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground hover:text-syrup-glow"
        style={{ transition: "color 700ms var(--ease-viscous)" }}
      >
        ← Surface
      </Link>
      <header className="absolute top-8 right-8 text-right z-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          Depth –12.7 km // Core
        </p>
        <h1 className="font-display text-3xl mt-1" style={{ color: "var(--crust)" }}>
          The Pit
        </h1>
      </header>

      {/* LEFT telemetry column */}
      <aside className="absolute left-8 top-32 z-10 flex flex-col gap-3 w-72">
        <PanelLabel>Core Telemetry</PanelLabel>
        <Readout label="Pressure" value={`${p.toFixed(1)} psi`} accent={p > 800} />
        <Readout label="Integrity" value={`${integrity.toFixed(2)} %`} />
        <Readout label="Lattice" value={p > 800 ? "FRACTURING" : p > 600 ? "STRAINED" : "STABLE"} accent={p > 600} />
        <Readout label="Fissures" value={fissure.toFixed(0)} />
        <Readout label="Resonance" value={`${resonance.toFixed(1)} Hz`} />

        <PanelLabel className="mt-4">Seismograph</PanelLabel>
        <Seismograph pressure={p} />
      </aside>

      {/* RIGHT lore + tallies */}
      <aside className="absolute right-8 top-32 z-10 flex flex-col gap-3 w-72 text-right">
        <PanelLabel right>Pit Stabilizers</PanelLabel>
        <Readout right label="Pry Cycles" value={totalPit.toFixed(1)} />
        <Readout right label="Juice Drawn" value={totalJuice.toFixed(1)} />
        <Readout right label="Crust Mined" value={totalCrust.toFixed(1)} />

        <PanelLabel right className="mt-4">Seed Doctrine</PanelLabel>
        <div
          className="clip-hex px-5 py-4 text-left min-h-[88px] flex items-center"
          style={{ background: "oklch(18% 0.06 18)" }}
        >
          <p
            key={dIdx}
            className="font-mono text-[11px] leading-relaxed animate-fade-in"
            style={{ color: "var(--crust)" }}
          >
            <span style={{ color: "var(--syrup)" }}>"</span>
            {DOCTRINE[dIdx]}
            <span style={{ color: "var(--syrup)" }}>"</span>
          </p>
        </div>

        <PanelLabel right className="mt-4">Tectonic Events</PanelLabel>
        <div className="flex flex-col gap-1.5 text-left max-h-56 overflow-y-auto scrollbar-none">
          {EVENTS.map((e, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-2"
              style={{
                background: "oklch(16% 0.05 18 / 0.7)",
                borderLeft: `2px solid ${e.level === "warn" ? "var(--destructive)" : e.level === "ok" ? "var(--syrup)" : "oklch(45% 0.1 30)"}`,
              }}
            >
              <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground w-12 shrink-0">{e.t}</span>
              <span className="font-mono text-[10px]" style={{ color: "var(--crust)" }}>{e.msg}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Center seed orb */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border"
            style={{
              width: 200 + i * 110,
              height: 200 + i * 110,
              borderColor: `oklch(${30 + i * 5}% 0.1 20 / ${0.5 - i * 0.08})`,
              borderStyle: i % 2 ? "solid" : "dashed",
              animation: `${i % 2 ? "orbit-slow" : "orbit-reverse"} ${60 + i * 20}s linear infinite`,
            }}
          />
        ))}

        <div
          className="relative rounded-full flex items-center justify-center"
          style={{
            width: 320,
            height: 320,
            background: "var(--grad-pit)",
            boxShadow: "inset 0 0 80px oklch(5% 0.02 18), 0 0 60px oklch(40% 0.2 22 / 0.4)",
            animation: "pulse-syrup 6s var(--ease-viscous) infinite",
          }}
        >
          <div className="text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              Seed Integrity
            </p>
            <p className="font-display text-7xl text-syrup-glow mt-2" style={{ color: "var(--syrup)" }}>
              {integrity.toFixed(1)}
              <span className="text-2xl">%</span>
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground mt-2">
              stress index
            </p>
          </div>
        </div>
      </div>

      {/* Drip pillars */}
      <div className="absolute inset-x-0 top-0 flex justify-around pointer-events-none">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="block w-1.5 rounded-b-full"
            style={{
              height: 28,
              background: "linear-gradient(to bottom, transparent, oklch(60% 0.27 18))",
              animation: `drip ${4 + i}s var(--ease-viscous) ${i * 0.6}s infinite`,
            }}
          />
        ))}
      </div>

      <footer className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground text-center">
        warning: extraction beyond 800 psi destabilizes seed lattice
      </footer>
    </main>
  );
}

function PanelLabel({ children, right, className = "" }: { children: React.ReactNode; right?: boolean; className?: string }) {
  return (
    <p
      className={`font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground ${right ? "text-right" : ""} ${className}`}
    >
      {children}
    </p>
  );
}

function Readout({
  label, value, accent, right,
}: {
  label: string; value: string | number; accent?: boolean; right?: boolean;
}) {
  return (
    <div
      className="clip-hex px-5 py-3 flex items-center justify-between gap-3"
      style={{ background: "oklch(18% 0.06 18)" }}
    >
      {right ? (
        <>
          <span className="font-display text-base" style={{ color: accent ? "var(--destructive)" : "var(--syrup)" }}>{value}</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</span>
        </>
      ) : (
        <>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</span>
          <span className="font-display text-base" style={{ color: accent ? "var(--destructive)" : "var(--syrup)" }}>{value}</span>
        </>
      )}
    </div>
  );
}
