const NUM_STARS = 110;

// Generated once at module load — stable across remounts and HMR.
const STARS = Array.from({ length: NUM_STARS }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 0.6 + Math.random() * 1.4,
  delay: Math.random() * 9,
  duration: 3 + Math.random() * 7,
  opacity: 0.15 + Math.random() * 0.55,
}));

export function StarField() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {STARS.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: `oklch(88% 0.06 60 / ${s.opacity})`,
            animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}
