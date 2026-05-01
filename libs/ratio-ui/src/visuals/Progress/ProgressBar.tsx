import React from 'react';
import { useProgressAnimation, resolveColor, type ProgressColor } from './useProgressAnimation';

type ProgressBarProps = {
  value: number;
  max: number;
  color?: ProgressColor;
  height?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  color = 'primary',
  height = 8,
  label,
  showValue = true,
  className = '',
}) => {
  const { pct, animated } = useProgressAnimation(value, max);
  const resolvedColor = resolveColor(color);
  const widthPct = `${(animated ? pct : 0) * 100}%`;

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex justify-between mb-1 text-sm">
          {label && (
            <span className="font-medium text-(--text-muted)">{label}</span>
          )}
          {showValue && (
            <span className="text-(--text-subtle)">
              {value} / {max}
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.min(Math.max(value, 0), max)}
        aria-valuemin={0}
        aria-valuemax={max}
        className="w-full overflow-hidden"
        style={{
          height,
          borderRadius: height / 2,
          background: 'var(--color-neutral-50, #f9fafb)',
        }}
      >
        <div
          style={{
            width: widthPct,
            height: '100%',
            borderRadius: height / 2,
            background: `linear-gradient(90deg, ${resolvedColor}, color-mix(in srgb, ${resolvedColor} 80%, transparent))`,
            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
    </div>
  );
};

