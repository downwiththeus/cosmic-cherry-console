import { SAFE_LOW, SAFE_HIGH, MAX_PSI } from "@/hooks/use-planet-store";

interface Props { pressure: number }

export function SyrupGauge({ pressure }: Props) {
  const pct = Math.max(0, Math.min(100, (pressure / MAX_PSI) * 100));
  const radius = 90;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  const safeStartPct = SAFE_LOW / MAX_PSI;
  const safeEndPct = SAFE_HIGH / MAX_PSI;
  const safeLen = (safeEndPct - safeStartPct) * circ;
  const safeOffset = circ - safeStartPct * circ;

  const inSafe = pressure >= SAFE_LOW && pressure <= SAFE_HIGH;
  const isCritical = pressure > SAFE_HIGH;
  const isLow = pressure < SAFE_LOW;

  const arcColor = isCritical ? "url(#dangerArc)" : isLow ? "url(#coldArc)" : "url(#syrupArc)";
  const labelColor = inSafe ? "var(--syrup)" : "var(--destructive)";
  const statusLabel = inSafe ? "safe band" : isLow ? "underpressure" : "critical";
  const statusColor = inSafe ? "oklch(70% 0.15 150)" : "var(--destructive)";

  return (
    <div
      className="relative"
      style={{
        width: 220, height: 220,
        animation: isCritical ? "danger-shake 0.5s ease-in-out infinite" : undefined,
      }}
    >
      <svg viewBox="0 0 220 220" className="w-full h-full -rotate-90">
        <defs>
          <linearGradient id="syrupArc" x1="0" x2="1">
            <stop offset="0%" stopColor="oklch(85% 0.2 60)" />
            <stop offset="100%" stopColor="oklch(60% 0.27 18)" />
          </linearGradient>
          <linearGradient id="dangerArc" x1="0" x2="1">
            <stop offset="0%" stopColor="oklch(70% 0.28 25)" />
            <stop offset="100%" stopColor="oklch(50% 0.3 15)" />
          </linearGradient>
          <linearGradient id="coldArc" x1="0" x2="1">
            <stop offset="0%" stopColor="oklch(70% 0.2 220)" />
            <stop offset="100%" stopColor="oklch(50% 0.22 240)" />
          </linearGradient>
        </defs>
        {/* track */}
        <circle cx="110" cy="110" r={radius}
          fill="none" stroke="oklch(20% 0.06 20)" strokeWidth="14" />
        {/* safe band */}
        <circle cx="110" cy="110" r={radius}
          fill="none" stroke="oklch(70% 0.15 150 / 0.35)" strokeWidth="14"
          strokeDasharray={`${safeLen} ${circ}`}
          strokeDashoffset={safeOffset}
        />
        {/* pressure arc */}
        <circle cx="110" cy="110" r={radius}
          fill="none" stroke={arcColor} strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 2.4s var(--ease-viscous), stroke 1s var(--ease-viscous)",
            filter: `drop-shadow(0 0 12px ${isCritical ? "oklch(60% 0.3 18 / 0.7)" : "oklch(70% 0.25 25 / 0.6)"})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Syrup PSI</span>
        <span
          className="font-display text-5xl mt-1"
          style={{ color: labelColor, transition: "color 1s var(--ease-viscous)" }}
        >
          {pressure.toFixed(0)}
        </span>
        <span
          className="font-mono text-[10px] uppercase tracking-widest mt-1"
          style={{ color: statusColor, transition: "color 1s var(--ease-viscous)" }}
        >
          {statusLabel}
        </span>
        {isCritical && (
          <span
            className="font-mono text-[9px] uppercase tracking-widest mt-1"
            style={{ color: "var(--destructive)", animation: "streak-pulse 0.8s ease-in-out infinite" }}
          >
            ⚠ fracture risk
          </span>
        )}
      </div>
    </div>
  );
}
