import { describe, it, expect } from 'vitest';
import { formatLogLine } from './pretty.js';

describe('formatLogLine', () => {
  it('formats a string-level info log (default format)', () => {
    const json = JSON.stringify({ level: 'info', time: '2026-04-11T19:00:00.000Z', msg: 'hello world' });
    const result = formatLogLine(json);
    expect(result).toContain('INFO');
    expect(result).toContain('hello world');
    expect(result).toContain('→');
  });

  it('formats a string-level error log with red coloring', () => {
    const json = JSON.stringify({ level: 'error', time: '2026-04-11T19:00:00.000Z', msg: 'something broke' });
    const result = formatLogLine(json);
    expect(result).toContain('ERROR');
    expect(result).toContain('\x1b[31m'); // red
    expect(result).toContain('something broke');
  });

  it('handles numeric levels for backwards compatibility', () => {
    const json = JSON.stringify({ level: 30, time: Date.now(), msg: 'numeric level' });
    const result = formatLogLine(json);
    expect(result).toContain('INFO');
    expect(result).toContain('numeric level');
  });

  it('handles ISO timestamp strings', () => {
    const json = JSON.stringify({ level: 'info', time: '2026-04-11T12:34:56.789Z', msg: 'test' });
    const result = formatLogLine(json);
    // Should contain a formatted time (exact value depends on locale/TZ)
    expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  it('handles numeric timestamps', () => {
    const json = JSON.stringify({ level: 'info', time: 1712851200000, msg: 'test' });
    const result = formatLogLine(json);
    expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  it('includes namespace in output', () => {
    const json = JSON.stringify({ level: 'info', time: '2026-04-11T19:00:00.000Z', msg: 'test', ns: 'web:auth' });
    const result = formatLogLine(json);
    expect(result).toContain('(web:auth)');
  });

  it('includes extra data fields', () => {
    const json = JSON.stringify({ level: 'info', time: '2026-04-11T19:00:00.000Z', msg: 'req', userId: 42, path: '/api' });
    const result = formatLogLine(json);
    expect(result).toContain('userId');
    expect(result).toContain('42');
  });

  it('excludes internal pino keys from data', () => {
    const json = JSON.stringify({ level: 'info', time: '2026-04-11T19:00:00.000Z', pid: 1, hostname: 'test', msg: 'hi' });
    const result = formatLogLine(json);
    expect(result).not.toContain('"pid"');
    expect(result).not.toContain('"hostname"');
  });

  it('returns original string for non-JSON input', () => {
    expect(formatLogLine('not json')).toBe('not json');
  });

  it('returns empty string for blank input', () => {
    expect(formatLogLine('')).toBe('');
    expect(formatLogLine('  ')).toBe('');
  });

  it('handles all string log levels', () => {
    const levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
    for (const level of levels) {
      const json = JSON.stringify({ level, time: '2026-04-11T19:00:00.000Z', msg: 'test' });
      expect(formatLogLine(json)).toContain(level.toUpperCase());
    }
  });

  it('handles all numeric log levels', () => {
    const levels = [
      { num: 10, label: 'TRACE' },
      { num: 20, label: 'DEBUG' },
      { num: 30, label: 'INFO' },
      { num: 40, label: 'WARN' },
      { num: 50, label: 'ERROR' },
      { num: 60, label: 'FATAL' },
    ];
    for (const { num, label } of levels) {
      const json = JSON.stringify({ level: num, time: Date.now(), msg: 'test' });
      expect(formatLogLine(json)).toContain(label);
    }
  });
});
