import { useId } from "react";
import { SAFE_LOW, SAFE_HIGH } from "@/hooks/use-planet-store";

interface Props {
  size?: number;
  pressure?: number;
}

export function CherryPlanet({ size = 420, pressure = 500 }: Props) {
  const uid = useId().replace(/:/g, "");
  const craterId = `crater-${uid}`;
  const crackGlowId = `crackGlow-${uid}`;

  const intensity = Math.max(0, Math.min(1, pressure / 1000));
  const inSafe = pressure >= SAFE_LOW && pressure <= SAFE_HIGH;
  const isCritical = pressure > SAFE_HIGH;
  const isLow = pressure < SAFE_LOW;

  // Glow color: blue-ish when low, amber/orange in safe, red when critical
  const glowColor = isCritical
    ? `oklch(55% 0.28 18 / ${0.2 + intensity * 0.45})`
    : isLow
    ? `oklch(55% 0.18 230 / ${0.2 + (1 - intensity) * 0.3})`
    : `oklch(70% 0.25 25 / ${0.15 + intensity * 0.35})`;

  const crackOpacity = Math.max(0, (pressure - 650) / 350);
  const pulseSpeed = isCritical ? "3s" : "8s";

  return (
    <div
      className="relative ease-viscous"
      style={{
        width: size,
        height: size,
        animation: `pulse-syrup ${pulseSpeed} var(--ease-viscous) infinite`,
        filter: isCritical ? `drop-shadow(0 0 ${16 + intensity * 24}px oklch(55% 0.25 18 / 0.7))` : undefined,
      }}
    >
      {/* outer syrup glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          filter: "blur(40px)",
          transform: "scale(1.4)",
          transition: "background 1.5s var(--ease-viscous)",
        }}
      />

      {/* planet body */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: "var(--grad-planet)",
          boxShadow: "var(--shadow-deep), inset -40px -60px 120px oklch(8% 0.02 18 / 0.7), inset 30px 30px 60px oklch(85% 0.2 30 / 0.2)",
        }}
      >
        {/* pitted craters */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-60">
          <defs>
            <radialGradient id={craterId} cx="40%" cy="35%">
              <stop offset="0%" stopColor="oklch(10% 0.04 20)" />
              <stop offset="60%" stopColor="oklch(20% 0.08 20 / 0.7)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <circle cx="65" cy="35" r="8" fill={`url(#${craterId})`} />
          <circle cx="30" cy="55" r="12" fill={`url(#${craterId})`} />
          <circle cx="75" cy="70" r="6" fill={`url(#${craterId})`} />
          <circle cx="50" cy="80" r="5" fill={`url(#${craterId})`} />
          <circle cx="20" cy="25" r="4" fill={`url(#${craterId})`} />
        </svg>

        {/* crack overlay — fades in above 650 PSI */}
        {crackOpacity > 0 && (
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full"
            style={{ opacity: crackOpacity, transition: "opacity 1s var(--ease-viscous)" }}
          >
            <defs>
              <filter id={crackGlowId}>
                <feGaussianBlur stdDeviation="0.6" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <g filter={`url(#${crackGlowId})`} stroke="oklch(65% 0.28 18)" strokeWidth="0.7" fill="none" strokeLinecap="round">
              <path d="M 55 10 L 62 28 L 58 35 L 70 55" />
              <path d="M 62 28 L 75 32" />
              <path d="M 20 40 L 32 52 L 28 65 L 40 80" />
              <path d="M 32 52 L 20 60" />
              <path d="M 48 15 L 44 38 L 50 48" />
              <path d="M 80 20 L 72 40 L 76 55" />
            </g>
            {/* lava glow in cracks */}
            <g stroke="oklch(80% 0.3 30 / 0.6)" strokeWidth="0.4" fill="none" strokeLinecap="round">
              <path d="M 55 10 L 62 28 L 58 35 L 70 55" />
              <path d="M 20 40 L 32 52 L 28 65 L 40 80" />
            </g>
          </svg>
        )}

        {/* viscous highlight */}
        <div
          className="absolute rounded-full"
          style={{
            top: "10%", left: "18%", width: "30%", height: "20%",
            background: "radial-gradient(ellipse, oklch(95% 0.05 60 / 0.5), transparent 70%)",
            filter: "blur(6px)",
          }}
        />
      </div>

      {/* pressure ring — pulses red when critical */}
      {isCritical && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: `2px solid oklch(60% 0.28 18 / ${0.4 + crackOpacity * 0.5})`,
            animation: "pulse-syrup 1.2s ease-in-out infinite",
            boxShadow: `0 0 ${20 + crackOpacity * 40}px oklch(55% 0.28 18 / 0.5)`,
          }}
        />
      )}

      {/* low-pressure frost ring */}
      {isLow && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: "2px solid oklch(60% 0.18 230 / 0.5)",
            animation: "pulse-syrup 4s ease-in-out infinite",
            boxShadow: "0 0 20px oklch(55% 0.18 230 / 0.3)",
          }}
        />
      )}

      {/* stem */}
      <div
        className="absolute"
        style={{
          top: -size * 0.18,
          left: "50%",
          width: 8,
          height: size * 0.22,
          background: "linear-gradient(to bottom, oklch(35% 0.1 130), oklch(20% 0.08 60))",
          borderRadius: 4,
          transform: "translateX(-50%) rotate(-12deg)",
          transformOrigin: "bottom center",
        }}
      />
    </div>
  );
}
