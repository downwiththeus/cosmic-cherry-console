import { SAFE_LOW, SAFE_HIGH, MAX_PSI } from "@/hooks/use-planet-store";

interface Props {
  history: number[];
  width?: number;
  height?: number;
}

export function PressureSparkline({ history, width = 240, height = 52 }: Props) {
  if (history.length < 2) return null;

  const W = width;
  const H = height;
  const pad = 4;

  const toXY = (p: number, i: number) => ({
    x: pad + (i / (history.length - 1)) * (W - pad * 2),
    y: H - pad - ((p / MAX_PSI) * (H - pad * 2)),
  });

  const pts = history.map((p, i) => {
    const { x, y } = toXY(p, i);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const safeY1 = H - pad - ((SAFE_HIGH / MAX_PSI) * (H - pad * 2));
  const safeY2 = H - pad - ((SAFE_LOW / MAX_PSI) * (H - pad * 2));

  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  const danger = last > SAFE_HIGH || last < SAFE_LOW;
  const color = danger ? "var(--destructive)" : "var(--syrup)";
  const { x: dotX, y: dotY } = toXY(last, history.length - 1);
  const trend = last > prev ? "↑" : last < prev ? "↓" : "→";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">PSI trend</span>
        <span className="font-mono text-[9px]" style={{ color }}>{trend} {last.toFixed(0)}</span>
      </div>
      <div style={{ width: W, height: H }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible">
          {/* safe band fill */}
          <rect
            x={pad} y={safeY1}
            width={W - pad * 2} height={safeY2 - safeY1}
            fill="oklch(70% 0.15 150 / 0.07)"
          />
          {/* safe band borders */}
          <line x1={pad} y1={safeY1} x2={W - pad} y2={safeY1}
            stroke="oklch(70% 0.15 150 / 0.4)" strokeWidth={0.5} strokeDasharray="2 4" />
          <line x1={pad} y1={safeY2} x2={W - pad} y2={safeY2}
            stroke="oklch(70% 0.15 150 / 0.4)" strokeWidth={0.5} strokeDasharray="2 4" />
          {/* sparkline */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pts}
            style={{ filter: `drop-shadow(0 0 3px ${color})`, transition: "stroke 600ms var(--ease-viscous)" }}
          />
          {/* current value dot */}
          <circle
            cx={dotX} cy={dotY} r={3.5}
            fill={color}
            style={{ filter: `drop-shadow(0 0 5px ${color})` }}
          />
        </svg>
      </div>
    </div>
  );
}
