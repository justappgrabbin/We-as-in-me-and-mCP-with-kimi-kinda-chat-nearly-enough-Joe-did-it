import { useEffect, useRef } from 'react';
import useOSStore from '../store/useOSStore';

interface Node {
  activation: number;
  targetActivation: number;
  gate: number;
  angle: number;
}

export default function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animRef = useRef<number>(0);
  const bootComplete = useOSStore((s) => s.bootComplete);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize 64 nodes
    if (nodesRef.current.length === 0) {
      nodesRef.current = Array.from({ length: 64 }, (_, i) => ({
        activation: Math.random() * 0.3,
        targetActivation: Math.random() * (bootComplete ? 0.8 : 0.3),
        gate: i + 1,
        angle: (i / 64) * Math.PI * 2,
      }));
    }

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.35;

      ctx.clearRect(0, 0, w, h);

      const nodes = nodesRef.current;
      const maxActivation = bootComplete ? 0.8 : 0.3;

      // Update activations
      for (const node of nodes) {
        if (Math.random() < 0.01) {
          node.targetActivation = Math.random() * maxActivation;
        }
        node.activation += (node.targetActivation - node.activation) * 0.02;
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          if (a.activation > 0.5 && b.activation > 0.5) {
            const strength = (a.activation + b.activation) / 2;
            const x1 = cx + Math.cos(a.angle) * radius;
            const y1 = cy + Math.sin(a.angle) * radius;
            const x2 = cx + Math.cos(b.angle) * radius;
            const y2 = cy + Math.sin(b.angle) * radius;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(119, 60, 221, ${strength * 0.15})`;
            ctx.lineWidth = strength * 1.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        const x = cx + Math.cos(node.angle) * radius;
        const y = cy + Math.sin(node.angle) * radius;
        const r = 3 + node.activation * 8;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(119, 60, 221, ${0.3 + node.activation * 0.7})`;
        ctx.fill();

        if (node.activation > 0.6) {
          ctx.beginPath();
          ctx.arc(x, y, r * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 212, 170, ${node.activation * 0.1})`;
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [bootComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}
