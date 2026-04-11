import { describe, it, expect } from 'vitest';
import { formatLogLine } from './pretty.js';

describe('formatLogLine', () => {
  it('formats an info log with message', () => {
    const json = JSON.stringify({ level: 30, time: Date.now(), msg: 'hello world' });
    const result = formatLogLine(json);
    expect(result).toContain('INFO');
    expect(result).toContain('hello world');
    expect(result).toContain('→');
  });

  it('formats an error log with red coloring', () => {
    const json = JSON.stringify({ level: 50, time: Date.now(), msg: 'something broke' });
    const result = formatLogLine(json);
    expect(result).toContain('ERROR');
    expect(result).toContain('\x1b[31m'); // red
    expect(result).toContain('something broke');
  });

  it('includes namespace in output', () => {
    const json = JSON.stringify({ level: 30, time: Date.now(), msg: 'test', ns: 'web:auth' });
    const result = formatLogLine(json);
    expect(result).toContain('(web:auth)');
  });

  it('includes extra data fields', () => {
    const json = JSON.stringify({ level: 30, time: Date.now(), msg: 'req', userId: 42, path: '/api' });
    const result = formatLogLine(json);
    expect(result).toContain('userId');
    expect(result).toContain('42');
  });

  it('excludes internal pino keys from data', () => {
    const json = JSON.stringify({ level: 30, time: 123, pid: 1, hostname: 'test', msg: 'hi' });
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

  it('handles all log levels', () => {
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
