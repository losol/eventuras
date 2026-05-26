import React from 'react';
import { cn } from '../../utils/cn';
import { Chip } from '../Chip';

/**
 * Pulsing dot + status label. A thin convenience wrapper around
 * `<Chip><Chip.Dot pulse/>…</Chip>` that ships a green success-tinted
 * palette and toggles the pulse based on `status`.
 *
 * Use for connection status (WebSocket, SignalR, SSE), recording / streaming
 * UI, polling monitors, or any "is this happening right now?" affordance.
 *
 * - Dot color reads from `--live-indicator-dot` (defaults to `--success-solid`)
 * - Chip chrome is set locally on the indicator so the surrounding page's
 *   chip tokens aren't polluted
 * - `children` is required so the consumer always wires their own (typically
 *   translated) label — no English defaults that might leak through
 *
 * For other status colors (amber "reconnecting", red "error"), wrap in a
 * container that overrides `--chip-bg/-fg/-border` + `--live-indicator-dot`
 * with the desired semantic palette. For the full power-user case (custom
 * dot color per chip, non-pulsing dots, etc.), compose `<Chip>` and
 * `<Chip.Dot pulse/>` directly.
 *
 * Respects `prefers-reduced-motion` — the pulse animation stops when the
 * user has requested reduced motion.
 *
 * @beta This component is experimental — prop shape may change before release.
 *
 * @example
 * ```tsx
 * // Consumer wires its own (typically translated) label per state.
 * <LiveIndicator status={connected ? 'live' : 'paused'}>
 *   {connected ? 'Connected' : 'Disconnected'}
 * </LiveIndicator>
 *
 * // Re-skin via local CSS-var override (e.g. amber for "reconnecting").
 * // Cast via React.CSSProperties so TS accepts the custom-property keys.
 * <div style={{
 *   '--live-indicator-dot': 'var(--warning-solid)',
 *   '--chip-fg': 'var(--warning-text)',
 *   '--chip-border': 'var(--warning-border)',
 * } as React.CSSProperties}>
 *   <LiveIndicator>Reconnecting</LiveIndicator>
 * </div>
 * ```
 */
export type LiveIndicatorStatus = 'live' | 'paused';

export interface LiveIndicatorProps {
  /** Defaults to `'live'`. Set `'paused'` to dim the dot and stop the pulse. */
  status?: LiveIndicatorStatus;
  /**
   * Visible label. Required — pass your already-translated text so we don't
   * ship hardcoded English defaults that might leak through missed i18n.
   */
  children: React.ReactNode;
  className?: string;
}

// Chip-token overrides — reuse the semantic success palette so the
// indicator stays in sync with future token tweaks and switches with
// the page theme automatically. Set locally on the indicator so we
// don't pollute the page's --chip-* defaults for other chips.
const CHIP_OVERRIDES = [
  '[--chip-bg:var(--success-bg)]',
  '[--chip-fg:var(--success-text)]',
  '[--chip-border:var(--success-border)]',
].join(' ');

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({
  status = 'live',
  children,
  className,
}) => {
  const paused = status === 'paused';
  return (
    <Chip
      className={cn(
        CHIP_OVERRIDES,
        'font-mono text-[11px] font-bold uppercase tracking-[0.14em] px-2.5 py-1',
        paused && '[--chip-fg:var(--text-subtle)]',
        className,
      )}
      role="status"
    >
      <Chip.Dot
        pulse={!paused}
        className={paused ? 'text-(--text-subtle)' : 'text-(--live-indicator-dot)'}
      />
      <span>{children}</span>
    </Chip>
  );
};
LiveIndicator.displayName = 'LiveIndicator';
