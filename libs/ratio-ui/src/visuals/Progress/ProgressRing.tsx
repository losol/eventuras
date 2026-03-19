import React from 'react';
import { useProgressAnimation, resolveColor, type ProgressColor } from './useProgressAnimation';

type ProgressRingProps = {
  value: number;
  max?: number;
  color?: ProgressColor;
  size?: number;
  strokeWidth?: number;
  roundCaps?: boolean;
  label?: string;
  className?: string;
  children?: React.ReactNode;
};

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  max = 100,
  color = 'primary',
  size = 120,
  strokeWidth = 8,
  roundCaps = false,
  label,
  className = '',
  children,
}) => {
  const { pct, animated } = useProgressAnimation(value, max);
  const resolvedColor = resolveColor(color);
  const r = (size - strokeWidth) / 2;
  const C = 2 * Math.PI * r;
  const offset = C - pct * C;

  return (
    <div
      role="meter"
      aria-label={label ?? `${value} of ${max}`}
      aria-valuenow={Math.min(Math.max(value, 0), max)}
      aria-valuemin={0}
      aria-valuemax={max}
      className={`relative inline-flex items-center justify-center ${className}`.trim()}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-neutral-100, #e5e7eb)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={resolvedColor}
          strokeWidth={strokeWidth}
          strokeLinecap={roundCaps ? 'round' : 'butt'}
          strokeDasharray={C}
          strokeDashoffset={animated ? offset : C}
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};

