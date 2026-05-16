import { useRef, useEffect, useCallback, useState } from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';

interface Entity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: 'player' | 'orb' | 'friction' | 'gate';
  gateNum?: number;
}

export default function GameApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [gates, setGates] = useState(0);
  const entitiesRef = useRef<Entity[]>([]);
  const keysRef = useRef<Record<string, boolean>>({});
  const animRef = useRef<number>(0);

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width;
    const H = canvas.height;

    entitiesRef.current = [
      { x: W / 2, y: H / 2, vx: 0, vy: 0, radius: 8, type: 'player' },
    ];

    // Add orbs
    for (let i = 0; i < 8; i++) {
      entitiesRef.current.push({
        x: 40 + Math.random() * (W - 80),
        y: 40 + Math.random() * (H - 80),
        vx: 0, vy: 0, radius: 5,
        type: 'orb',
      });
    }

    // Add friction zones
    for (let i = 0; i < 3; i++) {
      entitiesRef.current.push({
        x: 60 + Math.random() * (W - 120),
        y: 60 + Math.random() * (H - 120),
        vx: 0, vy: 0, radius: 18,
        type: 'friction',
      });
    }

    // Add gate targets
    const gatePositions = [
      { x: W * 0.2, y: H * 0.2 }, { x: W * 0.8, y: H * 0.2 },
      { x: W * 0.2, y: H * 0.8 }, { x: W * 0.8, y: H * 0.8 },
      { x: W * 0.5, y: H * 0.15 }, { x: W * 0.5, y: H * 0.85 },
    ];
    for (let i = 0; i < gatePositions.length; i++) {
      entitiesRef.current.push({
        x: gatePositions[i].x,
        y: gatePositions[i].y,
        vx: 0, vy: 0, radius: 12,
        type: 'gate',
        gateNum: [43, 23, 10, 34, 14, 57][i],
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resize();

    const handleKey = (e: KeyboardEvent) => { keysRef.current[e.key] = e.type === 'keydown'; };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);

    initGame();

    const loop = () => {
      if (!playing) {
        // Draw title screen
        ctx.fillStyle = '#06040b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        animRef.current = requestAnimationFrame(loop);
        return;
      }

      const W = canvas.width;
      const H = canvas.height;
      ctx.fillStyle = 'rgba(6, 4, 11, 0.3)';
      ctx.fillRect(0, 0, W, H);

      const entities = entitiesRef.current;
      const player = entities.find((e) => e.type === 'player');

      if (player) {
        const speed = 2;
        if (keysRef.current['ArrowUp'] || keysRef.current['w']) player.vy = -speed;
        else if (keysRef.current['ArrowDown'] || keysRef.current['s']) player.vy = speed;
        else player.vy *= 0.9;

        if (keysRef.current['ArrowLeft'] || keysRef.current['a']) player.vx = -speed;
        else if (keysRef.current['ArrowRight'] || keysRef.current['d']) player.vx = speed;
        else player.vx *= 0.9;

        player.x = Math.max(player.radius, Math.min(W - player.radius, player.x + player.vx));
        player.y = Math.max(player.radius, Math.min(H - player.radius, player.y + player.vy));

        // Player glow
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 212, 170, 0.2)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#00d4aa';
        ctx.fill();

        // Collisions
        for (const e of entities) {
          if (e === player) continue;
          const dx = player.x - e.x;
          const dy = player.y - e.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < player.radius + e.radius) {
            if (e.type === 'orb') {
              e.x = 40 + Math.random() * (W - 80);
              e.y = 40 + Math.random() * (H - 80);
              setScore((s) => s + 10);
            } else if (e.type === 'gate') {
              // Gate activation
              e.x = 40 + Math.random() * (W - 80);
              e.y = 40 + Math.random() * (H - 80);
              setScore((s) => s + 50);
              setGates((g) => g + 1);
            } else if (e.type === 'friction') {
              player.vx *= 0.5;
              player.vy *= 0.5;
              setScore((s) => Math.max(0, s - 2));
            }
          }
        }
      }

      // Draw entities
      for (const e of entities) {
        if (e.type === 'player') continue;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        if (e.type === 'orb') {
          ctx.fillStyle = 'rgba(155, 94, 255, 0.8)';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#9b5eff';
        } else if (e.type === 'gate') {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.shadowBlur = 0;
          if (e.gateNum) {
            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(String(e.gateNum), e.x, e.y + 3);
          }
          continue;
        } else if (e.type === 'friction') {
          ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.shadowBlur = 0;
          continue;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
    };
  }, [playing, initGame]);

  const startGame = () => {
    setScore(0);
    setGates(0);
    setPlaying(true);
    initGame();
  };

  const resetGame = () => {
    setScore(0);
    setGates(0);
    setHighScore((h) => Math.max(h, score));
    setPlaying(false);
    initGame();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="text-xs font-mono text-[var(--text-muted)]">
            Score: <span className="text-[var(--accent-light)] font-bold">{score}</span>
          </div>
          <div className="text-xs font-mono text-[var(--text-muted)]">
            Gates: <span className="text-[var(--dim-design)] font-bold">{gates}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1">
            <Trophy size={10} className="text-[var(--dim-design)]" /> {highScore}
          </div>
          {playing ? (
            <button onClick={resetGame} className="btn btn-ghost btn-sm">
              <RotateCcw size={12} /> Reset
            </button>
          ) : (
            <button onClick={startGame} className="btn btn-primary btn-sm">
              <Play size={12} /> Start
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-[var(--bg-void)] rounded-lg border border-[var(--border)] overflow-hidden relative min-h-0">
        <canvas ref={canvasRef} className="w-full h-full" />
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center flex-col bg-[var(--bg-void)]/80">
            <Trophy size={32} className="text-[var(--dim-design)] mb-3" />
            <h3 className="text-lg font-bold text-[var(--text)] mb-1">Gate Navigator</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4 text-center max-w-[250px]">
              Navigate the 64-gate topology. Collect energy orbs, activate gates, and avoid friction zones.
            </p>
            <button onClick={startGame} className="btn btn-primary">
              <Play size={14} /> Start Game
            </button>
            <p className="text-[10px] text-[var(--text-muted)] mt-3">Arrow keys or WASD to move</p>
          </div>
        )}
      </div>
    </div>
  );
}
