import React, { useRef, useEffect, useState } from 'react';
import { soundEffects } from '../utils/audioSynthesizer';
import { X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LuckyWheelProps {
  isOpen: boolean;
  onClose: () => void;
  spinTickets: number;
  onRewardStars: (stars: number) => void;
  onRewardTicket: () => void;
}

interface Slice {
  label: string;
  color: string;
  stars: number;
  isTicket?: boolean;
  isChallenge?: boolean;
}

const SLICES: Slice[] = [
  { label: '+1 ⭐', color: '#ec4899', stars: 1 },
  { label: '+3 ⭐⭐', color: '#8b5cf6', stars: 3 },
  { label: '🎟️ Thêm Vé', color: '#06b6d4', stars: 0, isTicket: true },
  { label: '+5 ⭐⭐⭐', color: '#3b82f6', stars: 5 },
  { label: '+2 ⭐', color: '#f59e0b', stars: 2 },
  { label: '🎯 Thử Thách', color: '#10b981', stars: 2, isChallenge: true },
];

export const LuckyWheel: React.FC<LuckyWheelProps> = ({
  isOpen,
  onClose,
  spinTickets,
  onRewardStars,
  onRewardTicket,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<string | null>(null);
  const startAngleRef = useRef(0);
  const spinTimeoutRef = useRef<number | null>(null);

  const arc = Math.PI / (SLICES.length / 2);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 300, 300);
    const outsideRadius = 135;
    const textRadius = 95;
    const insideRadius = 32;

    // Draw outer glow ring
    ctx.beginPath();
    ctx.arc(150, 150, outsideRadius + 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#fef3c7';
    ctx.fill();

    // Slices
    for (let i = 0; i < SLICES.length; i++) {
      const angle = startAngleRef.current + i * arc;
      ctx.fillStyle = SLICES[i].color;

      ctx.beginPath();
      ctx.arc(150, 150, outsideRadius, angle, angle + arc, false);
      ctx.arc(150, 150, insideRadius, angle + arc, angle, true);
      ctx.fill();

      // Border between slices
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Nunito, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 4;
      ctx.translate(
        150 + Math.cos(angle + arc / 2) * textRadius,
        150 + Math.sin(angle + arc / 2) * textRadius
      );
      ctx.rotate(angle + arc / 2 + Math.PI / 2);
      const text = SLICES[i].label;
      ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
      ctx.restore();
    }

    // Center circular badge
    ctx.beginPath();
    ctx.arc(150, 150, insideRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('⭐', 140, 156);

    // Top indicator needle pointer
    ctx.save();
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(150 - 12, 150 - (outsideRadius + 10));
    ctx.lineTo(150 + 12, 150 - (outsideRadius + 10));
    ctx.lineTo(150, 150 - (outsideRadius - 16));
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
  };

  useEffect(() => {
    if (isOpen) {
      draw();
    }
    return () => {
      if (spinTimeoutRef.current) {
        cancelAnimationFrame(spinTimeoutRef.current);
      }
    };
  }, [isOpen]);

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonPrize(null);
    soundEffects.playPop();

    let spinTime = 0;
    const spinTimeTotal = Math.random() * 2000 + 3500;
    const spinArcStart = Math.random() * 10 + 16;
    let lastTickAngle = 0;

    const easeOut = (t: number, b: number, c: number, d: number) => {
      const ts = (t /= d) * t;
      const tc = ts * t;
      return b + c * (tc + -3 * ts + 3 * t);
    };

    const rotateWheel = () => {
      spinTime += 30;
      if (spinTime >= spinTimeTotal) {
        // Stop
        setIsSpinning(false);
        const degrees = (startAngleRef.current * 180) / Math.PI + 90;
        const arcd = (arc * 180) / Math.PI;
        const index = Math.floor((360 - (degrees % 360)) % 360 / arcd) % SLICES.length;
        const prize = SLICES[index];

        soundEffects.playVictoryFanfare();
        confetti({
          particleCount: 80,
          spread: 90,
          origin: { y: 0.6 },
        });

        setWonPrize(prize.label);

        if (prize.stars > 0) {
          onRewardStars(prize.stars);
        }
        if (prize.isTicket) {
          onRewardTicket();
        }
        return;
      }

      const spinAngle = spinArcStart - easeOut(spinTime, 0, spinArcStart, spinTimeTotal);
      startAngleRef.current += (spinAngle * Math.PI) / 180;

      // Play tick sound whenever crossing slice
      const currentTickSegment = Math.floor((startAngleRef.current / arc));
      if (currentTickSegment !== lastTickAngle) {
        lastTickAngle = currentTickSegment;
        soundEffects.playTick();
      }

      draw();
      spinTimeoutRef.current = requestAnimationFrame(rotateWheel);
    };

    rotateWheel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border-4 border-amber-300 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-2xl">🎡</span>
          <h2 className="text-xl font-black text-slate-800">VÒNG QUAY MAY MẮN</h2>
        </div>
        <p className="text-xs font-bold text-amber-600 mb-4">
          Cô Tâm tặng bé vé quay may mắn mỗi khi hoàn thành bài nói!
        </p>

        {/* Wheel Canvas */}
        <div className="relative my-2 flex justify-center">
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="w-[260px] h-[260px] drop-shadow-xl"
          />
        </div>

        {/* Prize Notification */}
        {wonPrize && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 font-black text-sm animate-bounce flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Chúc mừng con đã trúng: {wonPrize}!</span>
          </div>
        )}

        {/* Spin action button */}
        <div className="mt-4">
          <button
            onClick={spin}
            disabled={isSpinning}
            className={`w-full py-3.5 px-6 rounded-2xl font-black text-lg text-white shadow-xl flex items-center justify-center gap-2 transition-transform ${
              isSpinning
                ? 'bg-slate-400 cursor-not-allowed opacity-70'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:scale-105 active:scale-95 shadow-amber-500/30'
            }`}
          >
            <span>{isSpinning ? '🌀 ĐANG QUAY...' : '🎯 QUAY NGAY NHẬN THƯỞNG!'}</span>
          </button>
          <p className="text-[11px] font-bold text-slate-400 mt-2">
            Vé quay hiện có: <span className="text-indigo-600 font-black">{spinTickets} vé</span> (Tự động cộng khi luyện nói)
          </p>
        </div>
      </div>
    </div>
  );
};
