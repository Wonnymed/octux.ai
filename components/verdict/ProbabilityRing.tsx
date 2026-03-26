'use client';

import { motion } from 'framer-motion';
import { EASE_OUT } from '@/lib/motion/constants';

interface ProbabilityRingProps {
  value: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function ProbabilityRing({
  value, color, size = 64, strokeWidth = 4, className,
}: ProbabilityRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, value));
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <div className={className} style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-2"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.3 }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5, ease: EASE_OUT }}
          className="text-lg font-bold tabular-nums"
          style={{ color }}
        >
          {value}%
        </motion.span>
      </div>
    </div>
  );
}
