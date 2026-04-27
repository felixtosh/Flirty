import { useEffect, useRef } from "react";

interface Props {
  getVolume: () => number;
  active: boolean;
  color?: string;
}

export default function VoiceVisualizer({ getVolume, active, color = "#ff6b4a" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const vol = getVolume();
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const bars = 5;
      const barWidth = 3;
      const gap = 3;
      const totalWidth = bars * barWidth + (bars - 1) * gap;
      const startX = (w - totalWidth) / 2;

      for (let i = 0; i < bars; i++) {
        const factor = 1 - Math.abs(i - 2) / 3;
        const barHeight = Math.max(4, vol * factor * h * 0.8);
        const x = startX + i * (barWidth + gap);
        const y = (h - barHeight) / 2;

        ctx.fillStyle = color;
        ctx.globalAlpha = 0.6 + vol * 0.4;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 1.5);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [active, getVolume, color]);

  if (!active) return null;

  return <canvas ref={canvasRef} width={40} height={24} className="opacity-80" />;
}
