import { useMemo } from 'react';

interface Star {
  id: number;
  left: number;
  top: number;
  dur: number;
  op: number;
  delay: number;
}

export default function Starfield() {
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      dur: 2 + Math.random() * 4,
      op: 0.2 + Math.random() * 0.6,
      delay: Math.random() * 4,
    }));
  }, []);

  return (
    <div className="starfield" aria-hidden="true">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            animationDuration: `${star.dur}s`,
            animationDelay: `${star.delay}s`,
            ['--star-op' as string]: star.op,
          }}
        />
      ))}
    </div>
  );
}
