import { describe, it, expect } from 'vitest';
import { PinoTransport } from './pino.js';

describe('PinoTransport', () => {
  it('creates with default options', () => {
    const transport = new PinoTransport();
    expect(transport.pino).toBeDefined();
    expect(transport.pino.level).toBe('info');
  });

  it('respects custom log level', () => {
    const transport = new PinoTransport({ level: 'debug' });
    expect(transport.pino.level).toBe('debug');
  });

  it('logs at the specified level', () => {
    const transport = new PinoTransport({ level: 'trace' });
    // Pino won't throw when we call log methods
    expect(() => {
      transport.log('info', { key: 'value' }, 'test message');
      transport.log('error', { err: 'something' });
      transport.log('trace', {}, 'trace message');
    }).not.toThrow();
  });

  it('creates a child transport with bindings', () => {
    const transport = new PinoTransport();
    const child = transport.child({ namespace: 'test' });

    expect(child).toBeDefined();
    // Child should also implement LogTransport
    expect(child.log).toBeTypeOf('function');
    expect(child.child).toBeTypeOf('function');
  });

  it('child transport chains bindings', () => {
    const transport = new PinoTransport();
    const child = transport.child({ a: 1 }).child({ b: 2 });

    expect(() => {
      child.log('info', {}, 'nested child');
    }).not.toThrow();
  });

  it('flush does not throw', async () => {
    const transport = new PinoTransport();
    await expect(transport.flush()).resolves.toBeUndefined();
  });

  it('accepts raw pinoOptions', () => {
    const transport = new PinoTransport({
      pinoOptions: { name: 'my-app' },
    });
    // Pino stores the name in bindings
    expect(transport.pino).toBeDefined();
  });

  it('configures redaction', () => {
    const transport = new PinoTransport({
      redact: ['password', 'secret'],
    });
    // Pino should be configured — just verify it doesn't error
    expect(() => {
      transport.log('info', { password: 'hunter2', ok: true }, 'redact test');
    }).not.toThrow();
  });
});
