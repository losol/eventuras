/**
 * Occasions: days the site marks without changing what it does — mourning,
 * Pride, Christmas, a national day — configured in the hosted site-settings
 * JSON under `site.occasions`. This module only interprets the config:
 * parsing with per-entry soft failure, and resolving what is active now.
 * Rendering (data-occasion on <html>, the app's occasion CSS) lives elsewhere.
 */

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_MAX_LENGTH = 40;
/** Lowercase slug, safe as a data attribute value. */
export const isSlug = (value: unknown): value is string =>
  typeof value === 'string' && value.length <= SLUG_MAX_LENGTH && SLUG.test(value);

export const COLOR_SCHEMES = ['light', 'dark'] as const;
/** The light/dark axis (`data-color-scheme`), forced while the occasion is active. */
export type ColorScheme = (typeof COLOR_SCHEMES)[number];
export const isColorScheme = (value: unknown): value is ColorScheme =>
  COLOR_SCHEMES.includes(value as ColorScheme);

export interface OccasionConfig {
  /**
   * Free-form slug; ratio-ui decides which ids get styling (today: mourning,
   * pride, christmas, new-year, constitution-day). Unknown ids pass through and
   * style nothing, so adding one never needs an app release. `mourning` is the
   * one id the app itself reacts to (it stops all motion).
   */
  id: string;
  /** `YYYY-MM-DD` for a one-off, `MM-DD` for a yearly window. Inclusive; may wrap the year. */
  from: string;
  until: string;
  /** A named ratio-ui palette (`data-theme`: `bureau`, `ink`, …). Absent = the standard theme. */
  theme?: string;
  colorScheme?: ColorScheme;
}

export interface OccasionsConfig {
  /** IANA zone the dates are read in. @default Europe/Oslo */
  timeZone?: string;
  override?: OccasionConfig;
  schedule?: OccasionConfig[];
}

export interface ResolvedOccasion {
  id: string;
  theme: string | null;
  colorScheme: ColorScheme | null;
}

export const DEFAULT_TIME_ZONE = 'Europe/Oslo';
const FULL_DATE = /^\d{4}-\d{2}-\d{2}$/;
const YEARLY_DATE = /^\d{2}-\d{2}$/;

type Reject = (path: string, reason: string) => void;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/** The first failing check's reason, or `undefined` when everything passes. */
const firstProblem = (checks: [failed: boolean, reason: string][]): string | undefined =>
  checks.find(([failed]) => failed)?.[1];

/** Optional field: absent (`undefined` or an explicit `null`), or passes `isValid`. */
const optional = (value: unknown, isValid: (v: unknown) => boolean) =>
  value == null || isValid(value);

/** A real calendar date; `MM-DD` is checked against a leap year so `02-29` is allowed. */
function isCalendarDate(value: string): boolean {
  const parts = value.split('-').map(Number);
  const [year, month, day] = parts.length === 3 ? parts : [2024, ...parts];
  const date = new Date(Date.UTC(year!, month! - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month! - 1 && date.getUTCDate() === day
  );
}

const bothMatch = (pattern: RegExp, from: unknown, until: unknown) =>
  pattern.test(String(from)) && pattern.test(String(until));

function parseOccasion(input: unknown, path: string, reject: Reject): OccasionConfig | undefined {
  if (!isRecord(input)) {
    reject(path, 'must be an object');
    return undefined;
  }
  const reason = firstProblem([
    [!isSlug(input.id), `id must be a lowercase slug of at most ${SLUG_MAX_LENGTH} characters`],
    [
      !isNonEmptyString(input.from) || !isNonEmptyString(input.until),
      'from and until are required',
    ],
    [
      !bothMatch(FULL_DATE, input.from, input.until) &&
        !bothMatch(YEARLY_DATE, input.from, input.until),
      'from and until must both be YYYY-MM-DD or both be MM-DD',
    ],
    [
      !isCalendarDate(String(input.from)) || !isCalendarDate(String(input.until)),
      'from and until must be real calendar dates',
    ],
    // Yearly windows may wrap the year end on purpose; one-offs must be ordered.
    [
      FULL_DATE.test(String(input.from)) && String(input.from) > String(input.until),
      'until must not be before from',
    ],
    [!optional(input.theme, isSlug), 'theme must be a lowercase slug'],
    [
      !optional(input.colorScheme, isColorScheme),
      `colorScheme must be one of ${COLOR_SCHEMES.join(', ')}`,
    ],
  ]);
  if (reason) {
    reject(path, reason);
    return undefined;
  }
  return {
    id: input.id as string,
    from: input.from as string,
    until: input.until as string,
    ...(input.theme == null ? {} : { theme: input.theme as string }),
    ...(input.colorScheme == null ? {} : { colorScheme: input.colorScheme as ColorScheme }),
  };
}

function parseTimeZone(value: unknown, reject: Reject): string | undefined {
  if (value == null) return undefined;
  if (isNonEmptyString(value) && isValidTimeZone(value)) return value;
  reject('occasions.timeZone', 'must be a valid IANA time zone');
  return undefined;
}

function parseSchedule(value: unknown, reject: Reject): OccasionConfig[] | undefined {
  if (value == null) return undefined;
  if (!Array.isArray(value)) {
    reject('occasions.schedule', 'must be an array');
    return undefined;
  }
  return value
    .map((entry, index) => parseOccasion(entry, `occasions.schedule[${index}]`, reject))
    .filter((entry): entry is OccasionConfig => entry !== undefined);
}

/**
 * Validates `site.occasions`. Invalid entries are reported through `reject`
 * and dropped one by one, so a typo in one entry never takes the others — or
 * the site — down. Returns `null` when the block is absent or not an object.
 */
export function parseOccasions(input: unknown, reject: Reject = () => {}): OccasionsConfig | null {
  if (input === undefined || input === null) return null;
  if (!isRecord(input)) {
    reject('occasions', 'must be an object');
    return null;
  }
  const timeZone = parseTimeZone(input.timeZone, reject);
  const override =
    input.override == null
      ? undefined
      : parseOccasion(input.override, 'occasions.override', reject);
  const schedule = parseSchedule(input.schedule, reject);
  return {
    ...(timeZone === undefined ? {} : { timeZone }),
    ...(override === undefined ? {} : { override }),
    ...(schedule === undefined ? {} : { schedule }),
  };
}

function isValidTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat('en-CA', { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** Calendar date (`YYYY-MM-DD`) of `now` in the given zone. */
export function localDate(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** Inclusive window check; yearly (`MM-DD`) windows may wrap the year end. */
export function isInWindow(today: string, from: string, until: string): boolean {
  if (FULL_DATE.test(from)) return from <= today && today <= until;
  const day = today.slice(5);
  return from <= until ? from <= day && day <= until : day >= from || day <= until;
}

/**
 * The occasion active at `now`: the override if inside its window, else the
 * first matching schedule entry, else `null`.
 */
export function resolveOccasion(
  config: OccasionsConfig | null | undefined,
  now: Date = new Date()
): ResolvedOccasion | null {
  if (!config) return null;
  const today = localDate(now, config.timeZone ?? DEFAULT_TIME_ZONE);
  const active = [config.override, ...(config.schedule ?? [])].find(
    entry => entry && isInWindow(today, entry.from, entry.until)
  );
  return active
    ? { id: active.id, theme: active.theme ?? null, colorScheme: active.colorScheme ?? null }
    : null;
}
