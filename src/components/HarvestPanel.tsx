import { useCallback, useEffect, useState } from "react";
import {
  planetStore, usePlanetStore, type ResourceType,
  DELTA, streakMultiplier, MAX_PSI, SAFE_LOW, SAFE_HIGH,
} from "@/hooks/use-planet-store";
import { toast } from "sonner";

const RESOURCES: { type: ResourceType; label: string; hint: string; key: string }[] = [
  { type: "juice", label: "Tap Juice", hint: "+ psi · refines", key: "Q" },
  { type: "crust", label: "Mine Crust", hint: "− psi · safe vent", key: "W" },
  { type: "pit",   label: "Pry Pit",   hint: "−− psi · risky", key: "E" },
];

const SHAPES = ["clip-petal", "clip-hex", "clip-tear"] as const;

const PRESETS = [10, 25, 50, 100];

export function HarvestPanel() {
  const [amount, setAmount] = useState(12);
  const [hoveredType, setHoveredType] = useState<ResourceType | null>(null);
  const { streak, status, syrup_pressure } = usePlanetStore();

  const extract = useCallback((type: ResourceType) => {
    if (status !== "playing") return;
    const delta = DELTA[type] * amount;
    const sign = delta >= 0 ? "+" : "";
    const nextPsi = syrup_pressure + delta;
    const clamped = Math.max(0, Math.min(MAX_PSI, nextPsi));
    const willBeInSafe = clamped >= SAFE_LOW && clamped <= SAFE_HIGH;
    const nextStreak = type === "juice" && willBeInSafe ? streak + 1 : 0;
    const mult = streakMultiplier(nextStreak);
    const bonusNote = type === "juice" && willBeInSafe
      ? ` · ${((mult - 1) * 100).toFixed(0)}% streak bonus`
      : "";
    planetStore.extract(type, amount);
    toast.success(`${sign}${delta.toFixed(1)} PSI · ${amount} ${type}${bonusNote}`);
  }, [amount, streak, status, syrup_pressure]);

  // keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const key = e.key.toUpperCase();
      if (key === "Q") extract("juice");
      else if (key === "W") extract("crust");
      else if (key === "E") extract("pit");
      else if (key === "1") setAmount(10);
      else if (key === "2") setAmount(25);
      else if (key === "3") setAmount(50);
      else if (key === "4") setAmount(100);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [extract]);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Yield controls */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-[0.25em]">
          <label className="text-muted-foreground">Yield</label>
          <input
            type="range" min={1} max={100} value={amount}
            onChange={(e) => setAmount(+e.target.value)}
            className="w-36 accent-[var(--syrup)]"
          />
          <span className="w-8 font-display text-sm" style={{ color: "var(--syrup)" }}>{amount}</span>
        </div>
        {/* Quick presets */}
        <div className="flex gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={p}
              onClick={() => setAmount(p)}
              className="font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-1 rounded-sm"
              style={{
                background: amount === p ? "var(--grad-syrup)" : "oklch(22% 0.07 20)",
                color: amount === p ? "var(--pitted)" : "var(--muted-foreground)",
                transition: "all 400ms var(--ease-viscous)",
                boxShadow: amount === p ? "0 0 8px var(--syrup)" : "none",
              }}
              title={`Yield ${p} (key ${i + 1})`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Extraction buttons */}
      <div className="flex gap-4">
        {RESOURCES.map((r, idx) => {
          const isHovered = hoveredType === r.type;
          return (
            <button
              key={r.type}
              onClick={() => extract(r.type)}
              onMouseEnter={() => setHoveredType(r.type)}
              onMouseLeave={() => setHoveredType(null)}
              className={`${SHAPES[idx]} harvest-btn ease-viscous flex flex-col items-center justify-center gap-1 relative`}
              style={{
                width: 130, height: 130,
                background: isHovered ? "var(--grad-syrup)" : "oklch(22% 0.08 20)",
                color: isHovered ? "var(--pitted)" : "var(--crust)",
                transition: "all 700ms var(--ease-viscous)",
                boxShadow: isHovered
                  ? "0 0 30px oklch(70% 0.25 25 / 0.5)"
                  : "inset 0 0 0 1px oklch(40% 0.1 20 / 0.5)",
              }}
            >
              {/* keyboard hint badge */}
              <span
                className="absolute font-mono text-[8px] tracking-[0.1em]"
                style={{ top: "22%", opacity: 0.55, color: "inherit" }}
              >
                [{r.key}]
              </span>
              <span className="font-display text-sm uppercase tracking-[0.15em]">{r.label}</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-70">{r.hint}</span>
            </button>
          );
        })}
      </div>

      {/* PSI outcome preview — warns when lethal or out-of-band */}
      <div className="flex gap-4">
        {RESOURCES.map((r) => {
          const nextPsi = syrup_pressure + DELTA[r.type] * amount;
          const clamped = Math.max(0, Math.min(MAX_PSI, nextPsi));
          const lethal = nextPsi >= MAX_PSI || nextPsi <= 0;
          const outOfBand = !lethal && (clamped > SAFE_HIGH || clamped < SAFE_LOW);
          const color = lethal
            ? "var(--destructive)"
            : outOfBand
            ? "oklch(75% 0.25 55)"
            : "oklch(50% 0.1 150)";
          return (
            <div key={r.type} className="w-[130px] text-center">
              <span className="font-mono text-[8px] uppercase tracking-[0.2em]" style={{ color }}>
                {lethal ? "⚠ lethal" : `→ ${clamped.toFixed(0)} psi`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Keyboard hint */}
      <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground opacity-60">
        Q · W · E to extract · 1–4 for yield
      </p>
    </div>
  );
}
