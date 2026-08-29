import { describe, expect, it } from 'vitest';

import {
  isInWindow,
  localDate,
  type OccasionsConfig,
  parseOccasions,
  resolveOccasion,
} from './occasions';

const at = (iso: string) => new Date(iso);

describe('parseOccasions', () => {
  it('returns null when the block is absent', () => {
    expect(parseOccasions(undefined)).toBeNull();
    expect(parseOccasions(null)).toBeNull();
  });

  it('keeps valid entries and drops invalid ones individually', () => {
    const rejected: string[] = [];
    const config = parseOccasions(
      {
        override: {
          id: 'mourning',
          from: '2026-08-29',
          until: '2026-09-14',
          theme: 'ink',
          colorScheme: 'dark',
        },
        schedule: [
          { id: 'constitution-day', from: '05-16', until: '05-17' },
          { id: 'halloween', from: '10-31', until: '10-31' },
          { id: 'Jul 2026', from: '12-15', until: '12-26' },
          { id: 'pride', from: '2026-06-19' },
          { id: 'christmas', from: '12-15', until: '2026-12-26' },
          { id: 'noir', from: '11-01', until: '11-02', colorScheme: 'sepia' },
          { id: 'retro', from: '11-03', until: '11-04', theme: 'Bureau Theme' },
        ],
      },
      path => rejected.push(path)
    );

    expect(config?.override).toEqual({
      id: 'mourning',
      from: '2026-08-29',
      until: '2026-09-14',
      theme: 'ink',
      colorScheme: 'dark',
    });
    // Any slug is a valid id — which ids get styling is ratio-ui's business — but not free text.
    expect(config?.schedule?.map(s => s.id)).toEqual(['constitution-day', 'halloween']);
    expect(rejected).toEqual([
      'occasions.schedule[2]',
      'occasions.schedule[3]',
      'occasions.schedule[4]',
      'occasions.schedule[5]',
      'occasions.schedule[6]',
    ]);
  });

  it('rejects impossible dates but accepts 29 February in a yearly window', () => {
    const rejected: string[] = [];
    const config = parseOccasions(
      {
        schedule: [
          { id: 'leap', from: '02-28', until: '02-29' },
          { id: 'nope', from: '2026-02-31', until: '2026-03-01' },
          { id: 'nope-2', from: '13-01', until: '13-02' },
        ],
      },
      path => rejected.push(path)
    );
    expect(config?.schedule?.map(s => s.id)).toEqual(['leap']);
    expect(rejected).toEqual(['occasions.schedule[1]', 'occasions.schedule[2]']);
  });

  it('rejects a one-off window whose until is before from, but lets yearly windows wrap', () => {
    const rejected: string[] = [];
    const config = parseOccasions(
      {
        schedule: [
          { id: 'backwards', from: '2026-09-14', until: '2026-08-29' },
          { id: 'new-year', from: '12-31', until: '01-01' },
        ],
      },
      path => rejected.push(path)
    );
    expect(config?.schedule?.map(s => s.id)).toEqual(['new-year']);
    expect(rejected).toEqual(['occasions.schedule[0]']);
  });

  it('treats an explicit null the same as an absent field', () => {
    const rejected: string[] = [];
    const config = parseOccasions(
      {
        timeZone: null,
        override: null,
        schedule: [{ id: 'pride', from: '06-19', until: '06-28', theme: null, colorScheme: null }],
      },
      path => rejected.push(path)
    );
    expect(config).toEqual({ schedule: [{ id: 'pride', from: '06-19', until: '06-28' }] });
    expect(rejected).toEqual([]);
  });

  it('drops an invalid time zone but keeps the rest', () => {
    const rejected: string[] = [];
    const config = parseOccasions(
      { timeZone: 'Mars/Olympus', schedule: [{ id: 'pride', from: '06-19', until: '06-28' }] },
      path => rejected.push(path)
    );
    expect(config).toEqual({ schedule: [{ id: 'pride', from: '06-19', until: '06-28' }] });
    expect(rejected).toEqual(['occasions.timeZone']);
  });

  it('rejects a block or schedule of the wrong shape without throwing', () => {
    const rejected: string[] = [];
    expect(parseOccasions('mourning', path => rejected.push(path))).toBeNull();
    expect(parseOccasions({ schedule: 'pride' }, path => rejected.push(path))).toEqual({});
    expect(rejected).toEqual(['occasions', 'occasions.schedule']);
  });
});

describe('localDate and isInWindow', () => {
  it('reads the calendar date in the configured zone', () => {
    // 23:30 UTC on 16 May is already 17 May in Oslo.
    expect(localDate(at('2026-05-16T23:30:00Z'), 'Europe/Oslo')).toBe('2026-05-17');
    expect(localDate(at('2026-05-16T23:30:00Z'), 'UTC')).toBe('2026-05-16');
  });

  it('treats windows as inclusive and lets yearly windows wrap the year', () => {
    expect(isInWindow('2026-09-14', '2026-08-29', '2026-09-14')).toBe(true);
    expect(isInWindow('2026-09-15', '2026-08-29', '2026-09-14')).toBe(false);
    expect(isInWindow('2027-01-01', '12-31', '01-01')).toBe(true);
    expect(isInWindow('2026-12-31', '12-31', '01-01')).toBe(true);
    expect(isInWindow('2026-12-30', '12-31', '01-01')).toBe(false);
  });
});

describe('resolveOccasion', () => {
  const config: OccasionsConfig = {
    override: {
      id: 'mourning',
      from: '2026-08-29',
      until: '2026-09-14',
      theme: 'ink',
      colorScheme: 'dark',
    },
    schedule: [
      { id: 'constitution-day', from: '05-16', until: '05-17' },
      { id: 'pride', from: '2026-06-19', until: '2026-06-28' },
      { id: 'new-year', from: '12-31', until: '01-01' },
    ],
  };

  it('resolves nothing without config or outside every window', () => {
    expect(resolveOccasion(null)).toBeNull();
    expect(resolveOccasion(config, at('2026-03-01T12:00:00Z'))).toBeNull();
  });

  it('lets the override win over the schedule', () => {
    expect(resolveOccasion(config, at('2026-09-05T12:00:00Z'))).toEqual({
      id: 'mourning',
      theme: 'ink',
      colorScheme: 'dark',
    });
  });

  it('picks the first matching schedule entry, with no theme unless set', () => {
    expect(resolveOccasion(config, at('2026-06-20T12:00:00Z'))).toEqual({
      id: 'pride',
      theme: null,
      colorScheme: null,
    });
  });

  it('applies yearly windows in the site time zone, including across new year', () => {
    expect(resolveOccasion(config, at('2026-05-16T23:30:00Z'))?.id).toBe('constitution-day');
    expect(resolveOccasion({ ...config, timeZone: 'UTC' }, at('2026-05-16T23:30:00Z'))?.id).toBe(
      'constitution-day'
    );
    expect(resolveOccasion(config, at('2027-01-01T10:00:00Z'))?.id).toBe('new-year');
  });
});
