import React from 'react';
import { cn } from '../utils/cn';
import { Chip } from '../core/Chip';
import { LiveIndicator, type LiveIndicatorProps } from '../core/LiveIndicator';
import { ActionButton, type ActionButtonProps } from '../core/ActionButton';
import './Console.css';

/* ──────────────────────────────────────────────────────────────
 * Console — themed terminal-style log / event timeline.
 *
 * A purely presentational compound component. All state lives in
 * the consumer: data, expansion, pause/play, filtering, scroll.
 *
 * Use it for streaming logs, business-event feeds, audit trails,
 * liveblogs — anywhere a chronological, dense, optionally-grouped
 * row list with a terminal feel makes sense.
 * ────────────────────────────────────────────────────────────── */

export type ConsoleTheme = 'light' | 'dark' | 'retro';

export type ConsoleLevel = 'debug' | 'info' | 'success' | 'warning' | 'error';

export type ConsoleLiveStatus = 'live' | 'paused';

export interface ConsoleProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Visual treatment.
   * - `'light'` (default) — Linen surface, serif title, monospace tags
   * - `'dark'` — Linseed-950 surface, serif title, suited for ops dashboards
   * - `'retro'` — CRT phosphor, scanlines, monospace everywhere
   */
  theme?: ConsoleTheme;
  testId?: string;
}

const ConsoleRoot: React.FC<ConsoleProps> = ({
  theme = 'light',
  children,
  className,
  testId,
  ...rest
}) => (
  <section
    {...rest}
    className={cn('console', `--theme-${theme}`, className)}
    data-testid={testId}
  >
    {children}
  </section>
);
ConsoleRoot.displayName = 'Console';

/* ── Title bar ───────────────────────────────────────────── */

export interface ConsoleTitleBarProps {
  children?: React.ReactNode;
  className?: string;
}

const TitleBar: React.FC<ConsoleTitleBarProps> = ({ children, className }) => (
  <div className={cn('console-titlebar', className)}>{children}</div>
);
TitleBar.displayName = 'Console.TitleBar';

export interface ConsoleTitleProps {
  children?: React.ReactNode;
  className?: string;
}

const Title: React.FC<ConsoleTitleProps> = ({ children, className }) => (
  <h2 className={cn('console-title', className)}>{children}</h2>
);
Title.displayName = 'Console.Title';

/**
 * Small environment/scope chip displayed next to the title (e.g. "prod").
 * Renders as a {@link Chip}; the console theme overrides chip tokens so it
 * reads correctly in dark / retro modes.
 */
const Tag: React.FC<ConsoleTitleProps> = ({ children, className }) => (
  <Chip className={cn('console-tag', className)}>
    {children}
  </Chip>
);
Tag.displayName = 'Console.Tag';

/**
 * Re-export of {@link core/LiveIndicator} as `Console.LiveIndicator`. Use either
 * import path; the Console theme overrides the chip tokens so the indicator
 * adopts the surrounding palette automatically.
 */
export type ConsoleLiveIndicatorProps = LiveIndicatorProps;

export interface ConsoleCounterProps {
  children?: React.ReactNode;
  className?: string;
}

/** Trailing counter ("32 events · last 10 min"). Pushed right via margin-left:auto. */
const Counter: React.FC<ConsoleCounterProps> = ({ children, className }) => (
  <span className={cn('console-counter', className)}>{children}</span>
);
Counter.displayName = 'Console.Counter';

/**
 * Re-export of {@link core/ActionButton} as `Console.ActionButton`. The Console
 * theme overrides `--action-button-*` tokens so chrome buttons follow the
 * local palette.
 */
export type ConsoleActionButtonProps = ActionButtonProps;

/* ── Body + group headers ────────────────────────────────── */

export interface ConsoleBodyProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Scrollable container holding the rows. Forwarded ref lets consumers
 * implement their own auto-scroll-to-bottom behavior.
 */
const Body = React.forwardRef<HTMLDivElement, ConsoleBodyProps>(
  ({ children, className }, ref) => (
    <div ref={ref} className={cn('console-body', className)} role="log">
      {children}
    </div>
  ),
);
Body.displayName = 'Console.Body';

export interface ConsoleGroupProps {
  /** Group label (e.g. "18:42"). */
  label: React.ReactNode;
  /** Optional event count — rendered as "· N event(s)" next to the label. */
  count?: number;
  /** Override the auto-rendered count text (e.g. for i18n). */
  countLabel?: React.ReactNode;
  className?: string;
}

const Group: React.FC<ConsoleGroupProps> = ({
  label,
  count,
  countLabel,
  className,
}) => (
  <div className={cn('console-group', className)}>
    <span>{label}</span>
    {(countLabel !== undefined || count !== undefined) && (
      <span className="console-group-count">
        · {countLabel ?? `${count} event${count === 1 ? '' : 's'}`}
      </span>
    )}
  </div>
);
Group.displayName = 'Console.Group';

/* ── Entry rows ──────────────────────────────────────────── */

export interface ConsoleEntryProps {
  /** Render as time string (e.g. "18:42:11.234"). Use a small subcomponent so
   *  the milliseconds can be visually muted; see {@link Time}. */
  timestamp: React.ReactNode;
  /** Severity. Controls the colored badge on the left. */
  level: ConsoleLevel;
  /** Severity label. Defaults to the `level` value uppercased. */
  levelLabel?: React.ReactNode;
  /** Optional source name (e.g. "SignalR"). Hidden on narrow widths. */
  source?: React.ReactNode;
  /** Inline color for the source swatch + label. */
  sourceColor?: string;
  /** Main message. Can include `<b>` and `<code>` for emphasis. */
  message: React.ReactNode;
  /** Right-aligned meta (e.g. duration, actor). */
  meta?: React.ReactNode;
  /** Expanded detail content. When provided, the row is clickable and shows
   *  a chevron that rotates on expand. */
  children?: React.ReactNode;
  /** Whether the expanded content is visible. Fully controlled. */
  expanded?: boolean;
  /** Called when the row is clicked. Receives the new expanded state. */
  onToggle?: (next: boolean) => void;
  className?: string;
  testId?: string;
}

