/**
 * Lightweight pretty-print formatter for development.
 * Zero external dependencies — uses ANSI colors and simple formatting.
 *
 * Produces output like:
 *   12:34:56 INFO  (web:auth) → User logged in
 *   12:34:56 ERROR (web:auth) → Failed to authenticate { error: "invalid token" }
 */

import { Writable } from 'node:stream';

const ANSI = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
} as const;

const LEVEL_BY_NUMBER: Record<number, { label: string; color: string; }> = {
  10: { label: 'TRACE', color: ANSI.gray },
  20: { label: 'DEBUG', color: ANSI.cyan },
  30: { label: 'INFO ', color: ANSI.green },
  40: { label: 'WARN ', color: ANSI.yellow },
  50: { label: 'ERROR', color: ANSI.red },
  60: { label: 'FATAL', color: `${ANSI.bold}${ANSI.red}` },
};

const LEVEL_BY_NAME: Record<string, { label: string; color: string; }> = {
  trace: { label: 'TRACE', color: ANSI.gray },
  debug: { label: 'DEBUG', color: ANSI.cyan },
  info:  { label: 'INFO ', color: ANSI.green },
  warn:  { label: 'WARN ', color: ANSI.yellow },
  error: { label: 'ERROR', color: ANSI.red },
  fatal: { label: 'FATAL', color: `${ANSI.bold}${ANSI.red}` },
};

/** Keys excluded from the "extra data" output. */
const INTERNAL_KEYS = new Set([
  'level', 'time', 'pid', 'hostname', 'msg', 'name', 'ns',
]);

function formatTime(time: unknown): string {
  if (typeof time === 'string') {
    // ISO string — extract time portion
    const d = new Date(time);
    return isNaN(d.getTime()) ? '' : d.toLocaleTimeString('en-GB', { hour12: false });
  }
  if (typeof time === 'number') {
    return new Date(time).toLocaleTimeString('en-GB', { hour12: false });
  }
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

function formatData(obj: Record<string, unknown>): string {
  const filtered: Record<string, unknown> = {};
  let hasKeys = false;

  for (const [key, value] of Object.entries(obj)) {
    if (!INTERNAL_KEYS.has(key)) {
      filtered[key] = value;
      hasKeys = true;
    }
  }

  if (!hasKeys) return '';
  return ` ${ANSI.dim}${JSON.stringify(filtered)}${ANSI.reset}`;
}

/**
 * Format a Pino JSON log line into a human-readable string.
 * @param line Raw JSON string from Pino
 * @returns Formatted string, or the original line if parsing fails
 */
export function formatLogLine(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) return '';

  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(trimmed);
  } catch {
    return trimmed;
  }

  const level = obj.level;
  const config = typeof level === 'string'
    ? LEVEL_BY_NAME[level] ?? { label: level.toUpperCase().padEnd(5), color: ANSI.gray }
    : LEVEL_BY_NUMBER[level as number] ?? { label: `L${level}`, color: ANSI.gray };
  const time = formatTime(obj.time);
  const msg = (obj.msg as string) ?? '';
  const ns = (obj.ns as string) || (obj.name as string) || '';

  const nsTag = ns ? ` ${ANSI.magenta}(${ns})${ANSI.reset}` : '';
  const arrow = `${ANSI.dim}→${ANSI.reset}`;
  const data = formatData(obj);

  return `${ANSI.dim}${time}${ANSI.reset} ${config.color}${config.label}${ANSI.reset}${nsTag} ${arrow} ${msg}${data}`;
}

/**
 * Creates a Node.js writable stream that formats Pino JSON output.
 * Used as the destination for PinoTransport when prettyPrint is enabled.
 */
export function createPrettyStream(): NodeJS.WritableStream {
  return new Writable({
    write(chunk: Buffer, _encoding: string, callback: () => void) {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        const formatted = formatLogLine(line);
        if (formatted) {
          process.stdout.write(formatted + '\n');
        }
      }
      callback();
    },
  });
}
