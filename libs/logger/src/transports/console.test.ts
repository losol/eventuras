import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConsoleTransport } from './console.js';
import type { LogLevel } from '../types.js';

describe('ConsoleTransport', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('maps log levels to correct console methods', () => {
    const transport = new ConsoleTransport();
    const mapping: Record<string, keyof Console> = {
      trace: 'debug',
      debug: 'debug',
      info: 'log',
      warn: 'warn',
      error: 'error',
      fatal: 'error',
    };

    for (const [level, method] of Object.entries(mapping)) {
      const spy = vi.spyOn(console, method as 'log').mockImplementation(() => { });
      transport.log(level as LogLevel, {}, `test ${level}`);
      expect(spy).toHaveBeenCalledWith(`[${level}]`, `test ${level}`);
      spy.mockRestore();
    }
  });

  it('logs message with data', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => { });
    const transport = new ConsoleTransport();

    transport.log('info', { userId: 42 }, 'User logged in');

    expect(spy).toHaveBeenCalledWith('[info]', 'User logged in', { userId: 42 });
  });

  it('logs data without message', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => { });
    const transport = new ConsoleTransport();

    transport.log('info', { userId: 42 });

    expect(spy).toHaveBeenCalledWith('[info]', { userId: 42 });
  });

  it('does not log when data is empty and no message', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => { });
    const transport = new ConsoleTransport();

    transport.log('info', {});

    expect(spy).not.toHaveBeenCalled();
  });

  it('creates child transport with merged bindings', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => { });
    const transport = new ConsoleTransport();
    const child = transport.child({ namespace: 'test' });

    child.log('info', { extra: true }, 'hello');

    expect(spy).toHaveBeenCalledWith('[info]', 'hello', { namespace: 'test', extra: true });
  });

  it('chains child bindings', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => { });
    const transport = new ConsoleTransport();
    const child = transport.child({ a: 1 }).child({ b: 2 });

    child.log('info', { c: 3 }, 'chained');

    expect(spy).toHaveBeenCalledWith('[info]', 'chained', { a: 1, b: 2, c: 3 });
  });
});
