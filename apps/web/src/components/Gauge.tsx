'use client';

import React from 'react';

interface GaugeProps {
  value: number;
  color?: string;
  showLabels?: boolean;
  min?: string;
  max?: string;
}

export const Gauge: React.FC<GaugeProps> = ({
  value,
  color = '#ef4d23',
  showLabels = false,
  min,
  max,
}) => {
  const totalTicks = 40;
  const activeCount = Math.round((Math.max(0, Math.min(100, value)) / 100) * totalTicks);
  const cx = 100;
  const cy = 100;
  const outerR = 80;
  const innerR = 70;

  // 40 tick marks spanning a 180° arc from angle PI to 2*PI
  const ticks = Array.from({ length: totalTicks }, (_, i) => {
    const angle = Math.PI + (i / (totalTicks - 1)) * Math.PI;
    const x1 = cx + innerR * Math.cos(angle);
    const y1 = cy + innerR * Math.sin(angle);
    const x2 = cx + outerR * Math.cos(angle);
    const y2 = cy + outerR * Math.sin(angle);
    const isActive = i < activeCount;

    return {
      id: i,
      x1,
      y1,
      x2,
      y2,
      stroke: isActive ? color : '#d4d4d8',
    };
  });

  return (
    <div className="flex flex-col items-center w-full max-w-[260px] mx-auto">
      <svg viewBox="0 0 200 120" className="w-full h-auto select-none">
        {ticks.map((tick) => (
          <line
            key={tick.id}
            x1={tick.x1.toFixed(2)}
            y1={tick.y1.toFixed(2)}
            x2={tick.x2.toFixed(2)}
            y2={tick.y2.toFixed(2)}
            stroke={tick.stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        ))}
        <text
          x={cx}
          y={105}
          textAnchor="middle"
          fontSize="22"
          fontWeight="600"
          fill="#111827"
          fontFamily="'Inter', sans-serif"
        >
          {value}%
        </text>
      </svg>
      {showLabels && min && max && (
        <div className="flex justify-between items-center text-[11px] text-neutral-500 w-full px-2 mt-0.5">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};