const LEVEL_LABELS: Record<ConsoleLevel, string> = {
  debug: 'debug',
  info: 'info',
  success: 'success',
  warning: 'warn',
  error: 'error',
};

const Entry: React.FC<ConsoleEntryProps> = ({
  timestamp,
  level,
  levelLabel,
  source,
  sourceColor,
  message,
  meta,
  children,
  expanded,
  onToggle,
  className,
  testId,
}) => {
  const interactive = children != null;
  const handleClick = () => {
    if (interactive) onToggle?.(!expanded);
  };
  const rowClassName = cn('console-entry', expanded && '--expanded', className);
  const inner = (
    <>
      <div className="console-entry-time">{timestamp}</div>
      <Chip
        variant="outline"
        className={cn('console-entry-level', `--${level}`)}
      >
        {levelLabel ?? LEVEL_LABELS[level]}
      </Chip>
      {source !== undefined ? (
        <div
          className="console-entry-source"
          style={sourceColor ? { color: sourceColor } : undefined}
        >
          <span className="console-entry-source-swatch" aria-hidden="true" />
          {source}
        </div>
      ) : (
        <div className="console-entry-source" aria-hidden="true" />
      )}
      <div className="console-entry-msg">{message}</div>
      <div className="console-entry-meta">
        {meta !== undefined && <span>{meta}</span>}
        {interactive && (
          <span className="console-entry-chev" aria-hidden="true">
            <Chevron />
          </span>
        )}
      </div>
    </>
  );

  return (
    <>
      {interactive ? (
        <button
          type="button"
          className={rowClassName}
          onClick={handleClick}
          aria-expanded={!!expanded}
          data-testid={testId}
        >
          {inner}
        </button>
      ) : (
        <div
          className={rowClassName}
          data-static="true"
          data-testid={testId}
        >
          {inner}
        </div>
      )}
      {interactive && expanded && (
        <div className="console-entry-expand">{children}</div>
      )}
    </>
  );
};
Entry.displayName = 'Console.Entry';

/** Tabular time rendered with muted milliseconds — pass as `timestamp`. */
const Time: React.FC<{ hhmmss: string; ms?: string; className?: string }> = ({
  hhmmss,
  ms,
  className,
}) => (
  <span className={className}>
    {hhmmss}
    {ms && <span className="console-entry-time-ms">.{ms}</span>}
  </span>
);
Time.displayName = 'Console.Time';

export interface ConsoleEntryDetailProps {
  children?: React.ReactNode;
  className?: string;
}

/** Preformatted detail block (e.g. JSON dump) inside `Entry`'s expand area. */
const EntryDetail: React.FC<ConsoleEntryDetailProps> = ({ children, className }) => (
  <pre className={cn('console-entry-expand-detail', className)}>{children}</pre>
);
EntryDetail.displayName = 'Console.EntryDetail';

/* ── Retro accent ────────────────────────────────────────── */

/** Blinking block cursor — for empty states or banners in `retro` theme. */
const RetroCursor: React.FC<{ className?: string }> = ({ className }) => (
  <span className={cn('console-retro-cursor', className)} aria-hidden="true" />
);
RetroCursor.displayName = 'Console.RetroCursor';

/* ── Built-in chevron (avoids an icon-pack dependency) ───── */

const Chevron: React.FC = () => (
  <svg
    width="12"
    height="12"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="m9 6 6 6-6 6" />
  </svg>
);

/* ── Compound export ─────────────────────────────────────── */

/**
 * Themable, presentational log/event console. Compose with `TitleBar`,
 * `LiveIndicator`, `Body`, `Group`, and `Entry`.
 *
 * @beta This component is experimental — prop shape and visual treatment
 * may change before release.
 *
 * @example
 * ```tsx
 * <Console theme="dark" aria-label="System log">
 *   <Console.TitleBar>
 *     <Console.Title>System log</Console.Title>
 *     <Console.Tag>prod</Console.Tag>
 *     <Console.LiveIndicator status={paused ? 'paused' : 'live'} />
 *     <Console.Counter><b>{events.length}</b> events · last 10 min</Console.Counter>
 *   </Console.TitleBar>
 *   <Console.Body ref={bodyRef}>
 *     <Console.Group label="18:42" count={3} />
 *     {events.map((ev) => (
 *       <Console.Entry
 *         key={ev.id}
 *         timestamp={<Console.Time hhmmss={ev.hhmmss} ms={ev.ms} />}
 *         level={ev.level}
 *         source={ev.source}
 *         message={ev.message}
 *         meta={ev.meta}
 *         expanded={expandedId === ev.id}
 *         onToggle={(next) => setExpandedId(next ? ev.id : null)}
 *       >
 *         <Console.EntryDetail>{JSON.stringify(ev.payload, null, 2)}</Console.EntryDetail>
 *       </Console.Entry>
 *     ))}
 *   </Console.Body>
 * </Console>
 * ```
 */
export const Console = Object.assign(ConsoleRoot, {
  TitleBar,
  Title,
  Tag,
  LiveIndicator,
  Counter,
  ActionButton,
  Body,
  Group,
  Entry,
  Time,
  EntryDetail,
  RetroCursor,
});
